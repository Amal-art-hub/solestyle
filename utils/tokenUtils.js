// backend/utils/tokenUtils.js

import jwt from 'jsonwebtoken';

/**
 * Generates a JSON Web Token (JWT) for the authenticated user.
 * @param {string} id - The MongoDB ObjectId of the user.
 * @returns {string} The generated JWT.
 */
export const generateToken = (id) => {
    // Uses the secret key from your .env file
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};