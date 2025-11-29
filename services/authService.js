// backend/services/authService.js

import User from '../models/user.js';
import OTP from '../models/otp.js';
import { generateOTP, sendOTP } from '../utils/otpUtils.js';

// 1. JWT UTILITY CORRECTION: Import the actual function from the dedicated file
import { generateToken } from '../utils/tokenUtils.js';


class AuthService {

    /**
     * Helper function to handle OTP generation, storage, and email sending.
     * @param {string} email 
     * @returns {Object} - success message and the new OTP document ID
     */
    async _sendOtpToUser(email) {
        console.log("Inside _sendOtpToUser for " + email);
        // 1. Generate a new OTP
        console.log("Generating OTP...");
        const otpCode = generateOTP();
        console.log("OTP generated:", otpCode);

        // 2. Remove any old OTPs for this email (Clean up before creating a new one)
        console.log("Deleting old OTPs...");
        await OTP.deleteMany({ email });
        console.log("Old OTPs deleted");

        // 3. Create a new OTP document
        console.log("Creating new OTP document...");
        const newOTP = await OTP.create({ email, otp: otpCode });
        console.log("OTP document created:", newOTP._id);

        // 4. Send the OTP via email
        console.log("Sending OTP email...");
        await sendOTP(email, otpCode);
        console.log("OTP email sent successfully");

        return {
            message: 'OTP sent successfully',
            otpId: newOTP._id
        };
    }

    /**
     * Handles the entire registration flow: checks existence, creates user.
     * @param {Object} userData - name, email, password, phone
     * @returns {Object} - success message and user details
     */
    async registerUser(userData) {
        console.log("Inside authService.registerUser");
        const { email } = userData;

        // 1. Check if user already exists
        console.log("Checking if user exists...");
        const userExists = await User.findOne({ email });
        console.log("User exists check done. Result:", userExists ? "Found" : "Not Found");

        if (userExists) {
            // Check verification status
            if (userExists.isVerified) {
                // User is fully registered and verified
                throw new Error('User already exists and is verified. Please login.');
            } else {
                // User exists but is unverified: Resend OTP and inform them
                console.log("User exists but unverified. Resending OTP...");
                await this._sendOtpToUser(email);
                return {
                    message: 'Account exists but is unverified. New OTP sent to your email.',
                    userId: userExists._id,
                    email: email
                };
            }
        }

        // 2. Create the new user (Password hashing done by Mongoose middleware)
        console.log("Creating new user...");
        const user = await User.create(userData);
        console.log("User created:", user._id);

        if (!user) {
            throw new Error('Invalid user data received');
        }

        // 3. Send the initial verification OTP
        console.log("Sending initial OTP...");
        await this._sendOtpToUser(email);
        console.log("OTP sending complete, preparing response...");

        // Return a clean object for the controller to use in the response
        return {
            message: 'Registration successful. OTP sent to your email for verification.',
            userId: user._id,
            email: user.email,
        };
    }

    /**
     * Handles sending the verification OTP (Resend flow).
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

        // 3. Generate and send the new OTP using the helper
        await this._sendOtpToUser(email);

        return {
            message: `A new 6-digit OTP has been sent to ${email}. It is valid for 10 minutes.`,
            email: email,
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
            // NOTE: If using TTL index on OTP model, expired codes are automatically deleted, 
            // so this check covers both invalid and expired codes.
            throw new Error('Invalid or expired OTP code.');
        }

        // 2. Find and update the user
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('User associated with OTP not found.');
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
            // Uses the imported generateToken function
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
            // Uses the imported generateToken function
            token: generateToken(user._id),
        };
    }
}

// Export an instance of the class
export default new AuthService();