const { Pool } = require('pg');

// Create a connection pool with better error handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_yHKUQv4aITS7@ep-holy-cherry-a720quld-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  },
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
    console.log('Getting dashboard stats for user ID:', userId);
    
    // Get total posts count
    const postsQuery = 'SELECT COUNT(*) as posts FROM blog_posts WHERE author_id = $1';
    const postsResult = await pool.query(postsQuery, [userId]);
    console.log('Posts query result:', postsResult.rows[0]);
    
    // Get total likes count - check both likes and blog_likes tables
    const likesQuery = `
      SELECT COUNT(*) as total_likes 
      FROM likes l 
      JOIN blog_posts bp ON l.blog_id = bp.id 
      WHERE bp.author_id = $1
    `;
    const likesResult = await pool.query(likesQuery, [userId]);
    console.log('Likes query result:', likesResult.rows[0]);
    
    // Also check blog_likes table if it exists
    let blogLikesCount = 0;
    try {
      const blogLikesQuery = `
        SELECT COUNT(*) as blog_likes 
        FROM blog_likes bl 
        JOIN blog_posts bp ON bl.blog_id = bp.id 
        WHERE bp.author_id = $1
      `;
      const blogLikesResult = await pool.query(blogLikesQuery, [userId]);
      blogLikesCount = parseInt(blogLikesResult.rows[0]?.blog_likes) || 0;
      console.log('Blog likes query result:', blogLikesResult.rows[0]);
    } catch (err) {
      console.log('Blog likes table might not exist, skipping:', err.message);
    }
    
    // Get total comments count - check both comments and blog_comments tables
    const commentsQuery = `
      SELECT COUNT(*) as total_comments 
      FROM comments c 
      JOIN blog_posts bp ON c.blog_id = bp.id 
      WHERE bp.author_id = $1
    `;
    const commentsResult = await pool.query(commentsQuery, [userId]);
    console.log('Comments query result:', commentsResult.rows[0]);
    
    // Also check blog_comments table if it exists
    let blogCommentsCount = 0;
    try {
      const blogCommentsQuery = `
        SELECT COUNT(*) as blog_comments 
        FROM blog_comments bc 
        JOIN blog_posts bp ON bc.blog_id = bp.id 
        WHERE bp.author_id = $1
      `;
      const blogCommentsResult = await pool.query(blogCommentsQuery, [userId]);
      blogCommentsCount = parseInt(blogCommentsResult.rows[0]?.blog_comments) || 0;
      console.log('Blog comments query result:', blogCommentsResult.rows[0]);
    } catch (err) {
      console.log('Blog comments table might not exist, skipping:', err.message);
    }
    
    // Get total views count - check both views and blog_views tables
    const viewsQuery = `
      SELECT COUNT(*) as total_views 
      FROM views v 
      JOIN blog_posts bp ON v.blog_id = bp.id 
      WHERE bp.author_id = $1
    `;
    const viewsResult = await pool.query(viewsQuery, [userId]);
    console.log('Views query result:', viewsResult.rows[0]);
    
    // Also check blog_views table if it exists
    let blogViewsCount = 0;
    try {
      const blogViewsQuery = `
        SELECT COUNT(*) as blog_views 
        FROM blog_views bv 
        JOIN blog_posts bp ON bv.blog_id = bp.id 
        WHERE bp.author_id = $1
      `;
      const blogViewsResult = await pool.query(blogViewsQuery, [userId]);
      blogViewsCount = parseInt(blogViewsResult.rows[0]?.blog_views) || 0;
      console.log('Blog views query result:', blogViewsResult.rows[0]);
    } catch (err) {
      console.log('Blog views table might not exist, skipping:', err.message);
    }
    
    // Ensure we have valid numbers by using parseInt with fallback to 0
    const posts = parseInt(postsResult.rows[0]?.posts) || 0;
    const totalLikes = (parseInt(likesResult.rows[0]?.total_likes) || 0) + blogLikesCount;
    const totalComments = (parseInt(commentsResult.rows[0]?.total_comments) || 0) + blogCommentsCount;
    const totalViews = (parseInt(viewsResult.rows[0]?.total_views) || 0) + blogViewsCount;
    
    const stats = {
      posts,
      totalLikes,
      totalComments,
      totalViews
    };
    
    console.log('Calculated dashboard stats:', stats);
    return stats;
  } catch (error) {
    console.error('Error getting user dashboard stats:', error);
    return { posts: 0, totalLikes: 0, totalComments: 0, totalViews: 0 };
  }
};

