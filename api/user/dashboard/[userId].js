const { pool, initDatabase, getUserDashboardStats } = require('../../../lib/db.js');

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
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
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
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user dashboard.' 
    });
  }
}; 