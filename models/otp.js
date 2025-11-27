// models/otp.js
import mongoose from 'mongoose';

const otpSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    // Corresponds to 'code' in your diagram. Storing as String is best practice.
    otp: { 
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // Sets up a TTL (Time To Live) index: document expires after 10 minutes
      expires: 60 * 10,
    },
  },
  {
    timestamps: true, // Includes updatedAt (though often less relevant for temporary OTPs)
  }
);

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;