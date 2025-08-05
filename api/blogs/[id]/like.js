const { pool, initDatabase } = require('../../lib/db.js');

// Initialize database
initDatabase();

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
    const { id } = req.query;
    const { userId } = req.body;
    
    if (!id || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Blog ID and User ID are required' 
      });
    }

    // Check if blog exists
    const blogResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
    if (blogResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }

    // Check if user already liked this blog
    const existingLike = await pool.query(
      'SELECT * FROM likes WHERE blog_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingLike.rows.length > 0) {
      // Unlike the blog
      await pool.query(
        'DELETE FROM likes WHERE blog_id = $1 AND user_id = $2',
        [id, userId]
      );

      res.json({ 
        success: true, 
        message: 'Blog unliked successfully',
        liked: false
      });
    } else {
      // Like the blog
      await pool.query(
        'INSERT INTO likes (blog_id, user_id) VALUES ($1, $2)',
        [id, userId]
      );

      res.json({ 
        success: true, 
        message: 'Blog liked successfully',
        liked: true
      });
    }

  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle like. Please try again.' 
    });
  }
}; 