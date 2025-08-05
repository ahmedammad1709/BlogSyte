const { pool, initDatabase } = require('../../lib/db.js');

// Initialize database
initDatabase();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET requests (fetch all blogs)
  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          bp.id, bp.title, bp.description, bp.category, 
          bp.author_id, bp.author_name, bp.status, 
          bp.created_at, bp.updated_at,
          u.name as author_full_name
        FROM blog_posts bp
        LEFT JOIN users u ON bp.author_id = u.id
        ORDER BY bp.created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      
      const result = await pool.query(query, [parseInt(limit), offset]);
      
      // Get total count
      const countResult = await pool.query('SELECT COUNT(*) as total FROM blog_posts');
      const totalBlogs = parseInt(countResult.rows[0].total);
      
      res.json({
        success: true,
        blogs: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalBlogs / limit),
          totalBlogs,
          hasNext: offset + limit < totalBlogs,
          hasPrev: page > 1
        }
      });
      
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch blogs.' 
      });
    }
  }
  
  // Handle DELETE requests (delete blog)
  else if (req.method === 'DELETE') {
    try {
      const { blogId } = req.query;
      
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

      // Delete blog (cascade will handle related records)
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
  }
  
  else {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}; 