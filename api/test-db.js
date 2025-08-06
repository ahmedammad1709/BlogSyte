const { pool, initDatabase } = require('./lib/mockDb.js');

async function testDatabase() {
  try {
    console.log('Testing database connection and tables...');
    
    // Initialize database
    await initDatabase();
    
    // Test users table
    console.log('\n--- Testing Users Table ---');
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('Total users:', usersResult.rows[0].count);
    
    const sampleUsers = await pool.query('SELECT id, name, email, banned, is_admin FROM users LIMIT 5');
    console.log('Sample users:', sampleUsers.rows);
    
    // Test blog_posts table
    console.log('\n--- Testing Blog Posts Table ---');
    const postsResult = await pool.query('SELECT COUNT(*) as count FROM blog_posts');
    console.log('Total blog posts:', postsResult.rows[0].count);
    
    const samplePosts = await pool.query('SELECT id, title, author_name, category FROM blog_posts LIMIT 5');
    console.log('Sample posts:', samplePosts.rows);
    
    // Test likes table
    console.log('\n--- Testing Likes Table ---');
    const likesResult = await pool.query('SELECT COUNT(*) as count FROM likes');
    console.log('Total likes:', likesResult.rows[0].count);
    
    // Test comments table
    console.log('\n--- Testing Comments Table ---');
    const commentsResult = await pool.query('SELECT COUNT(*) as count FROM comments');
    console.log('Total comments:', commentsResult.rows[0].count);
    
    // Test views table
    console.log('\n--- Testing Views Table ---');
    const viewsResult = await pool.query('SELECT COUNT(*) as count FROM views');
    console.log('Total views:', viewsResult.rows[0].count);
    
    // Test admin stats query
    console.log('\n--- Testing Admin Stats Query ---');
    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM blog_posts) as total_blogs,
        (SELECT COUNT(*) FROM likes) as total_likes,
        (SELECT COUNT(*) FROM comments) as total_comments,
        (SELECT COUNT(*) FROM users WHERE banned = true) as banned_users
    `);
    console.log('Admin stats:', statsResult.rows[0]);
    
    console.log('\nDatabase test completed successfully!');
    
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await pool.end();
  }
}

testDatabase(); 