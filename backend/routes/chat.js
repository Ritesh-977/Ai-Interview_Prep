import express from 'express';
import OpenAI from 'openai';
import Document from '../models/Document.js'; // To find Resume/JD
import Chat from '../models/Chat.js';       // To save chat history
import { protect } from '../middleware/auth.js';
import cosineSimilarity from 'cosine-similarity';

// --- Initialize ---
const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Helper Function: Get Embedding ---
// (We already have this in documents.js, but it's cleaner to have it here too)
const getEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.replace(/\n/g, ' '),
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error getting embedding:', error.message);
    throw new Error('Failed to get embedding from OpenAI');
  }
};

// --- Route 1: POST /api/chat/start ---
// @desc    Start a new chat session, get initial questions
// @access  Protected
router.post('/start', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Find the user's latest Resume and JD
    const resume = await Document.findOne({ userId, type: 'resume' }).sort({ createdAt: -1 });
    const jd = await Document.findOne({ userId, type: 'jd' }).sort({ createdAt: -1 });

    if (!resume || !jd) {
      return res.status(404).json({ message: 'Resume and/or JD not found. Please upload both.' });
    }

    // 2. Concatenate all text chunks from the JD
    const jdText = jd.chunks.map((chunk) => chunk.text).join(' ');

    // 3. Call OpenAI to generate 3 questions from the JD
    const prompt = `Based on the following Job Description, generate exactly 3 technical or behavioral interview questions.
    Return the questions as a single string, with each question separated by a newline character (\\n).
    
    Job Description:
    """
    ${jdText}
    """`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // A fast and capable model
      messages: [{ role: 'system', content: prompt }],
      max_tokens: 200,
    });

    const questionsString = response.choices[0].message.content;

    // 4. Create and save the new chat session
    const newChat = new Chat({
      userId,
      resumeId: resume._id,
      jdId: jd._id,
      messages: [
        { role: 'system', content: 'Chat session started.' },
        { role: 'assistant', content: questionsString }, // Save questions
      ],
    });

    await newChat.save();

    // 5. Send the new chat object (including questions) back
    res.status(201).json(newChat);
  } catch (error) {
    console.error('Chat Start Error:', error);
    res.status(500).json({ message: 'Server error starting chat' });
  }
});

// --- Route 2: POST /api/chat/query ---
// @desc    Send a user message, get AI feedback (RAG)
// @access  Protected
router.post('/query', protect, async (req, res) => {
  try {
    const { chatId, message, question } = req.body; // 'question' is the one they're answering
    const userId = req.user._id;

    // 1. Find the chat session
    const chat = await Chat.findById(chatId);
    if (!chat || chat.userId.toString() !== userId.toString()) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // 2. Find the user's resume associated with this chat
    const resume = await Document.findById(chat.resumeId);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found for this chat' });
    }

    // --- RAG (Retrieval-Augmented Generation) Logic ---
    // 3. Get embedding for the user's answer
    const queryEmbedding = await getEmbedding(message);

    // 4. Find the most relevant chunks from the resume
    let relevantChunks = [];
    if (resume.chunks && resume.chunks.length > 0) {
      // Calculate similarity for each chunk
      const similarities = resume.chunks.map(chunk => ({
        text: chunk.text,
        similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
      }));

      // Sort by similarity and get the top 2
      relevantChunks = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 2)
        .map(chunk => chunk.text);
    }
    const context = relevantChunks.join('\n\n');
    // --- End of RAG Logic ---


    // 5. Build the prompt for the AI evaluator
    const prompt = `You are an expert technical interviewer.
    A candidate was asked the following question:
    """
    ${question}
    """
    
    The candidate gave this answer:
    """
    ${message}
    """
    
    Here is the *only* context you have from their resume:
    """
    ${context.length > 0 ? context : 'No relevant resume context was found.'}
    """
    
    Please evaluate the candidate's answer based *only* on their response and the provided resume context.
    
    Your response MUST be in this exact format:
    SCORE: [Your score from 1-10]
    FEEDBACK: [Your feedback in 100 words or less. Be constructive. Explain *why* you gave the score, referencing the resume context if possible.]
    `;

    // 6. Call OpenAI to get the evaluation
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }],
      max_tokens: 200,
    });

    const aiResponse = response.choices[0].message.content;

    // 7. Parse the SCORE and FEEDBACK
    let score = 5; // Default score
    let feedback = aiResponse; // Default feedback

    const scoreMatch = aiResponse.match(/SCORE: (\d+(\.\d+)?)/);
    const feedbackMatch = aiResponse.match(/FEEDBACK: (.*)/s);

    if (scoreMatch) {
      score = parseFloat(scoreMatch[1]);
    }
    if (feedbackMatch) {
      feedback = feedbackMatch[1].trim();
    }

    // 8. Save messages to the chat history
    chat.messages.push({ role: 'user', content: message });
    chat.messages.push({ role: 'assistant', content: feedback, score: score });
    await chat.save();

    // 9. Send the latest assistant message back
    res.status(200).json(chat.messages[chat.messages.length - 1]);

  } catch (error) {
    console.error('Chat Query Error:', error);
    res.status(500).json({ message: 'Server error processing message' });
  }
});

export default router;