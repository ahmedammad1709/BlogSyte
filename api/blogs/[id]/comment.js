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
    const { userId, commentText } = req.body;
    
    if (!id || !userId || !commentText) {
      return res.status(400).json({ 
        success: false, 
        message: 'Blog ID, User ID, and comment text are required' 
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

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Insert comment
    const insertQuery = `
      INSERT INTO comments (blog_id, user_id, comment_text) 
      VALUES ($1, $2, $3) 
      RETURNING id, blog_id, user_id, comment_text, created_at
    `;
    
    const result = await pool.query(insertQuery, [id, userId, commentText]);

    res.json({ 
      success: true, 
      message: 'Comment added successfully',
      comment: result.rows[0]
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add comment. Please try again.' 
    });
  }
}; 