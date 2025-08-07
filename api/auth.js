const bcrypt = require('bcryptjs');
const { sendOTP, sendForgotPasswordOTP } = require('./lib/email.js');
const { pool, initDatabase } = require('./lib/db.js');
const { 
  storeOTP, 
  storePendingUser, 
  getOTPData, 
  getPendingUser, 
  incrementOTPAttempts, 
  deleteOTPAndPendingUser,
  initOTPStorage 
} = require('./lib/otpStorage.js');

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

  // Allow POST and DELETE requests
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    if (req.method === 'POST') {
      const { action, email, password, fullName, otp } = req.body;
      
      if (!action) {
        return res.status(400).json({ 
          success: false, 
          message: 'Action is required (login, send-otp, verify-otp)' 
        });
      }

      switch (action) {
        case 'login':
          return await handleLogin(req, res, email, password);
        
        case 'send-otp':
          return await handleSendOTP(req, res, email, fullName, password);
        
        case 'verify-otp':
          return await handleVerifyOTP(req, res, email, otp);
        
        case 'forgot-password-send-otp':
          return await handleForgotPasswordSendOTP(req, res, email);
        
        case 'forgot-password-verify-otp':
          return await handleForgotPasswordVerifyOTP(req, res, email, otp);
        
        case 'forgot-password-reset':
          return await handleForgotPasswordReset(req, res, email, otp, req.body.newPassword);
        
        default:
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid action. Use: login, send-otp, verify-otp, forgot-password-send-otp, forgot-password-verify-otp, or forgot-password-reset' 
          });
      }
      } else if (req.method === 'DELETE') {
    // Handle delete account request
    console.log('DELETE request received for account deletion');
    const { userId, password } = req.body;
    console.log('Request body:', { userId, password: password ? '[HIDDEN]' : 'undefined' });
    
    if (!userId || !password) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'User ID and password are required'
      });
    }

    return await handleDeleteAccount(req, res, userId, password);
  }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed. Please try again.' 
    });
  }
};

async function handleLogin(req, res, email, password) {
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }

  // Find user by email
  const userQuery = 'SELECT id, name, email, password, banned, banned_at, is_admin FROM users WHERE email = $1';
  const userResult = await pool.query(userQuery, [email]);

  if (userResult.rows.length === 0) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid email or password' 
    });
  }

  const user = userResult.rows[0];

  // Check if user is banned
  if (user.banned) {
    return res.status(403).json({ 
      success: false, 
      message: 'Your account has been banned by the administrator. Please contact admin for support.' 
    });
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid email or password' 
    });
  }

  // Return user data (without password)
  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.is_admin || false
    }
  });
}

async function handleSendOTP(req, res, email, fullName, password) {
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
}

async function handleVerifyOTP(req, res, email, otp) {
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
}

async function handleForgotPasswordSendOTP(req, res, email) {
  if (!email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email is required' 
    });
  }

  // Check if user exists
  const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'No account found with this email address' 
    });
  }

  // Generate 6-digit OTP
  const otp = generateOTP();
  
  // Store OTP for password reset
  const otpStored = await storeOTP(email, otp);
  
  if (!otpStored) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to store OTP data. Please try again.' 
    });
  }

  // Send OTP via email
  const emailSent = await sendForgotPasswordOTP(email, otp);
  
  if (!emailSent) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP email. Please try again.' 
    });
  }

  res.json({ 
    success: true, 
    message: 'Password reset OTP sent successfully',
    email: email
  });
}

async function handleForgotPasswordVerifyOTP(req, res, email, otp) {
  if (!email || !otp) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and OTP are required' 
    });
  }

  const storedOTPData = await getOTPData(email);
  
  if (!storedOTPData) {
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
    res.json({ 
      success: true, 
      message: 'OTP verified successfully'
    });
  } else {
    // Increment attempts
    await incrementOTPAttempts(email);
    
    res.status(400).json({ 
      success: false, 
      message: 'Invalid OTP. Please try again.' 
    });
  }
}

async function handleForgotPasswordReset(req, res, email, otp, newPassword) {
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email, OTP, and new password are required' 
    });
  }

  const storedOTPData = await getOTPData(email);
  
  if (!storedOTPData) {
    return res.status(400).json({ 
      success: false, 
      message: 'OTP expired or not found. Please request a new OTP.' 
    });
  }

  // Verify OTP again
  if (storedOTPData.otp !== otp) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid OTP. Please try again.' 
    });
  }

  try {
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update user password in database
    const updateQuery = `
      UPDATE users 
      SET password = $1 
      WHERE email = $2 
      RETURNING id, name, email
    `;
    
    const result = await pool.query(updateQuery, [hashedPassword, email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Clean up stored OTP data
    await deleteOTPAndPendingUser(email);

    res.json({ 
      success: true, 
      message: 'Password reset successfully',
      user: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email
      }
    });
  } catch (dbError) {
    console.error('Database error:', dbError);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password. Please try again.' 
    });
  }
}

async function handleDeleteAccount(req, res, userId, password) {
  try {
    console.log('handleDeleteAccount called with userId:', userId);
    
    // Get user from database
    const userQuery = 'SELECT id, name, email, password FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [userId]);
    console.log('User query result:', userResult.rows.length > 0 ? 'User found' : 'User not found');

    if (userResult.rows.length === 0) {
      console.log('User not found in database');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];
    console.log('User found:', { id: user.id, name: user.name, email: user.email });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password provided');
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Check if user has any data that might cause issues
    const userDataCheck = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM blog_posts WHERE author_id = $1) as blog_count,
        (SELECT COUNT(*) FROM likes WHERE user_id = $1) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE user_id = $1) as comments_count
    `, [userId]);
    
    console.log('User data check:', userDataCheck.rows[0]);

    console.log('Starting account deletion process...');
    
    try {
      // Use a transaction to ensure data consistency
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Since we have CASCADE constraints, we can directly delete the user
        // All related data (blog posts, likes, comments, views) will be automatically deleted
        const deleteUserResult = await client.query('DELETE FROM users WHERE id = $1', [userId]);
        console.log('Deleted user:', deleteUserResult.rowCount);
        
        if (deleteUserResult.rowCount === 0) {
          throw new Error('User was not deleted - no rows affected');
        }
        
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (dbError) {
      console.error('Database deletion error:', dbError);
      throw new Error(`Database error during deletion: ${dbError.message}`);
    }

    console.log('Account deletion completed successfully');
    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return res.status(500).json({
      success: false,
      message: `Failed to delete account: ${error.message}`
    });
  }
}