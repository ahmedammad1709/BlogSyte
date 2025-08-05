const { Pool } = require('pg');

// Create a connection pool with better error handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database tables
const initDatabase = async () => {
  try {
    console.log('Initializing database tables...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        banned BOOLEAN DEFAULT FALSE,
        banned_at TIMESTAMP NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create blog posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        author_name VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create likes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blog_id, user_id)
      );
    `);

    // Create comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create views table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS views (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
        user_ip VARCHAR(45),
        user_agent TEXT,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create user notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        notification_id INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Helper functions
const getBlogStats = async (blogId) => {
  try {
    const likesResult = await pool.query('SELECT COUNT(*) as likes FROM likes WHERE blog_id = $1', [blogId]);
    const commentsResult = await pool.query('SELECT COUNT(*) as comments FROM comments WHERE blog_id = $1', [blogId]);
    const viewsResult = await pool.query('SELECT COUNT(*) as views FROM views WHERE blog_id = $1', [blogId]);
    
    return {
      likes: parseInt(likesResult.rows[0].likes),
      comments: parseInt(commentsResult.rows[0].comments),
      views: parseInt(viewsResult.rows[0].views)
    };
  } catch (error) {
    console.error('Error getting blog stats:', error);
    return { likes: 0, comments: 0, views: 0 };
  }
};

const getUserDashboardStats = async (userId) => {
  try {
    const postsResult = await pool.query('SELECT COUNT(*) as posts FROM blog_posts WHERE author_id = $1', [userId]);
    const likesResult = await pool.query(`
      SELECT COUNT(*) as total_likes 
      FROM likes l 
      JOIN blog_posts bp ON l.blog_id = bp.id 
      WHERE bp.author_id = $1
    `, [userId]);
    const commentsResult = await pool.query(`
      SELECT COUNT(*) as total_comments 
      FROM comments c 
      JOIN blog_posts bp ON c.blog_id = bp.id 
      WHERE bp.author_id = $1
    `, [userId]);
    const viewsResult = await pool.query(`
      SELECT COUNT(*) as total_views 
      FROM views v 
      JOIN blog_posts bp ON v.blog_id = bp.id 
      WHERE bp.author_id = $1
    `, [userId]);
    
    return {
      posts: parseInt(postsResult.rows[0].posts),
      totalLikes: parseInt(likesResult.rows[0].total_likes),
      totalComments: parseInt(commentsResult.rows[0].total_comments),
      totalViews: parseInt(viewsResult.rows[0].total_views)
    };
  } catch (error) {
    console.error('Error getting user dashboard stats:', error);
    return { posts: 0, totalLikes: 0, totalComments: 0, totalViews: 0 };
  }
};

module.exports = { 
  pool, 
  initDatabase, 
  getBlogStats, 
  getUserDashboardStats 
}; 