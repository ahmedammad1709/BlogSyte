const { pool, initDatabase, getBlogStats } = require('./lib/db.js');

// Initialize database
initDatabase();

module.exports = async (req, res) => {
  // Force method to be recognized (backup fix for 405 errors)
  const method = req.method || req.headers['x-http-method-override'] || 'GET';
  req.method = method;
  
  // Log the very first thing we see
  console.log('=== BLOGS API HANDLER START ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', req.headers);
  
  // Enable CORS for all methods
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }

  // Extract blog ID and optional sub-action from URL path safely
  const pathOnly = (req.url || '').split('?')[0];
  const segments = pathOnly.split('/').filter(Boolean); // e.g., ["api","blogs","123","comment"]
  const blogsIndex = segments.indexOf('blogs');
  const rawId = blogsIndex >= 0 && segments.length > blogsIndex + 1 ? segments[blogsIndex + 1] : undefined;
  const pathAction = blogsIndex >= 0 && segments.length > blogsIndex + 2 ? segments[blogsIndex + 2] : undefined;
  const blogId = rawId;
  
  // Add more detailed logging for debugging
  console.log('URL parsing debug:', {
    originalUrl: req.url,
    pathOnly,
    segments,
    blogsIndex,
    rawId,
    pathAction,
    finalBlogId: blogId,
    method: req.method,
    headers: req.headers
  });
  
  // Resolve action from query/body or from sub-path (supports both styles)
  const queryAction = req.query?.action;
  const bodyRaw = req.body;
  let bodyParsed = bodyRaw;
  if (typeof bodyParsed === 'string') {
    try { bodyParsed = JSON.parse(bodyParsed); } catch (e) { bodyParsed = {}; }
  }
  const bodyAction = bodyParsed?.action;
  const resolvedAction = queryAction || bodyAction || pathAction;
  
  // Add logging for debugging
  console.log(`API Request: ${req.method} /api/blogs/${blogId}`, {
    method: req.method,
    blogId: blogId,
    url: req.url,
    query: req.query,
    body: req.body,
    resolvedAction: resolvedAction
  });

  // Test database connection
  try {
    await pool.query('SELECT 1');
    console.log('Database connection test successful');
  } catch (dbError) {
    console.error('Database connection test failed:', dbError);
    return res.status(500).json({ success: false, message: 'Database connection error' });
  }

  // Log the incoming request method for debugging
  console.log(`Processing ${req.method} request for blog ID: ${blogId}`);
  console.log('Method comparison:', {
    method: req.method,
    isGET: req.method === 'GET',
    isPOST: req.method === 'POST',
    isPUT: req.method === 'PUT',
    isDELETE: req.method === 'DELETE'
  });
  
  // GET - Handle different actions based on path or query
  if (req.method === 'GET') {
    // If no blogId, this is a request to get all blog posts
    if (!blogId) {
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
    } else {
      // Handle specific blog actions
      const action = resolvedAction;
      if (action === 'stats') {
        try {
          if (!blogId) return res.status(400).json({ success: false, message: 'Blog ID is required' });
          const blogResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [blogId]);
          if (blogResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Blog post not found' });
          const stats = await getBlogStats(blogId);
          res.json({ success: true, stats });
        } catch (error) {
          console.error('Error fetching blog stats:', error);
          res.status(500).json({ success: false, message: 'Failed to fetch blog stats.' });
        }
      } else if (action === 'like-status') {
        try {
          const { userId } = req.query;
          if (!blogId || !userId) return res.status(400).json({ success: false, message: 'Blog ID and User ID are required' });
          const likeResult = await pool.query('SELECT * FROM likes WHERE blog_id = $1 AND user_id = $2', [blogId, userId]);
          const isLiked = likeResult.rows.length > 0;
          res.json({ success: true, liked: isLiked });
        } catch (error) {
          console.error('Error checking like status:', error);
          res.status(500).json({ success: false, message: 'Failed to check like status.' });
        }
      } else if (action === 'comments') {
        try {
          if (!blogId) return res.status(400).json({ success: false, message: 'Blog ID is required' });
          const blogResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [blogId]);
          if (blogResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Blog post not found' });
          const commentsQuery = `SELECT c.id, c.comment_text, c.created_at, u.name as author_name, u.id as user_id FROM comments c JOIN users u ON c.user_id = u.id WHERE c.blog_id = $1 ORDER BY c.created_at DESC`;
          const result = await pool.query(commentsQuery, [blogId]);
          res.json({ success: true, comments: result.rows });
        } catch (error) {
          console.error('Error fetching comments:', error);
          res.status(500).json({ success: false, message: 'Failed to fetch comments.' });
        }
      } else {
        return res.status(400).json({ success: false, message: 'Invalid action. Use stats, like-status, or comments' });
      }
    }
  }
  // POST - Handle blog creation, like, comment, or view
  else if (req.method === 'POST') {
    // If no blogId, this is a request to create a new blog post
    if (!blogId) {
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
    } else {
      // Handle specific blog actions
      let body = bodyParsed || {};
      const action = resolvedAction;
      if (!action) {
        return res.status(400).json({ success: false, message: 'Action is required in the request body.' });
      }
      if (action === 'like') {
        try {
          const { userId } = body;
          if (!blogId || !userId) return res.status(400).json({ success: false, message: 'Blog ID and User ID are required' });
          const blogResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [blogId]);
          if (blogResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Blog post not found' });
          
          // Check if likes table exists, create if not
          try {
            await pool.query(`
              CREATE TABLE IF NOT EXISTS likes (
                id SERIAL PRIMARY KEY,
                blog_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(blog_id, user_id)
              )
            `);
          } catch (tableError) {
            console.error('Error creating likes table:', tableError);
          }
          
          const existingLike = await pool.query('SELECT * FROM likes WHERE blog_id = $1 AND user_id = $2', [blogId, userId]);
          if (existingLike.rows.length > 0) {
            await pool.query('DELETE FROM likes WHERE blog_id = $1 AND user_id = $2', [blogId, userId]);
          } else {
            await pool.query('INSERT INTO likes (blog_id, user_id) VALUES ($1, $2)', [blogId, userId]);
          }
          const stats = await getBlogStats(blogId);
          res.json({ success: true, stats });
        } catch (error) {
          console.error('Error toggling like:', error);
          res.status(500).json({ success: false, message: 'Failed to toggle like. Please try again.' });
        }
      } else if (action === 'comment') {
        try {
          const { userId, commentText } = body;
          if (!blogId || !userId || !commentText) return res.status(400).json({ success: false, message: 'Blog ID, User ID, and comment text are required' });
          const blogResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [blogId]);
          if (blogResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Blog post not found' });
          const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
          if (userResult.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
          
          // Check if comments table exists, create if not
          try {
            await pool.query(`
              CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                blog_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                comment_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
            `);
          } catch (tableError) {
            console.error('Error creating comments table:', tableError);
          }
          const insertQuery = `INSERT INTO comments (blog_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING id, blog_id, user_id, comment_text, created_at`;
          const result = await pool.query(insertQuery, [blogId, userId, commentText]);
          const stats = await getBlogStats(blogId);
          res.json({ success: true, comment: result.rows[0], stats });
        } catch (error) {
          console.error('Error adding comment:', error);
          res.status(500).json({ success: false, message: 'Failed to add comment. Please try again.' });
        }
      } else if (action === 'view') {
        try {
          const { userIp, userAgent } = body;
          if (!blogId) return res.status(400).json({ success: false, message: 'Blog ID is required' });
          const blogResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [blogId]);
          if (blogResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Blog post not found' });
          
          // Check if views table exists, create if not
          try {
            await pool.query(`
              CREATE TABLE IF NOT EXISTS views (
                id SERIAL PRIMARY KEY,
                blog_id INTEGER NOT NULL,
                user_ip VARCHAR(50),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
            `);
          } catch (tableError) {
            console.error('Error creating views table:', tableError);
          }
          
          const insertQuery = `INSERT INTO views (blog_id, user_ip, user_agent) VALUES ($1, $2, $3)`;
          await pool.query(insertQuery, [blogId, userIp || null, userAgent || null]);
          const stats = await getBlogStats(blogId);
          res.json({ success: true, stats });
        } catch (error) {
          console.error('Error recording view:', error);
          res.status(500).json({ success: false, message: 'Failed to record view. Please try again.' });
        }
      } else {
        return res.status(400).json({ success: false, message: 'Invalid action. Use like, comment, or view' });
      }
    }
  } 
  // PUT - Handle blog update
  else if (req.method === 'PUT') {
    console.log('PUT request received for blog update:', { blogId, body: req.body });
    
    if (!blogId) {
      console.error('PUT request missing blog ID');
      return res.status(400).json({ success: false, message: 'Blog ID is required' });
    }

    // Validate blog ID is a number
    const numericBlogId = parseInt(blogId);
    if (isNaN(numericBlogId)) {
      console.error('Invalid blog ID format:', blogId);
      return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
    }

    try {
      const { title, description, category } = req.body;
      
      console.log('Update request data:', { title, description, category });
      
      if (!title || !description || !category) {
        console.error('Missing required fields:', { title: !!title, description: !!description, category: !!category });
        return res.status(400).json({ 
          success: false, 
          message: 'All fields are required' 
        });
      }

      // Check if blog post exists
      const blogResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [numericBlogId]);
      if (blogResult.rows.length === 0) {
        console.error('Blog post not found with ID:', numericBlogId);
        return res.status(404).json({ success: false, message: 'Blog post not found' });
      }

      console.log('Blog post found, proceeding with update');

      // Update blog post
      const updateQuery = `
        UPDATE blog_posts 
        SET title = $1, description = $2, category = $3, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $4 
        RETURNING id, title, description, category, author_id, author_name, created_at, updated_at
      `;
      
      console.log('Executing update query with params:', [title, description, category, numericBlogId]);
      
      const result = await pool.query(updateQuery, [
        title,
        description,
        category,
        numericBlogId
      ]);

      console.log('Blog post updated successfully:', result.rows[0]);

      res.json({ 
        success: true, 
        message: 'Blog post updated successfully',
        post: result.rows[0]
      });
      
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update blog post.' 
      });
    }
  }
  // DELETE - Handle blog deletion
  else if (req.method === 'DELETE') {
    console.log('DELETE request received for blog deletion:', { blogId });
    
    if (!blogId) {
      console.error('DELETE request missing blog ID');
      return res.status(400).json({ success: false, message: 'Blog ID is required' });
    }

    // Validate blog ID is a number
    const numericBlogId = parseInt(blogId);
    if (isNaN(numericBlogId)) {
      console.error('Invalid blog ID format:', blogId);
      return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
    }

    try {
      // Check if blog post exists
      const blogResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [numericBlogId]);
      if (blogResult.rows.length === 0) {
        console.error('Blog post not found with ID:', numericBlogId);
        return res.status(404).json({ success: false, message: 'Blog post not found' });
      }

      console.log('Blog post found, proceeding with deletion');

      // Delete blog post
      console.log('Executing delete query for blog ID:', numericBlogId);
      await pool.query('DELETE FROM blog_posts WHERE id = $1', [numericBlogId]);
      
      // Delete associated likes, comments, and views
      try {
        await pool.query('DELETE FROM likes WHERE blog_id = $1', [numericBlogId]);
        await pool.query('DELETE FROM comments WHERE blog_id = $1', [numericBlogId]);
        await pool.query('DELETE FROM views WHERE blog_id = $1', [numericBlogId]);
        console.log('Associated data cleaned up successfully');
      } catch (cleanupError) {
        console.error('Error cleaning up associated data:', cleanupError);
        // Continue with the response even if cleanup fails
      }

      console.log('Blog post deleted successfully');

      res.json({ 
        success: true, 
        message: 'Blog post deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete blog post.' 
      });
    }
  } else {
    console.error(`Method not allowed: ${req.method}`);
    console.error('Available methods: GET, POST, PUT, DELETE');
    console.error('Request details:', {
      method: req.method,
      url: req.url,
      blogId: blogId,
      headers: req.headers
    });
    return res.status(405).json({ 
      success: false, 
      message: `Method not allowed: ${req.method}`,
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE']
    });
  }
};