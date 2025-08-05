const { pool } = require('./db.js');

// Create OTP storage table
const createOTPTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_storage (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      );
    `);
    console.log('OTP storage table created or already exists');
  } catch (error) {
    console.error('Error creating OTP storage table:', error);
  }
};

// Create pending users table
const createPendingUsersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      );
    `);
    console.log('Pending users table created or already exists');
  } catch (error) {
    console.error('Error creating pending users table:', error);
  }
};

// Initialize tables
const initOTPStorage = async () => {
  await createOTPTable();
  await createPendingUsersTable();
};

// Store OTP
const storeOTP = async (email, otp) => {
  try {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // Delete any existing OTP for this email
    await pool.query('DELETE FROM otp_storage WHERE email = $1', [email]);
    
    // Insert new OTP
    await pool.query(
      'INSERT INTO otp_storage (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt]
    );
    
    return true;
  } catch (error) {
    console.error('Error storing OTP:', error);
    return false;
  }
};

// Store pending user
const storePendingUser = async (email, fullName, password) => {
  try {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // Delete any existing pending user for this email
    await pool.query('DELETE FROM pending_users WHERE email = $1', [email]);
    
    // Insert new pending user
    await pool.query(
      'INSERT INTO pending_users (email, full_name, password, expires_at) VALUES ($1, $2, $3, $4)',
      [email, fullName, password, expiresAt]
    );
    
    return true;
  } catch (error) {
    console.error('Error storing pending user:', error);
    return false;
  }
};

// Get OTP data
const getOTPData = async (email) => {
  try {
    const result = await pool.query(
      'SELECT otp, attempts, expires_at FROM otp_storage WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const data = result.rows[0];
    
    // Check if expired
    if (new Date() > new Date(data.expires_at)) {
      await pool.query('DELETE FROM otp_storage WHERE email = $1', [email]);
      return null;
    }
    
    return {
      otp: data.otp,
      attempts: data.attempts,
      expiresAt: data.expires_at
    };
  } catch (error) {
    console.error('Error getting OTP data:', error);
    return null;
  }
};

// Get pending user
const getPendingUser = async (email) => {
  try {
    const result = await pool.query(
      'SELECT full_name, password, expires_at FROM pending_users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const data = result.rows[0];
    
    // Check if expired
    if (new Date() > new Date(data.expires_at)) {
      await pool.query('DELETE FROM pending_users WHERE email = $1', [email]);
      return null;
    }
    
    return {
      fullName: data.full_name,
      password: data.password,
      expiresAt: data.expires_at
    };
  } catch (error) {
    console.error('Error getting pending user:', error);
    return null;
  }
};

// Increment OTP attempts
const incrementOTPAttempts = async (email) => {
  try {
    await pool.query(
      'UPDATE otp_storage SET attempts = attempts + 1 WHERE email = $1',
      [email]
    );
    return true;
  } catch (error) {
    console.error('Error incrementing OTP attempts:', error);
    return false;
  }
};

// Delete OTP and pending user
const deleteOTPAndPendingUser = async (email) => {
  try {
    await pool.query('DELETE FROM otp_storage WHERE email = $1', [email]);
    await pool.query('DELETE FROM pending_users WHERE email = $1', [email]);
    return true;
  } catch (error) {
    console.error('Error deleting OTP and pending user:', error);
    return false;
  }
};

// Cleanup expired entries
const cleanupExpiredEntries = async () => {
  try {
    const now = new Date();
    await pool.query('DELETE FROM otp_storage WHERE expires_at < $1', [now]);
    await pool.query('DELETE FROM pending_users WHERE expires_at < $1', [now]);
  } catch (error) {
    console.error('Error cleaning up expired entries:', error);
  }
};

module.exports = {
  initOTPStorage,
  storeOTP,
  storePendingUser,
  getOTPData,
  getPendingUser,
  incrementOTPAttempts,
  deleteOTPAndPendingUser,
  cleanupExpiredEntries
}; 