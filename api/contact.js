const { sendNotification } = require('./lib/email');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and message are required' 
      });
    }

    // Email 1: Thank you email to the user
    const userThankYouEmail = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Contacting Us!</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Dear <strong>${name}</strong>,
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Thank you for reaching out to us! We have received your message and appreciate you taking the time to contact us.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Our team will review your inquiry and get back to you within <strong>3 business days</strong>. We value your interest and will provide you with a detailed response.
          </p>
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #1976d2;">
              <strong>What happens next?</strong><br>
              • We'll review your message carefully<br>
              • Our team will prepare a comprehensive response<br>
              • You'll hear from us within 3 business days
            </p>
          </div>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            If you have any urgent questions, please don't hesitate to reach out again.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Best regards,<br>
            <strong>The BlogHive Team</strong>
          </p>
        </div>
      </div>
    `;

    // Email 2: Notification email to admin
    const adminNotificationEmail = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Contact Form Submission</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #856404;">Contact Details</h3>
            <p style="margin: 5px 0; font-size: 16px;">
              <strong>Name:</strong> ${name}
            </p>
            <p style="margin: 5px 0; font-size: 16px;">
              <strong>Email:</strong> <a href="mailto:${email}" style="color: #007bff;">${email}</a>
            </p>
            <p style="margin: 5px 0; font-size: 16px;">
              <strong>Submitted:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
          <div style="background: #d1ecf1; padding: 20px; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #0c5460;">Message</h3>
            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #0c5460; white-space: pre-wrap;">
              ${message}
            </p>
          </div>
          <div style="margin-top: 20px; padding: 15px; background: #d4edda; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #155724;">
              <strong>Action Required:</strong> Please respond to this inquiry within 3 business days.
            </p>
          </div>
        </div>
      </div>
    `;

    // Send thank you email to user
    const userEmailSent = await sendNotification(
      email,
      "Thank You for Contacting BlogHive!",
      userThankYouEmail
    );

    // Send notification email to admin
    const adminEmailSent = await sendNotification(
      'ttorfidoo001@gmail.com',
      `New Contact Form Submission from ${name}`,
      adminNotificationEmail
    );

    if (userEmailSent && adminEmailSent) {
      res.status(200).json({
        success: true,
        message: 'Thank you for your message! We will get back to you within 3 business days.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send emails. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again.'
    });
  }
}; 