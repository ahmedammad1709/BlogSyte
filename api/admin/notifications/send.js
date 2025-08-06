const { pool } = require('../../../lib/mockDb.js');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
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
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}; 