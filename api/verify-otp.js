const bcrypt = require('bcryptjs');
const { pool, initDatabase } = require('./lib/db.js');
const { 
  getOTPData, 
  getPendingUser, 
  incrementOTPAttempts, 
  deleteOTPAndPendingUser,
  initOTPStorage 
} = require('./lib/otpStorage.js');

// Initialize database and OTP storage
initDatabase();
initOTPStorage();

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
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    const storedOTPData = await getOTPData(email);
    const pendingUser = await getPendingUser(email);
    
    if (!storedOTPData || !pendingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired or not found. Please request a new OTP.' 
      });
    }

    // Check if too many attempts
    if (storedOTPData.attempts >= 3) {
      await deleteOTPAndPendingUser(email);
      return res.status(400).json({ 
        success: false, 
        message: 'Too many failed attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (storedOTPData.otp === otp) {
      try {
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(pendingUser.password, saltRounds);
        
        // Insert user into database
        const insertQuery = `
          INSERT INTO users (name, email, password) 
          VALUES ($1, $2, $3) 
          RETURNING id, name, email
        `;
        
        const result = await pool.query(insertQuery, [
          pendingUser.fullName,
          email,
          hashedPassword
        ]);

        // Clean up stored data
        await deleteOTPAndPendingUser(email);

        res.json({ 
          success: true, 
          message: 'Account created successfully',
          user: {
            id: result.rows[0].id,
            name: result.rows[0].name,
            email: result.rows[0].email
          }
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        if (dbError.code === '23505') { // Unique constraint violation
          res.status(400).json({ 
            success: false, 
            message: 'User with this email already exists' 
          });
        } else {
          res.status(500).json({ 
            success: false, 
            message: 'Failed to create account. Please try again.' 
          });
        }
      }
    } else {
      // Increment attempts
      await incrementOTPAttempts(email);
      
      res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP. Please try again.' 
      });
    }

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP. Please try again.' 
    });
  }
}; 