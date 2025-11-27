// backend/controllers/authController.js (THE NEW VERSION)

import asyncHandler from 'express-async-handler';
// 1. IMPORT THE SERVICE and remove all other model/utility imports
import authService from '../services/authService.js'; 

// NOTE: We remove the imports for User, OTP, generateOTP, sendOTP, and generateToken
// as the service now handles those dependencies.

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
    // Controller only extracts data and handles the response logic
    const { name, email, password, phone } = req.body;

    // 2. CALL THE SERVICE
    // The service handles all the database and validation logic.
    try {
        const result = await authService.registerUser({ name, email, password, phone });
        
        // 3. SEND SUCCESS RESPONSE
        res.status(201).json({
            success: true,
            ...result, // Spreads message, userId, email from the service result
        });
    } catch (error) {
        // The service throws specific errors, which we catch and re-throw with the correct status code
        res.status(400); 
        throw new Error(error.message);
    }
});

/**
 * @desc    Send verification OTP to a registered but unverified user
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendVerificationOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    try {
        // 2. CALL THE SERVICE
        const result = await authService.sendVerificationOTP(email);
        
        // 3. SEND SUCCESS RESPONSE
        res.status(200).json({
            success: true,
            ...result, // Spreads the success message
        });
    } catch (error) {
        // Handle 404 and 400 errors thrown by the service
        res.status(error.message.includes('not found') ? 404 : 400); 
        throw new Error(error.message);
    }
});


/**
 * @desc    Verify OTP and activate the user's account
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTPAndActivate = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    
    try {
        // 2. CALL THE SERVICE
        const result = await authService.verifyOTPAndActivate(email, otp);

        // 3. SEND SUCCESS RESPONSE
        res.status(200).json({
            success: true,
            ...result, // Spreads all user data and token
        });
    } catch (error) {
        // Handle invalid OTP or user not found errors
        res.status(400); 
        throw new Error(error.message);
    }
});


/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
        // 2. CALL THE SERVICE
        const result = await authService.loginUser(email, password);

        // 3. SEND SUCCESS RESPONSE
        res.status(200).json({
            success: true,
            ...result, // Spreads user data and token
        });
    } catch (error) {
        // Handle authentication errors (Invalid credentials, blocked, not verified)
        res.status(401); 
        throw new Error(error.message);
    }
});


export { 
    registerUser, 
    sendVerificationOTP, 
    verifyOTPAndActivate, 
    loginUser 
};