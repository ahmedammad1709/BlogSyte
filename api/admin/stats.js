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
    // Get total users
    const usersResult = await pool.query('SELECT COUNT(*) as total_users FROM users');
    const totalUsers = parseInt(usersResult.rows[0].total_users);

    // Get total blog posts
    const postsResult = await pool.query('SELECT COUNT(*) as total_posts FROM blog_posts');
    const totalPosts = parseInt(postsResult.rows[0].total_posts);

    // Get total likes
    const likesResult = await pool.query('SELECT COUNT(*) as total_likes FROM likes');
    const totalLikes = parseInt(likesResult.rows[0].total_likes);

    // Get total comments
    const commentsResult = await pool.query('SELECT COUNT(*) as total_comments FROM comments');
    const totalComments = parseInt(commentsResult.rows[0].total_comments);

    // Get total views
    const viewsResult = await pool.query('SELECT COUNT(*) as total_views FROM views');
    const totalViews = parseInt(viewsResult.rows[0].total_views);

    // Get banned users count
    const bannedResult = await pool.query('SELECT COUNT(*) as banned_users FROM users WHERE banned = true');
    const bannedUsers = parseInt(bannedResult.rows[0].banned_users);

    // Get recent activity (last 7 days)
    const recentPostsResult = await pool.query(`
      SELECT COUNT(*) as recent_posts 
      FROM blog_posts 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    const recentPosts = parseInt(recentPostsResult.rows[0].recent_posts);

    const recentUsersResult = await pool.query(`
      SELECT COUNT(*) as recent_users 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    const recentUsers = parseInt(recentUsersResult.rows[0].recent_users);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalLikes,
        totalComments,
        totalViews,
        bannedUsers,
        recentPosts,
        recentUsers
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch admin stats.' 
    });
  }
}; 