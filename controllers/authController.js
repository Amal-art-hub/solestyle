// backend/controllers/authController.js

import asyncHandler from 'express-async-handler';
// 1. IMPORT THE SERVICE (This is correct)
import authService from '../services/authService.js';


/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
    console.log("Inside registerUser controller");
    // Controller only extracts data
    const { name, email, password, phone } = req.body;

    try {
        // CALL THE SERVICE
        console.log("authService object:", authService);
        console.log("authService.registerUser:", authService.registerUser);
        const result = await authService.registerUser({ name, email, password, phone });
        console.log("Service returned successfully:", result);

        // SEND SUCCESS RESPONSE (201 Created)
        res.status(201).json({
            success: true,
            ...result, // Spreads message, userId, email from the service result
        });
    } catch (error) {
        console.error("ERROR in registerUser controller:");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        throw error; // Re-throw for asyncHandler to handle
    }
});


/**
 * @desc    Send verification OTP to a registered but unverified user
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendVerificationOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // CALL THE SERVICE
    const result = await authService.sendVerificationOTP(email);

    // SEND SUCCESS RESPONSE (200 OK)
    res.status(200).json({
        success: true,
        ...result, // Spreads the success message
    });
});


/**
 * @desc    Verify OTP and activate the user's account
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTPAndActivate = asyncHandler(async (req, res) => {

    
       console.log("---- VERIFY OTP REQUEST BODY ----");
    console.log("req.body =", req.body);
    console.log("Email received =", req.body.email);
    console.log("OTP received =", req.body.otp);


    const { email, otp } = req.body;

    // CALL THE SERVICE
    const result = await authService.verifyOTPAndActivate(email, otp);

    // SEND SUCCESS RESPONSE (200 OK)
    res.status(200).json({
        success: true,
        ...result, // Spreads all user data and token
    });
});


/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // CALL THE SERVICE
    const result = await authService.loginUser(email, password);

    // SEND SUCCESS RESPONSE (200 OK)
    res.status(200).json({
        success: true,
        ...result, // Spreads user data and token
    });
});


export {
    registerUser,
    sendVerificationOTP,
    verifyOTPAndActivate,
    loginUser
};