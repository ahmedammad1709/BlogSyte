const { pool, neonQuery, initDatabase, getUserDashboardStats } = require('../../lib/db.js');

// Initialize database with error handling
try {
  initDatabase();
} catch (error) {
  console.error('Database initialization error:', error);
}

module.exports = async (req, res) => {
  // Set proper content type for JSON responses
  res.setHeader('Content-Type', 'application/json');
  
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
  
  console.log('Dashboard API request received at:', new Date().toISOString());

  try {
    console.log('Dashboard API request received:', req.query);
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // Check if database is connected
    if (!pool) {
      console.error('Database pool is not available');
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      });
    }
    
    console.log('Checking if user exists with ID:', userId);

    // Check if user exists
    let userResult;
    try {
      // Try to use neonQuery first for better serverless compatibility
      if (neonQuery) {
        userResult = await neonQuery.query('SELECT * FROM users WHERE id = $1', [userId]);
      } else {
        userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      }
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
    } catch (error) {
      console.error('Error checking if user exists:', error);
      // Fallback to pool if neonQuery fails
      try {
        userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
          });
        }
      } catch (fallbackError) {
        console.error('Fallback error checking if user exists:', fallbackError);
        return res.status(500).json({
          success: false,
          message: 'Database error when checking user',
          error: fallbackError.message
        });
      }
    }

    // Get user dashboard stats
    const stats = await getUserDashboardStats(userId);

    // Get user's recent blog posts with stats
    const recentPostsQuery = `
      SELECT id, title, description, category, created_at
      FROM blog_posts 
      WHERE author_id = $1 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    const recentPostsResult = await pool.query(recentPostsQuery, [userId]);

    // Get stats for each blog post
    const blogsWithStats = await Promise.all(
      recentPostsResult.rows.map(async (blog) => {
        const likesResult = await pool.query('SELECT COUNT(*) as likes FROM likes WHERE blog_id = $1', [blog.id]);
        const commentsResult = await pool.query('SELECT COUNT(*) as comments FROM comments WHERE blog_id = $1', [blog.id]);
        const viewsResult = await pool.query('SELECT COUNT(*) as views FROM views WHERE blog_id = $1', [blog.id]);
        
        return {
          ...blog,
          likes: parseInt(likesResult.rows[0].likes),
          comments: parseInt(commentsResult.rows[0].comments),
          views: parseInt(viewsResult.rows[0].views)
        };
      })
    );

    // Log the stats before sending the response
    console.log('User dashboard stats being sent:', {
      posts: stats.posts,
      totalLikes: stats.totalLikes,
      totalComments: stats.totalComments,
      totalViews: stats.totalViews
    });
    
    res.json({
      success: true,
      user: {
        id: userResult.rows[0].id,
        name: userResult.rows[0].name,
        email: userResult.rows[0].email,
        isAdmin: userResult.rows[0].is_admin || false
      },
      stats: {
        totalBlogs: stats.posts,
        totalLikes: stats.totalLikes,
        totalComments: stats.totalComments,
        totalViews: stats.totalViews,
        blogs: blogsWithStats
      },
      recentPosts: recentPostsResult.rows
    });
  } catch (error) {
    console.error('Error in dashboard API:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error information
    const errorDetails = {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    
    console.error('Error details:', errorDetails);
    
    // Ensure we're sending a JSON response with proper headers
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      }
    });
    
    // This code is unreachable due to the return above
    // res.status(500).json({ 
    //  success: false, 
    //  message: 'Server error', 
    //  error: error.message,
    //  details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    // });
  }
};