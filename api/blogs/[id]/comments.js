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
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Blog ID is required' 
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

    // Get comments with user information
    const commentsQuery = `
      SELECT 
        c.id,
        c.comment_text,
        c.created_at,
        u.name as user_name,
        u.id as user_id
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.blog_id = $1
      ORDER BY c.created_at DESC
    `;
    
    const result = await pool.query(commentsQuery, [id]);

    res.json({ 
      success: true, 
      comments: result.rows
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch comments.' 
    });
  }
}; 