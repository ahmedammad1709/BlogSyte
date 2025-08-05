const { pool, initDatabase } = require('../../lib/db.js');

// Initialize database
initDatabase();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { id } = req.query;
    const { userId } = req.query;
    
    if (!id || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Blog ID and User ID are required' 
      });
    }

    // Check if user has liked this blog
    const likeResult = await pool.query(
      'SELECT * FROM likes WHERE blog_id = $1 AND user_id = $2',
      [id, userId]
    );

    const isLiked = likeResult.rows.length > 0;

    res.json({ 
      success: true, 
      liked: isLiked
    });

  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check like status.' 
    });
  }
}; 