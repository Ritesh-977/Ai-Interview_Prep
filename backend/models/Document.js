import mongoose from 'mongoose';

// This sub-schema will store one chunk of text and its corresponding vector
const chunkSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number], // An array of numbers (the vector embedding)
    required: true,
  },
});

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Links this document to a specific user
      required: true,
    },
    type: {
      type: String,
      enum: ['resume', 'jd'], // Can only be 'resume' or 'jd'
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String, // The URL from Cloudinary
      required: true,
    },
    chunks: [chunkSchema], // An array of text/embedding chunks
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);

export default Document;