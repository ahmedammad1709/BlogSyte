// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);

// Debug log for production
console.log('API Configuration:', {
  isDev: import.meta.env.DEV,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  windowLocation: window.location.origin,
  finalAPIBaseURL: API_BASE_URL
});

export const config = {
  API_BASE_URL,
  API_ENDPOINTS: {
    LOGIN: `${API_BASE_URL}/api/login`,
    SIGNUP: `${API_BASE_URL}/api/send-otp`,
    VERIFY_OTP: `${API_BASE_URL}/api/verify-otp`,
    BLOG_POSTS: `${API_BASE_URL}/api/blog-posts`,
    CREATE_BLOG: `${API_BASE_URL}/api/blog-posts`,
    USER_DASHBOARD: `${API_BASE_URL}/api/user/dashboard`,
    ADMIN: `${API_BASE_URL}/api/admin`,
    ADMIN_STATS: `${API_BASE_URL}/api/admin/stats`,
    ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
    ADMIN_BLOGS: `${API_BASE_URL}/api/admin/blogs`,
    ADMIN_BAN_USER: `${API_BASE_URL}/api/admin/users`,
    ADMIN_UNBAN_USER: `${API_BASE_URL}/api/admin/users`,
    ADMIN_DELETE_BLOG: `${API_BASE_URL}/api/admin/blogs`,
    ADMIN_SEND_NOTIFICATION: `${API_BASE_URL}/api/admin/notifications/send`,
    USER_NOTIFICATIONS: `${API_BASE_URL}/api/user/notifications`,
    USER_READ_NOTIFICATION: `${API_BASE_URL}/api/user/notifications`,
    BLOG_POSTS_BY_AUTHOR: `${API_BASE_URL}/api/blog-posts/author`,
    USER_UPDATE: `${API_BASE_URL}/api/users`,
    USER_DELETE_ACCOUNT: `${API_BASE_URL}/api/user/delete-account`,
    BLOG_LIKE_STATUS: `${API_BASE_URL}/api/blogs`,
    BLOG_LIKE: `${API_BASE_URL}/api/blogs`,
    BLOG_VIEW: `${API_BASE_URL}/api/blogs`,
    BLOG_COMMENT: `${API_BASE_URL}/api/blogs`,
    BLOG_COMMENTS: `${API_BASE_URL}/api/blogs`,
  }
};

export default config; 