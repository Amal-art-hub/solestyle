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
    console.log("\n=== REGISTER USER REQUEST STARTED ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    const { name, email, password, phone } = req.body;

    try {
        console.log("\n[1/3] Calling authService.registerUser...");
        const result = await authService.registerUser({ name, email, password, phone });
        console.log("\n[3/3] authService.registerUser completed successfully");
        console.log("Result:", JSON.stringify(result, null, 2));

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

    // Save token in cookie
    res.cookie("token", result.token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Redirect to HOME page
    return res.redirect('/');
});


export {
    registerUser,
    sendVerificationOTP,
    verifyOTPAndActivate,
    loginUser
};









// // backend/controllers/authController.js

// import asyncHandler from 'express-async-handler';
// import authService from '../services/authService.js';

// /**
//  * @desc    Register a new user
//  * @route   POST /api/auth/register
//  * @access  Public
//  */
// const registerUser = asyncHandler(async (req, res) => {
//     const { name, email, password, phone } = req.body;

//     console.log("📩 Register Request Received:", req.body);

//     const result = await authService.registerUser({ name, email, password, phone });

//     // Redirect to OTP verification page
//     return res.redirect(`/verify?email=${email}`);
// });


// /**
//  * @desc    Send verification OTP to user
//  * @route   POST /api/auth/send-otp
//  * @access  Public
//  */
// const sendVerificationOTP = asyncHandler(async (req, res) => {
//     const { email } = req.body;

//     const result = await authService.sendVerificationOTP(email);

//     res.status(200).json({
//         success: true,
//         ...result
//     });
// });


// /**
//  * @desc    Verify OTP and activate the user's account
//  * @route   POST /api/auth/verify-otp
//  * @access  Public
//  */
// const verifyOTPAndActivate = asyncHandler(async (req, res) => {
//     const { email, otp } = req.body;

//     console.log("🔍 Verifying OTP for:", email, otp);

//     await authService.verifyOTPAndActivate(email, otp);

//     // Redirect to login page with success message
//     return res.redirect('/login?success=Account Verified Successfully');
// });


// /**
//  * @desc    Authenticate user & redirect after login
//  * @route   POST /api/auth/login
//  * @access  Public
//  */
// const loginUser = asyncHandler(async (req, res) => {
//     const { email, password } = req.body;

//     const result = await authService.loginUser(email, password);

//     // Save token in cookie
//     res.cookie("token", result.token, {
//         httpOnly: true,
//         secure: false,
//         sameSite: "lax"
//     });

//     // Redirect to HOME page
//     return res.redirect('/');
// });


// export {
//     registerUser,
//     sendVerificationOTP,
//     verifyOTPAndActivate,
//     loginUser
// };