// Add sample data for testing
const addSampleData = async () => {
  try {
    console.log('Adding sample data...');
    
    // Check if sample data already exists
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('Sample data already exists, skipping...');
      return;
    }

    // Add sample users
    const users = [
      { name: 'John Doe', email: 'john@example.com', password: '$2a$10$example', is_admin: false },
      { name: 'Jane Smith', email: 'jane@example.com', password: '$2a$10$example', is_admin: false },
      { name: 'Bob Johnson', email: 'bob@example.com', password: '$2a$10$example', is_admin: false },
      { name: 'Admin User', email: 'admin@bloghive.com', password: '$2a$10$example', is_admin: true }
    ];

    for (const user of users) {
      await pool.query(
        'INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4)',
        [user.name, user.email, user.password, user.is_admin]
      );
    }

    // Get user IDs
    const userResult = await pool.query('SELECT id, name FROM users');
    const usersMap = {};
    userResult.rows.forEach(user => {
      usersMap[user.name] = user.id;
    });

    // Add sample blog posts
    const blogs = [
      {
        title: 'Getting Started with React',
        description: 'A comprehensive guide to React development for beginners...',
        category: 'Technology',
        author_id: usersMap['John Doe'],
        author_name: 'John Doe'
      },
      {
        title: 'Modern CSS Techniques',
        description: 'Exploring advanced CSS features and best practices...',
        category: 'Design',
        author_id: usersMap['Jane Smith'],
        author_name: 'Jane Smith'
      },
      {
        title: 'JavaScript Best Practices',
        description: 'Essential JavaScript patterns and practices for better code...',
        category: 'Programming',
        author_id: usersMap['John Doe'],
        author_name: 'John Doe'
      },
      {
        title: 'Web Development Trends 2024',
        description: 'Latest trends and technologies in web development...',
        category: 'Technology',
        author_id: usersMap['Bob Johnson'],
        author_name: 'Bob Johnson'
      }
    ];

    for (const blog of blogs) {
      await pool.query(
        'INSERT INTO blog_posts (title, description, category, author_id, author_name) VALUES ($1, $2, $3, $4, $5)',
        [blog.title, blog.description, blog.category, blog.author_id, blog.author_name]
      );
    }

    // Get blog IDs
    const blogResult = await pool.query('SELECT id FROM blog_posts');
    const blogIds = blogResult.rows.map(row => row.id);

    // Add sample likes
    for (let i = 0; i < 15; i++) {
      const randomBlogId = blogIds[Math.floor(Math.random() * blogIds.length)];
      const randomUserId = Object.values(usersMap)[Math.floor(Math.random() * Object.values(usersMap).length)];
      await pool.query(
        'INSERT INTO likes (blog_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [randomBlogId, randomUserId]
      );
    }

    // Add sample comments
    const comments = [
      'Great article! Very helpful.',
      'Thanks for sharing this information.',
      'I learned a lot from this post.',
      'Excellent explanation!',
      'This is exactly what I was looking for.'
    ];

    for (let i = 0; i < 10; i++) {
      const randomBlogId = blogIds[Math.floor(Math.random() * blogIds.length)];
      const randomUserId = Object.values(usersMap)[Math.floor(Math.random() * Object.values(usersMap).length)];
      const randomComment = comments[Math.floor(Math.random() * comments.length)];
      await pool.query(
        'INSERT INTO comments (blog_id, user_id, comment_text) VALUES ($1, $2, $3)',
        [randomBlogId, randomUserId, randomComment]
      );
    }

    // Add sample views
    for (let i = 0; i < 50; i++) {
      const randomBlogId = blogIds[Math.floor(Math.random() * blogIds.length)];
      await pool.query(
        'INSERT INTO views (blog_id, user_ip) VALUES ($1, $2)',
        [randomBlogId, `192.168.1.${Math.floor(Math.random() * 255)}`]
      );
    }

    console.log('Sample data added successfully!');
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
};

module.exports = { 
  pool, 
  initDatabase, 
  getBlogStats, 
  getUserDashboardStats,
  addSampleData
};