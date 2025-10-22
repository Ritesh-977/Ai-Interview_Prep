import express from "express";
import multer from "multer";
import OpenAI from "openai";
import { PdfReader } from "pdfreader";
import Document from "../models/Document.js";
import { protect } from "../middleware/auth.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import path from "path";

// --- Initialize ---
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Helper Function: Get Embedding ---
const getEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.replace(/\n/g, " "),
    });
    return response.data[0].embedding;
  } catch (error) {
    console.warn("OpenAI embedding skipped:", error.message);
    return null; // Return null to indicate embedding failed
  }
};

// --- Helper Function: Chunk Text ---
const chunkText = (text, wordsPerChunk = 500) => {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk).join(" "));
  }
  return chunks;
};

// --- POST /upload ---
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const { type } = req.body;
    if (!type)
      return res.status(400).json({ message: "Document type is required" });

    // --- PDF parsing ---
    const text = await new Promise((resolve, reject) => {
      let fullText = "";
      new PdfReader().parseBuffer(req.file.buffer, (err, item) => {
        if (err) reject(new Error("Error parsing PDF"));
        else if (!item) resolve(fullText);
        else if (item.text) fullText += item.text + " ";
      });
    });

    if (!text)
      return res
        .status(400)
        .json({ message: "Could not extract text from PDF" });

    // --- Upload to Cloudinary ---
    const fileName = path.parse(req.file.originalname).name;

    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      public_id: fileName, // Use the name without the extension
      resource_type: "raw",
      format: 'pdf',
    });

    const fileUrl = uploadResult.secure_url;

    // --- Chunk text ---
    const textChunks = chunkText(text);
    const chunksWithEmbeddings = [];
    let embeddingFailed = false;

    // --- Create embeddings with safe fallback ---
    for (const textChunk of textChunks) {
      const embedding = await getEmbedding(textChunk);
      if (!embedding) embeddingFailed = true;
      chunksWithEmbeddings.push({
        text: textChunk,
        embedding: embedding || [], // empty if failed
      });
    }

    // --- Save to MongoDB ---
    const document = new Document({
      userId: req.user._id,
      type,
      fileName: req.file.originalname,
      fileUrl,
      chunks: chunksWithEmbeddings,
      embeddingFailed, // <-- Store if embeddings failed
    });

    await document.save();

    res.status(201).json({
      message: "Document uploaded and processed successfully",
      document,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res
      .status(500)
      .json({ message: "Server error during upload", error: error.message });
  }
});

// --- GET /list ---
router.get("/list", protect, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .select("-chunks")
      .sort({ createdAt: -1 });

    res.status(200).json(documents);
  } catch (error) {
    console.error("List Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- DELETE /:id ---
router.delete("/:id", protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document)
      return res.status(404).json({ message: "Document not found" });
    if (document.userId.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    await document.deleteOne();
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
