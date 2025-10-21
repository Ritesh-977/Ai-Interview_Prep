// Import necessary packages
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();

// --- Middleware ---
// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// --- Environment Variables ---
// Get the MongoDB connection string and port from .env
// Set default values if they are not found
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// --- "Hello World" Test Route ---
// This is your basic endpoint to check if the server is running
app.get('/', (req, res) => {
  res.send('Hello World! The API is running.');
});

// --- Auth Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// --- Database Connection & Server Start ---
// We use a self-invoking async function to connect to the DB
// and then start the server.
(async () => {
  try {
    // Check if the MONGO_URI is provided
    if (!MONGO_URI) {
      console.error('Error: MONGO_URI is not defined in your .env file');
      process.exit(1); // Exit the process with an error code
    }

    // Attempt to connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully.');

    // Start the Express server only after the DB connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // Log any errors during the connection process
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the process if DB connection fails
  }
})();