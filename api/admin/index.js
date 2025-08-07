const { pool, initDatabase, addSampleData } = require('../lib/db.js');

// Initialize database with error handling
try {
  initDatabase();
  // Add sample data for testing (only if database is empty)
  addSampleData();
} catch (error) {
  console.error('Database initialization error:', error);
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
        
        // Check if database is connected
        if (!pool) {
          throw new Error('Database connection not available');
        }
        
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
          recentUsers,
          dailyPosts: dailyPostsResult.rows,
          userSignups: userSignupsResult.rows
        };

        console.log('Admin stats:', stats);
        
        res.json({
          success: true,
          stats
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
        
        // Check if database is connected
        if (!pool) {
          throw new Error('Database connection not available');
        }
        
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        
        const query = `
          SELECT 
            id, name, email, banned, banned_at, is_admin, created_at
          FROM users
          ORDER BY created_at DESC 
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
        
        // Check if database is connected
        if (!pool) {
          throw new Error('Database connection not available');
        }
        
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
    } else if (action === 'test') {
      // Simple test endpoint
      res.json({
        success: true,
        message: 'Admin API is working',
        timestamp: new Date().toISOString(),
        databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Not configured'
      });
    } else if (action === 'check-admin') {
      // Check if admin users exist
      try {
        const adminUsersResult = await pool.query('SELECT id, name, email, is_admin FROM users WHERE is_admin = true');
        res.json({
          success: true,
          adminUsers: adminUsersResult.rows,
          message: `Found ${adminUsersResult.rows.length} admin users`
        });
      } catch (error) {
        console.error('Error checking admin users:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to check admin users.',
          error: error.message
        });
      }
    } else if (action === 'create-admin') {
      // Create an admin user for testing
      try {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const result = await pool.query(
          'INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, name, email, is_admin',
          ['Admin User', 'admin@bloghive.com', hashedPassword, true]
        );
        
        res.json({
          success: true,
          message: 'Admin user created successfully',
          user: result.rows[0]
        });
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          res.json({
            success: true,
            message: 'Admin user already exists',
            error: 'User with this email already exists'
          });
        } else {
          console.error('Error creating admin user:', error);
          res.status(500).json({
            success: false,
            message: 'Failed to create admin user.',
            error: error.message
          });
        }
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid action. Use stats, users, blogs, test, check-admin, or create-admin' 
      });
    }
  }
  // POST - Handle notifications
  else if (req.method === 'POST') {
    if (action === 'send-notification') {
      try {
        const { title, description, sendToAll, selectedUsers } = req.body;
        
        if (!title || !description) {
          return res.status(400).json({ 
            success: false, 
            message: 'Title and description are required' 
          });
        }

        // Create the notification
        const notificationResult = await pool.query(
          'INSERT INTO notifications (title, description) VALUES ($1, $2) RETURNING id',
          [title, description]
        );
        
        const notificationId = notificationResult.rows[0].id;
        let recipientCount = 0;

        if (sendToAll) {
          // Send to all active users
          const usersResult = await pool.query('SELECT id FROM users WHERE banned = false');
          const userIds = usersResult.rows.map(user => user.id);
          
          if (userIds.length > 0) {
            const values = userIds.map((userId, index) => `($${index + 2}, $1)`).join(', ');
            const query = `INSERT INTO user_notifications (user_id, notification_id) VALUES ${values}`;
            await pool.query(query, [notificationId, ...userIds]);
            recipientCount = userIds.length;
          }
        } else if (selectedUsers && selectedUsers.length > 0) {
          // Send to selected users
          const values = selectedUsers.map((userId, index) => `($${index + 2}, $1)`).join(', ');
          const query = `INSERT INTO user_notifications (user_id, notification_id) VALUES ${values}`;
          await pool.query(query, [notificationId, ...selectedUsers]);
          recipientCount = selectedUsers.length;
        } else {
          return res.status(400).json({ 
            success: false, 
            message: 'Please select users to send notification to' 
          });
        }
        
        res.json({ 
          success: true, 
          message: 'Notification sent successfully',
          recipientCount
        });
      } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to send notification.' 
        });
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid action. Use: send-notification' 
      });
    }
  }
  // PUT - Handle user management
  else if (req.method === 'PUT') {
    if (action === 'user') {
      try {
        const { userId } = req.query;
        const { action: userAction } = req.body; // 'ban' or 'unban'
        
        if (!userId || !userAction) {
          return res.status(400).json({ 
            success: false, 
            message: 'User ID and action are required' 
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
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid action. Use: user' 
      });
    }
  }
  // DELETE - Handle blog deletion
  else if (req.method === 'DELETE') {
    if (action === 'blog') {
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
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid action. Use: blog' 
      });
    }
  } else {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}; 