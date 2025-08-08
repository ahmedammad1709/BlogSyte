// For Vercel serverless functions, we need to use a different approach
// First try to use the neon function for HTTP-based queries which work better in serverless
let pool;
let neonQuery;

try {
  // Try to use the Neon serverless driver's HTTP-based query function
  const { neon } = require('@neondatabase/serverless');
  const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_yHKUQv4aITS7@ep-holy-cherry-a720quld-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require';
  
  // Create the HTTP-based query function
  neonQuery = neon(connectionString);
  console.log('Using Neon serverless HTTP-based queries for Vercel compatibility');
  
  // Also create a pool as fallback for operations that need it
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    max: 3, // Minimal connections for serverless
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000, // Increased timeout
    keepAlive: false // Disable keepAlive for serverless
  });
} catch (error) {
  console.error('Error setting up Neon serverless driver:', error);
  // Fallback to standard pg
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_yHKUQv4aITS7@ep-holy-cherry-a720quld-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require',
    ssl: {
      rejectUnauthorized: false
    },
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000
  });
}

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
    
    // Use neonQuery for HTTP-based queries if available, otherwise use pool
    const executeQuery = async (query, params = []) => {
      if (neonQuery) {
        try {
          const result = await neonQuery.query(query, params);
          return result;
        } catch (error) {
          console.error('Error with neonQuery, falling back to pool:', error.message);
          return pool.query(query, params);
        }
      } else {
        return pool.query(query, params);
      }
    };
    
    // Create users table
    await executeQuery(`
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
    await executeQuery(`
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
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blog_id, user_id)
      );
    `);

    // Create comments table
    await executeQuery(`
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
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS views (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
        user_ip VARCHAR(45),
        user_agent TEXT,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create notifications table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create user notifications table
    await executeQuery(`
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
    // Use neonQuery for HTTP-based queries if available, otherwise use pool
    const executeQuery = async (query, params) => {
      if (neonQuery) {
        // Using neon HTTP query
        try {
          const result = await neonQuery.query(query, params);
          return result;
        } catch (error) {
          console.error('Error with neonQuery, falling back to pool:', error.message);
          return pool.query(query, params);
        }
      } else {
        // Using regular pool
        return pool.query(query, params);
      }
    };
    
    const likesResult = await executeQuery('SELECT COUNT(*) as likes FROM likes WHERE blog_id = $1', [blogId]);
    const commentsResult = await executeQuery('SELECT COUNT(*) as comments FROM comments WHERE blog_id = $1', [blogId]);
    const viewsResult = await executeQuery('SELECT COUNT(*) as views FROM views WHERE blog_id = $1', [blogId]);
    
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
    
    // Use neonQuery for HTTP-based queries if available, otherwise use pool
    const queryExecutor = neonQuery || pool;
    const executeQuery = async (query, params) => {
      if (neonQuery) {
        // Using neon HTTP query
        try {
          const result = await neonQuery.query(query, params);
          return result;
        } catch (error) {
          console.error('Error with neonQuery, falling back to pool:', error.message);
          return pool.query(query, params);
        }
      } else {
        // Using regular pool
        return pool.query(query, params);
      }
    };
    
    // Get total posts count
    const postsQuery = 'SELECT COUNT(*) as posts FROM blog_posts WHERE author_id = $1';
    const postsResult = await executeQuery(postsQuery, [userId]);
    console.log('Posts query result:', postsResult.rows[0]);
    
    // Get total likes count from both tables
    let totalLikesCount = 0;
    
    // Check likes table
    try {
      const likesQuery = `
        SELECT COUNT(*) as total_likes 
        FROM likes l 
        JOIN blog_posts bp ON l.blog_id = bp.id 
        WHERE bp.author_id = $1
      `;
      const likesResult = await executeQuery(likesQuery, [userId]);
      totalLikesCount += parseInt(likesResult.rows[0]?.total_likes) || 0;
      console.log('Likes query result:', likesResult.rows[0]);
    } catch (err) {
      console.error('Error querying likes table:', err.message);
    }
    
    // Check blog_likes table
    try {
      const blogLikesQuery = `
        SELECT COUNT(*) as blog_likes 
        FROM blog_likes bl 
        JOIN blog_posts bp ON bl.blog_id = bp.id 
        WHERE bp.author_id = $1
      `;
      const blogLikesResult = await executeQuery(blogLikesQuery, [userId]);
      totalLikesCount += parseInt(blogLikesResult.rows[0]?.blog_likes) || 0;
      console.log('Blog likes query result:', blogLikesResult.rows[0]);
    } catch (err) {
      console.log('Blog likes table might not exist, skipping:', err.message);
    }
    
    // Get total comments count from both tables
    let totalCommentsCount = 0;
    
    // Check comments table
    try {
      const commentsQuery = `
        SELECT COUNT(*) as total_comments 
        FROM comments c 
        JOIN blog_posts bp ON c.blog_id = bp.id 
        WHERE bp.author_id = $1
      `;
      const commentsResult = await executeQuery(commentsQuery, [userId]);
      totalCommentsCount += parseInt(commentsResult.rows[0]?.total_comments) || 0;
      console.log('Comments query result:', commentsResult.rows[0]);
    } catch (err) {
      console.error('Error querying comments table:', err.message);
    }
    
    // Check blog_comments table
    try {
      const blogCommentsQuery = `
        SELECT COUNT(*) as blog_comments 
        FROM blog_comments bc 
        JOIN blog_posts bp ON bc.blog_id = bp.id 
        WHERE bp.author_id = $1
      `;
      const blogCommentsResult = await executeQuery(blogCommentsQuery, [userId]);
      totalCommentsCount += parseInt(blogCommentsResult.rows[0]?.blog_comments) || 0;
      console.log('Blog comments query result:', blogCommentsResult.rows[0]);
    } catch (err) {
      console.log('Blog comments table might not exist, skipping:', err.message);
    }
    
    // Get total views count from both tables
    let totalViewsCount = 0;
    
    // Check views table
    try {
      const viewsQuery = `
        SELECT COUNT(*) as total_views 
        FROM views v 
        JOIN blog_posts bp ON v.blog_id = bp.id 
        WHERE bp.author_id = $1
      `;
      const viewsResult = await executeQuery(viewsQuery, [userId]);
      totalViewsCount += parseInt(viewsResult.rows[0]?.total_views) || 0;
      console.log('Views query result:', viewsResult.rows[0]);
    } catch (err) {
      console.error('Error querying views table:', err.message);
    }
    
    // Check blog_views table
    try {
      const blogViewsQuery = `
        SELECT COUNT(*) as blog_views 
        FROM blog_views bv 
        JOIN blog_posts bp ON bv.blog_id = bp.id 
        WHERE bp.author_id = $1
      `;
      const blogViewsResult = await executeQuery(blogViewsQuery, [userId]);
      totalViewsCount += parseInt(blogViewsResult.rows[0]?.blog_views) || 0;
      console.log('Blog views query result:', blogViewsResult.rows[0]);
    } catch (err) {
      console.log('Blog views table might not exist, skipping:', err.message);
    }
    
    // Ensure we have valid numbers by using parseInt with fallback to 0
    const posts = parseInt(postsResult.rows[0]?.posts) || 0;
    
    const stats = {
      posts,
      totalLikes: totalLikesCount,
      totalComments: totalCommentsCount,
      totalViews: totalViewsCount
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
    
    // Use neonQuery for HTTP-based queries if available, otherwise use pool
    const executeQuery = async (query, params) => {
      if (neonQuery) {
        try {
          const result = await neonQuery.query(query, params);
          return result;
        } catch (error) {
          console.error('Error with neonQuery, falling back to pool:', error.message);
          return pool.query(query, params);
        }
      } else {
        return pool.query(query, params);
      }
    };
    
    // Check if sample data already exists
    const userCount = await executeQuery('SELECT COUNT(*) as count FROM users');
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
      await executeQuery(
        'INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4)',
        [user.name, user.email, user.password, user.is_admin]
      );
    }

    // Get user IDs
    const userResult = await executeQuery('SELECT id, name FROM users');
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
      await executeQuery(
        'INSERT INTO blog_posts (title, description, category, author_id, author_name) VALUES ($1, $2, $3, $4, $5)',
        [blog.title, blog.description, blog.category, blog.author_id, blog.author_name]
      );
    }

    // Get blog IDs
    const blogResult = await executeQuery('SELECT id FROM blog_posts');
    const blogIds = blogResult.rows.map(row => row.id);

    // Add sample likes
    for (let i = 0; i < 15; i++) {
      const randomBlogId = blogIds[Math.floor(Math.random() * blogIds.length)];
      const randomUserId = Object.values(usersMap)[Math.floor(Math.random() * Object.values(usersMap).length)];
      await executeQuery(
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
      await executeQuery(
        'INSERT INTO comments (blog_id, user_id, comment_text) VALUES ($1, $2, $3)',
        [randomBlogId, randomUserId, randomComment]
      );
    }

    // Add sample views
    for (let i = 0; i < 50; i++) {
      const randomBlogId = blogIds[Math.floor(Math.random() * blogIds.length)];
      await executeQuery(
        'INSERT INTO views (blog_id, user_ip) VALUES ($1, $2)',
        [randomBlogId, `192.168.1.${Math.floor(Math.random() * 255)}`]
      );
    }

    console.log('Sample data added successfully!');
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
};

const checkUserLiked = async (userId, blogId) => {
  try {
    // Use neonQuery for HTTP-based queries if available, otherwise use pool
    const executeQuery = async (query, params) => {
      if (neonQuery) {
        try {
          const result = await neonQuery.query(query, params);
          return result;
        } catch (error) {
          console.error('Error with neonQuery, falling back to pool:', error.message);
          return pool.query(query, params);
        }
      } else {
        return pool.query(query, params);
      }
    };
    
    const result = await executeQuery('SELECT * FROM likes WHERE user_id = $1 AND blog_id = $2', [userId, blogId]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking if user liked blog:', error);
    return false;
  }
};

module.exports = { 
  pool,
  neonQuery, 
  initDatabase, 
  getBlogStats, 
  getUserDashboardStats,
  addSampleData,
  checkUserLiked
};