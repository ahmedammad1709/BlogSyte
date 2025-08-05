const { sendOTP } = require('./lib/email.js');
const { pool, initDatabase } = require('./lib/db.js');
const { storeOTP, storePendingUser, initOTPStorage } = require('./lib/otpStorage.js');

// Initialize database and OTP storage
initDatabase();
initOTPStorage();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { email, fullName, password } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    
    // Store OTP and pending user in database
    const otpStored = await storeOTP(email, otp);
    const userStored = await storePendingUser(email, fullName, password);
    
    if (!otpStored || !userStored) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to store OTP data. Please try again.' 
      });
    }

    // Send OTP via email
    const emailSent = await sendOTP(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP email. Please try again.' 
      });
    }

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      email: email
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP. Please try again.' 
    });
  }
}; 