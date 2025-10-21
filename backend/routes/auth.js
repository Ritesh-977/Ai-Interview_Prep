import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Import our User model

const router = express.Router();

// --- Helper Function: Generate JWT Token ---
const generateToken = (id) => {
  // We'll get JWT_SECRET from our .env file
  // It's a private key that *only* the server knows
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// --- Route 1: POST /api/auth/signup ---
// @desc    Register a new user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Create and save the new user
    // (The 'pre-save' hook in our model will auto-hash the password)
    const user = await User.create({
      name,
      email,
      password,
    });

    // 3. If user created successfully, send back token and user info
    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- Route 2: POST /api/auth/login ---
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await User.findOne({ email });

    // 2. Check if user exists AND if password matches
    // (We use our custom 'comparePassword' method from the model)
    if (user && (await user.comparePassword(password))) {
      // 3. Send back token and user info
      const token = generateToken(user._id);
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      // If user not found or password doesn't match
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;