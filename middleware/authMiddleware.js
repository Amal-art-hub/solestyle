// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/user.js';

/**
 * @desc Protects routes, checking for a valid JWT in the Authorization header.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check if token exists in the header
  // Format is usually: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Extract the token (remove "Bearer" prefix)
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify token
      // jwt.verify takes the token, the secret key, and returns the payload (decoded ID)
      const decoded = jwt.verify(token, process.env.JWT_SECRET); 

      // 4. Find the user by ID from the decoded payload
      // We exclude the password field for security
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401); // Unauthorized
        throw new Error('User not found.');
      }
      
      // Check if user is blocked or unverified
      if (user.isBlock) {
        res.status(403); // Forbidden
        throw new Error('Your account has been blocked by an administrator.');
      }
      if (!user.isVerified) {
        res.status(401);
        throw new Error('Account not verified. Please complete email verification.');
      }

      // 5. Attach user to the request object
      req.user = user;

      // 6. Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      res.status(401); // Unauthorized
      throw new Error('Not authorized, token failed or expired.');
    }
  }

  // If no token is found in the header
  if (!token) {
    res.status(401); // Unauthorized
    throw new Error('Not authorized, no token provided.');
  }
});

// Middleware for checking if the user is an Admin (can be extended later)
// const admin = (req, res, next) => {
//   // Check if the user is authenticated AND has an isAdmin field (you can add this field to your User model later)
//   if (req.user && req.user.isAdmin) {
//     next();
//   } else {
//     res.status(403); // Forbidden
//     throw new Error('Not authorized as an admin.');
//   }
// };


export { protect };