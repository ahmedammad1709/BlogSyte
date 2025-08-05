const { pool, initDatabase, getBlogStats } = require('./lib/db.js');

// Initialize database
initDatabase();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET requests (fetch blog posts)
  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, category, authorId } = req.query;
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT 
          bp.id, 
          bp.title, 
          bp.description, 
          bp.category, 
          bp.author_id, 
          bp.author_name, 
          bp.created_at,
          bp.updated_at
        FROM blog_posts bp 
        WHERE bp.status = 'published'
      `;
      
      const queryParams = [];
      let paramCount = 0;
      
      if (category) {
        paramCount++;
        query += ` AND bp.category = $${paramCount}`;
        queryParams.push(category);
      }
      
      if (authorId) {
        paramCount++;
        query += ` AND bp.author_id = $${paramCount}`;
        queryParams.push(authorId);
      }
      
      query += ` ORDER BY bp.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      queryParams.push(parseInt(limit), offset);
      
      const result = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM blog_posts bp 
        WHERE bp.status = 'published'
      `;
      
      const countParams = [];
      paramCount = 0;
      
      if (category) {
        paramCount++;
        countQuery += ` AND bp.category = $${paramCount}`;
        countParams.push(category);
      }
      
      if (authorId) {
        paramCount++;
        countQuery += ` AND bp.author_id = $${paramCount}`;
        countParams.push(authorId);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const totalPosts = parseInt(countResult.rows[0].total);
      
      // Get stats for each post
      const postsWithStats = await Promise.all(
        result.rows.map(async (post) => {
          const stats = await getBlogStats(post.id);
          return {
            ...post,
            stats
          };
        })
      );
      
      res.json({
        success: true,
        posts: postsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
          hasNext: offset + limit < totalPosts,
          hasPrev: page > 1
        }
      });
      
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch blog posts.' 
      });
    }
  }
  
  // Handle POST requests (create blog post)
  else if (req.method === 'POST') {
    try {
      const { title, description, category, authorId, authorName } = req.body;
      
      if (!title || !description || !category || !authorId || !authorName) {
        return res.status(400).json({ 
          success: false, 
          message: 'All fields are required' 
        });
      }

      // Insert blog post into database
      const insertQuery = `
        INSERT INTO blog_posts (title, description, category, author_id, author_name) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, title, description, category, author_id, author_name, created_at
      `;
      
      const result = await pool.query(insertQuery, [
        title,
        description,
        category,
        authorId,
        authorName
      ]);

      res.json({ 
        success: true, 
        message: 'Blog post created successfully',
        post: result.rows[0]
      });
      
    } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create blog post.' 
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