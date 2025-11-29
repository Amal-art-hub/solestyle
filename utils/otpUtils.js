// backend/utils/otpUtils.js

import nodemailer from 'nodemailer';

/**
 * 1. Generates a random 6-digit numeric OTP.
 * @returns {string} The generated OTP as a string.
 */
export const generateOTP = () => {
  // Generate a random 6-digit number between 100000 and 999999
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};


/**
 * 2. Sends the generated OTP to the specified email address using nodemailer.
 * @param {string} email - The recipient's email address.
 * @param {string} otp - The 6-digit OTP code to send.
 */
export const sendOTP = async (email, otp) => {
  try {
    console.log("====================================================");
    console.log("📧 OTP GENERATED FOR:", email);
    console.log("🔑 OTP CODE:", otp);
    console.log("====================================================");

    // Check if we're in production mode
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
      // DEVELOPMENT MODE: Just log the OTP, don't send email
      console.log("⚠️  DEVELOPMENT MODE: Email not sent. Use the OTP above for testing.");
      console.log("====================================================");
      return; // Skip email sending
    }

    // PRODUCTION MODE: Send actual email
    console.log("📤 Sending email to:", email);

    // 1. Create a transporter object using the default SMTP transport (using environment variables)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use 'gmail' for simplicity, or configure a specific host
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address from .env
        pass: process.env.EMAIL_PASS, // Your App Password from .env
      },
    });

    // 2. Setup email data
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'SoleStyle: Your One-Time Password (OTP) for Verification',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333;">SoleStyle Account Verification</h2>
          <p>Hi,</p>
          <p>Thank you for registering with SoleStyle. Please use the following One-Time Password (OTP) to verify your account:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #007bff; background-color: #f0f8ff; padding: 10px 20px; border-radius: 5px; border: 1px dashed #007bff;">${otp}</span>
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong> and can only be used once.</p>
          <p>If you did not request this, please ignore this email.</p>
          <p>Thanks,<br>The SoleStyle Team</p>
        </div>
      `,
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}`);
    console.log("====================================================");

  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    // Depending on your error handling, you might want to re-throw the error
    throw new Error('Failed to send verification email.');
  }
};