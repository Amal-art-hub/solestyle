// models/otp.js

import mongoose from 'mongoose';

const otpSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        otp: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }
);

// TTL index – auto delete after 10 mins
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
