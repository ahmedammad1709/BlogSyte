const { pool, initDatabase, addSampleData } = require('../lib/db.js');

// Initialize database
initDatabase();

// Add sample data for testing (only if database is empty)
addSampleData();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query;

  // GET - Handle stats, users, or blogs
  if (req.method === 'GET') {
    if (action === 'stats') {
      // Get admin stats
      try {
        console.log('Fetching admin stats...');
        
        const usersResult = await pool.query('SELECT COUNT(*) as total_users FROM users');
        const totalUsers = parseInt(usersResult.rows[0].total_users);

        const postsResult = await pool.query('SELECT COUNT(*) as total_posts FROM blog_posts');
        const totalBlogs = parseInt(postsResult.rows[0].total_posts);

        const likesResult = await pool.query('SELECT COUNT(*) as total_likes FROM likes');
        const totalLikes = parseInt(likesResult.rows[0].total_likes);

        const commentsResult = await pool.query('SELECT COUNT(*) as total_comments FROM comments');
        const totalComments = parseInt(commentsResult.rows[0].total_comments);

        const viewsResult = await pool.query('SELECT COUNT(*) as total_views FROM views');
        const totalViews = parseInt(viewsResult.rows[0].total_views);

        const bannedResult = await pool.query('SELECT COUNT(*) as banned_users FROM users WHERE banned = true');
        const bannedUsers = parseInt(bannedResult.rows[0].banned_users);

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

        // Get daily posts for the last 7 days
        const dailyPostsResult = await pool.query(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
          FROM blog_posts 
          WHERE created_at >= NOW() - INTERVAL '7 days'
          GROUP BY DATE(created_at)
          ORDER BY date
        `);

        // Get user signups for the last 30 days
        const userSignupsResult = await pool.query(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
          FROM users 
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY date
        `);

        const stats = {
          totalUsers,
          totalBlogs,
          totalLikes,
          totalComments,
          totalViews,
          bannedUsers,
          recentPosts,
          recentUsers
        };

        console.log('Admin stats calculated:', stats);

        res.json({
          success: true,
          stats,
          dailyPosts: dailyPostsResult.rows,
          userSignups: userSignupsResult.rows
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to fetch admin stats.',
          error: error.message
        });
      }
    } else if (action === 'users') {
      // Get users
      try {
        console.log('Fetching users...');
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        
        const query = `
          SELECT 
            u.id, u.name, u.email, u.banned, u.banned_at, u.is_admin, u.created_at,
            COUNT(bp.id) as posts_count
          FROM users u
          LEFT JOIN blog_posts bp ON u.id = bp.author_id
          GROUP BY u.id, u.name, u.email, u.banned, u.banned_at, u.is_admin, u.created_at
          ORDER BY u.created_at DESC 
          LIMIT $1 OFFSET $2
        `;
        
        const result = await pool.query(query, [parseInt(limit), offset]);
        
        const countResult = await pool.query('SELECT COUNT(*) as total FROM users');
        const totalUsers = parseInt(countResult.rows[0].total);
        
        console.log(`Found ${result.rows.length} users`);
        
        res.json({
          success: true,
          users: result.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers,
            hasNext: offset + limit < totalUsers,
            hasPrev: page > 1
          }
        });
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to fetch users.',
          error: error.message
        });
      }
    } else if (action === 'blogs') {
      // Get blogs
      try {
        console.log('Fetching blogs...');
        const { page = 1, limit = 50 } = req.query;
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
        
        // Get stats for each blog
        const blogsWithStats = await Promise.all(
          result.rows.map(async (blog) => {
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
        
        const countResult = await pool.query('SELECT COUNT(*) as total FROM blog_posts');
        const totalBlogs = parseInt(countResult.rows[0].total);
        
        console.log(`Found ${result.rows.length} blogs`);
        
        res.json({
          success: true,
          blogs: blogsWithStats,
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
          message: 'Failed to fetch blogs.',
          error: error.message
        });
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid action. Use stats, users, or blogs' 
      });
    }
  }
  
  // PUT - Handle user ban/unban
  else if (req.method === 'PUT') {
    try {
      const { userId } = req.query;
      const { action: userAction } = req.body; // 'ban' or 'unban'
      
      if (!userId || !userAction) {
        return res.status(400).json({ 
          success: false, 
          message: 'User ID and action are required' 
        });
      }

      if (userAction === 'ban') {
        await pool.query(
          'UPDATE users SET banned = true, banned_at = NOW() WHERE id = $1',
          [userId]
        );
        
        res.json({ 
          success: true, 
          message: 'User banned successfully' 
        });
      } else if (userAction === 'unban') {
        await pool.query(
          'UPDATE users SET banned = false, banned_at = NULL WHERE id = $1',
          [userId]
        );
        
        res.json({ 
          success: true, 
          message: 'User unbanned successfully' 
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid action. Use "ban" or "unban"' 
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update user.' 
      });
    }
  }
  
  // DELETE - Handle blog deletion
  else if (req.method === 'DELETE') {
    try {
      const { blogId } = req.query;
      
      if (!blogId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Blog ID is required' 
        });
      }

      const blogResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [blogId]);
      if (blogResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Blog post not found' 
        });
      }

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