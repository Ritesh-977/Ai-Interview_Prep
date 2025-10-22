import mongoose from 'mongoose';

const ChunkSchema = new mongoose.Schema({
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
});

const DocumentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['resume', 'jd'], required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    chunks: [ChunkSchema],
    embeddingFailed: { type: Boolean, default: false }, // <-- New field
  },
  { timestamps: true }
);

const Document = mongoose.model('Document', DocumentSchema);

export default Document;
