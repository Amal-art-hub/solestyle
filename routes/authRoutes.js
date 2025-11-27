// backend/routes/authRoutes.js
import express from 'express';
// Import the controller functions (which we will define next)
import { 
  registerUser, 
  sendVerificationOTP, 
  verifyOTPAndActivate, 
  loginUser 
} from '../controllers/authController.js';

const router = express.Router();

// 1. User Registration
// POST /api/auth/register
router.post('/register', registerUser);

// 2. Send OTP to registered but unverified user
// POST /api/auth/send-otp
router.post('/send-otp', sendVerificationOTP);

// 3. Verify OTP and activate the user's account
// POST /api/auth/verify-otp
router.post('/verify-otp', verifyOTPAndActivate);

// 4. User Login
// POST /api/auth/login
router.post('/login', loginUser);


// You can add other auth-related routes here later, like /forgot-password

export default router;