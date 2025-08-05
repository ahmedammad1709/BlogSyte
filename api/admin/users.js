const { pool, initDatabase } = require('../../lib/db.js');

// Initialize database
initDatabase();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET requests (fetch users)
  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          id, name, email, banned, banned_at, is_admin, created_at
        FROM users 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      
      const result = await pool.query(query, [parseInt(limit), offset]);
      
      // Get total count
      const countResult = await pool.query('SELECT COUNT(*) as total FROM users');
      const totalUsers = parseInt(countResult.rows[0].total);
      
      res.json({
        success: true,
        users: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNext: offset + limit < totalUsers,
          hasPrev: page > 1
        }
      });
      
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch users.' 
      });
    }
  }
  
  // Handle PUT requests (ban/unban user)
  else if (req.method === 'PUT') {
    try {
      const { userId } = req.query;
      const { action } = req.body; // 'ban' or 'unban'
      
      if (!userId || !action) {
        return res.status(400).json({ 
          success: false, 
          message: 'User ID and action are required' 
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
  }
  
  else {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}; 