const { pool, initDatabase } = require('./lib/db.js');

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

  if (req.method === 'GET') {
    try {
      // Test database connection
      const result = await pool.query('SELECT NOW() as current_time');
      
      res.json({
        success: true,
        message: 'Database connection successful',
        timestamp: result.rows[0].current_time,
        databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Not configured'
      });
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: error.message
      });
    }
  } else {
    res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}; 