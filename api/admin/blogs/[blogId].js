const { pool, initDatabase } = require('../../../lib/db.js');

// Initialize database
initDatabase();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { blogId } = req.params;

  if (req.method === 'DELETE') {
    try {
      if (!blogId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Blog ID is required' 
        });
      }

      // Check if blog exists
      const blogResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [blogId]);
      if (blogResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Blog post not found' 
        });
      }

      // Delete the blog post (cascade will handle related data)
      await pool.query('DELETE FROM blog_posts WHERE id = $1', [blogId]);
      
      res.json({ 
        success: true, 
        message: 'Blog post deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete blog post.' 
      });
    }
  } else {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}; 