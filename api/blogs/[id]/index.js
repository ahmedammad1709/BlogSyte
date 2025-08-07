const { pool, initDatabase, getBlogStats } = require('../../lib/db.js');

// Initialize database
initDatabase();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  // GET - Get blog stats, like status, or comments
  if (req.method === 'GET') {
    const { action } = req.query;
    if (action === 'stats') {
      try {
        if (!id) return res.status(400).json({ success: false, message: 'Blog ID is required' });
        const blogResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
        if (blogResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Blog post not found' });
        const stats = await getBlogStats(id);
        res.json({ success: true, stats });
      } catch (error) {
        console.error('Error fetching blog stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch blog stats.' });
      }
    } else if (action === 'like-status') {
      try {
        const { userId } = req.query;
        if (!id || !userId) return res.status(400).json({ success: false, message: 'Blog ID and User ID are required' });
        const likeResult = await pool.query('SELECT * FROM likes WHERE blog_id = $1 AND user_id = $2', [id, userId]);
        const isLiked = likeResult.rows.length > 0;
        res.json({ success: true, liked: isLiked });
      } catch (error) {
        console.error('Error checking like status:', error);
        res.status(500).json({ success: false, message: 'Failed to check like status.' });
      }
    } else if (action === 'comments') {
      try {
        if (!id) return res.status(400).json({ success: false, message: 'Blog ID is required' });
        const blogResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
        if (blogResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Blog post not found' });
        const commentsQuery = `SELECT c.id, c.comment_text, c.created_at, u.name as author_name, u.id as user_id FROM comments c JOIN users u ON c.user_id = u.id WHERE c.blog_id = $1 ORDER BY c.created_at DESC`;
        const result = await pool.query(commentsQuery, [id]);
        res.json({ success: true, comments: result.rows });
      } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch comments.' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Use stats, like-status, or comments' });
    }
  }
  // POST - Handle like, comment, or view
  else if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const { action } = body;
    if (!action) {
      return res.status(400).json({ success: false, message: 'Action is required in the request body.' });
    }
    if (action === 'like') {
      try {
        const { userId } = body;
        if (!id || !userId) return res.status(400).json({ success: false, message: 'Blog ID and User ID are required' });
        const blogResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
        if (blogResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Blog post not found' });
        const existingLike = await pool.query('SELECT * FROM likes WHERE blog_id = $1 AND user_id = $2', [id, userId]);
        if (existingLike.rows.length > 0) {
          await pool.query('DELETE FROM likes WHERE blog_id = $1 AND user_id = $2', [id, userId]);
        } else {
          await pool.query('INSERT INTO likes (blog_id, user_id) VALUES ($1, $2)', [id, userId]);
        }
        const stats = await getBlogStats(id);
        res.json({ success: true, stats });
      } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ success: false, message: 'Failed to toggle like. Please try again.' });
      }
    } else if (action === 'comment') {
      try {
        const { userId, commentText } = body;
        if (!id || !userId || !commentText) return res.status(400).json({ success: false, message: 'Blog ID, User ID, and comment text are required' });
        const blogResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
        if (blogResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Blog post not found' });
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        const insertQuery = `INSERT INTO comments (blog_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING id, blog_id, user_id, comment_text, created_at`;
        const result = await pool.query(insertQuery, [id, userId, commentText]);
        const stats = await getBlogStats(id);
        res.json({ success: true, comment: result.rows[0], stats });
      } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'Failed to add comment. Please try again.' });
      }
    } else if (action === 'view') {
      try {
        const { userIp, userAgent } = body;
        if (!id) return res.status(400).json({ success: false, message: 'Blog ID is required' });
        const blogResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
        if (blogResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Blog post not found' });
        const insertQuery = `INSERT INTO views (blog_id, user_ip, user_agent) VALUES ($1, $2, $3)`;
        await pool.query(insertQuery, [id, userIp || null, userAgent || null]);
        const stats = await getBlogStats(id);
        res.json({ success: true, stats });
      } catch (error) {
        console.error('Error recording view:', error);
        res.status(500).json({ success: false, message: 'Failed to record view. Please try again.' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Use like, comment, or view' });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}; 