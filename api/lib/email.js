const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendOTP = async (toEmail, otpCode) => {
  try {
    await transporter.sendMail({
      from: `"BlogHive Team" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: "Verify Your Email - BlogHive OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #4a90e2;">BlogHive Email Verification</h2>
          <p>Dear User,</p>
          <p>Thank you for signing up on <strong>BlogHive</strong>.</p>
          <p>Please use the following One-Time Password (OTP) to verify your email address:</p>
          <p style="font-size: 20px; font-weight: bold; color: #4a90e2;">${otpCode}</p>
          <p>This code is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>BlogHive Team</strong></p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

const sendNotification = async (toEmail, title, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `"BlogHive Team" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: title,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Error sending notification email:', error);
    return false;
  }
};

module.exports = { sendOTP, sendNotification }; 