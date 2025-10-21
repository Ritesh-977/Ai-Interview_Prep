import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  // Check if the 'Authorization' header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 1. Get the token from the header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token using our JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find the user by the ID from the token
      // We attach this user object to the 'req'
      // so our protected routes can access it
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // 4. Continue to the next function (the actual route)
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };