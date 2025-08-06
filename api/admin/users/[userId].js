const { pool, initDatabase } = require('../../../lib/db.js');

// Initialize database
initDatabase();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { userId } = req.params;

  if (req.method === 'PUT') {
    try {
      const { action } = req.body; // 'ban' or 'unban'
      
      if (!userId || !action) {
        return res.status(400).json({ 
          success: false, 
          message: 'User ID and action are required' 
        });
      }

      // Check if user exists
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      if (action === 'ban') {
        await pool.query(
          'UPDATE users SET banned = true, banned_at = NOW() WHERE id = $1',
          [userId]
        );
        
        res.json({ 
          success: true, 
          message: 'User banned successfully' 
        });
      } else if (action === 'unban') {
        await pool.query(
          'UPDATE users SET banned = false, banned_at = NULL WHERE id = $1',
          [userId]
        );
        
        res.json({ 
          success: true, 
          message: 'User unbanned successfully' 
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid action. Use "ban" or "unban"' 
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update user.' 
      });
    }
  } else {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}; 