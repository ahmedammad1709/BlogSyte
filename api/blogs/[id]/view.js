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
    const { userIp, userAgent } = req.body;
    
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

    // Insert view record
    const insertQuery = `
      INSERT INTO views (blog_id, user_ip, user_agent) 
      VALUES ($1, $2, $3)
    `;
    
    await pool.query(insertQuery, [id, userIp || null, userAgent || null]);

    res.json({ 
      success: true, 
      message: 'View recorded successfully'
    });

  } catch (error) {
    console.error('Error recording view:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record view. Please try again.' 
    });
  }
}; 