// backend/services/authService.js

import User from '../models/user.js';
import OTP from '../models/otp.js';
import { generateOTP, sendOTP } from '../utils/otpUtils.js';

// Import the placeholder/mock utility function
const generateToken = (id) => {
    // This will be replaced by the actual JWT logic in utils/generateToken.js later
    return `MOCK_JWT_TOKEN_FOR_USER_${id}`;
};


class AuthService {

    /**
     * Handles the entire registration flow: checks existence, creates user.
     * @param {Object} userData - name, email, password, phone
     * @returns {Object} - success message and user details
     */
    async registerUser(userData) {
        const { email } = userData;
        
        // 1. Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            // Throwing an error here allows the controller to catch it and send a 400 response
            throw new Error('User already exists');
        }

        // 2. Create the user (Password hashing done by Mongoose middleware)
        const user = await User.create(userData);

        if (!user) {
            throw new Error('Invalid user data received');
        }

        // Return a clean object for the controller to use in the response
        return {
            message: 'Registration successful. Please verify your email with the OTP sent.',
            userId: user._id,
            email: user.email,
        };
    }

    /**
     * Handles sending the verification OTP.
     * @param {string} email 
     * @returns {Object} - success message
     */
    async sendVerificationOTP(email) {
        // 1. Find the user
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('User not found');
        }
        
        // 2. Check if the user is already verified
        if (user.isVerified) {
            throw new Error('User is already verified. Proceed to login.');
        }

        // 3. Generate and save the new OTP
        const otpCode = generateOTP();

        // Remove any old OTPs for this email
        await OTP.deleteMany({ email });

        // Save the new OTP
        await OTP.create({ email, otp: otpCode });

        // 4. Send the OTP via email
        await sendOTP(email, otpCode);

        return {
            message: `A new 6-digit OTP has been sent to ${email}. It is valid for 10 minutes.`,
        };
    }

    /**
     * Handles OTP verification, user activation, and token generation.
     * @param {string} email 
     * @param {string} otp 
     * @returns {Object} - user data and token
     */
    async verifyOTPAndActivate(email, otp) {
        // 1. Find the OTP in the database
        const otpDocument = await OTP.findOne({ email, otp });

        if (!otpDocument) {
            throw new Error('Invalid or expired OTP code.');
        }

        // 2. Find and update the user
        const user = await User.findOne({ email });
        
        if (!user) {
            // Although theoretically impossible if OTP exists, good for robustness
            throw new Error('User not found.'); 
        }

        user.isVerified = true;
        await user.save();

        // 3. Delete the used OTP document
        await OTP.deleteOne({ _id: otpDocument._id });

        // 4. Generate and return user data and token
        return {
            message: 'Email successfully verified. Account activated.',
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            token: generateToken(user._id),
        };
    }

    /**
     * Handles user login authentication and checks verification/block status.
     * @param {string} email 
     * @param {string} password 
     * @returns {Object} - user data and token
     */
    async loginUser(email, password) {
        // 1. Check for user existence
        const user = await User.findOne({ email });

        // Throw vague error for security if user not found or password doesn't match
        if (!user || !(await user.matchPassword(password))) {
            throw new Error('Invalid email or password');
        }

        if (user.isBlock) {
            throw new Error('Access Denied. Your account has been suspended.');
        }

        // 2. Check verification status
        if (!user.isVerified) {
            throw new Error('Account not verified. Please verify your email first.');
        }

        // 3. Login successful
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            token: generateToken(user._id),
        };
    }
}

export default new AuthService();