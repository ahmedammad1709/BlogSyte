// Mock database for testing admin functionality
const mockData = {
  users: [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      banned: false,
      banned_at: null,
      is_admin: false,
      created_at: '2024-01-15T10:00:00Z',
      posts_count: 5
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      banned: false,
      banned_at: null,
      is_admin: false,
      created_at: '2024-01-20T14:30:00Z',
      posts_count: 3
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      banned: true,
      banned_at: '2024-02-01T09:15:00Z',
      is_admin: false,
      created_at: '2024-01-25T16:45:00Z',
      posts_count: 1
    },
    {
      id: 4,
      name: 'Admin User',
      email: 'admin@bloghive.com',
      banned: false,
      banned_at: null,
      is_admin: true,
      created_at: '2024-01-01T00:00:00Z',
      posts_count: 0
    }
  ],
  blogs: [
    {
      id: 1,
      title: 'Getting Started with React',
      description: 'A comprehensive guide to React development...',
      category: 'Technology',
      author_id: 1,
      author_name: 'John Doe',
      author_full_name: 'John Doe',
      status: 'published',
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-02-01T10:00:00Z',
      likes: 25,
      comments: 8,
      views: 150
    },
    {
      id: 2,
      title: 'Modern CSS Techniques',
      description: 'Exploring advanced CSS features and best practices...',
      category: 'Design',
      author_id: 2,
      author_name: 'Jane Smith',
      author_full_name: 'Jane Smith',
      status: 'published',
      created_at: '2024-02-05T14:30:00Z',
      updated_at: '2024-02-05T14:30:00Z',
      likes: 18,
      comments: 5,
      views: 120
    },
    {
      id: 3,
      title: 'JavaScript Best Practices',
      description: 'Essential JavaScript patterns and practices...',
      category: 'Programming',
      author_id: 1,
      author_name: 'John Doe',
      author_full_name: 'John Doe',
      status: 'published',
      created_at: '2024-02-10T09:15:00Z',
      updated_at: '2024-02-10T09:15:00Z',
      likes: 32,
      comments: 12,
      views: 200
    }
  ],
  stats: {
    totalUsers: 4,
    totalBlogs: 3,
    totalLikes: 75,
    totalComments: 25,
    totalViews: 470,
    bannedUsers: 1,
    recentPosts: 3,
    recentUsers: 4
  },
  dailyPosts: [
    { date: '2024-02-01', count: 1 },
    { date: '2024-02-05', count: 1 },
    { date: '2024-02-10', count: 1 }
  ],
  userSignups: [
    { date: '2024-01-01', count: 1 },
    { date: '2024-01-15', count: 1 },
    { date: '2024-01-20', count: 1 },
    { date: '2024-01-25', count: 1 }
  ]
};

// Mock pool object
const mockPool = {
  query: async (sql, params = []) => {
    console.log('Mock query:', sql, params);
    
    // Simulate database queries
    if (sql.includes('COUNT(*) as count FROM users')) {
      return { rows: [{ count: mockData.stats.totalUsers }] };
    }
    
    if (sql.includes('COUNT(*) as total_users FROM users')) {
      return { rows: [{ total_users: mockData.stats.totalUsers }] };
    }
    
    if (sql.includes('COUNT(*) as total_posts FROM blog_posts')) {
      return { rows: [{ total_posts: mockData.stats.totalBlogs }] };
    }
    
    if (sql.includes('COUNT(*) as total_likes FROM likes')) {
      return { rows: [{ total_likes: mockData.stats.totalLikes }] };
    }
    
    if (sql.includes('COUNT(*) as total_comments FROM comments')) {
      return { rows: [{ total_comments: mockData.stats.totalComments }] };
    }
    
    if (sql.includes('COUNT(*) as total_views FROM views')) {
      return { rows: [{ total_views: mockData.stats.totalViews }] };
    }
    
    if (sql.includes('COUNT(*) as banned_users FROM users WHERE banned = true')) {
      return { rows: [{ banned_users: mockData.stats.bannedUsers }] };
    }
    
    if (sql.includes('SELECT COUNT(*) as recent_posts FROM blog_posts')) {
      return { rows: [{ recent_posts: mockData.stats.recentPosts }] };
    }
    
    if (sql.includes('SELECT COUNT(*) as recent_users FROM users')) {
      return { rows: [{ recent_users: mockData.stats.recentUsers }] };
    }
    
    if (sql.includes('SELECT id, name, email, banned, banned_at, is_admin, created_at')) {
      return { rows: mockData.users };
    }
    
    if (sql.includes('SELECT id, title, description, category, author_id, author_name')) {
      return { rows: mockData.blogs };
    }
    
    if (sql.includes('SELECT COUNT(*) as likes FROM likes WHERE blog_id =')) {
      const blogId = params[0];
      const blog = mockData.blogs.find(b => b.id === blogId);
      return { rows: [{ likes: blog ? blog.likes : 0 }] };
    }
    
    if (sql.includes('SELECT COUNT(*) as comments FROM comments WHERE blog_id =')) {
      const blogId = params[0];
      const blog = mockData.blogs.find(b => b.id === blogId);
      return { rows: [{ comments: blog ? blog.comments : 0 }] };
    }
    
    if (sql.includes('SELECT COUNT(*) as views FROM views WHERE blog_id =')) {
      const blogId = params[0];
      const blog = mockData.blogs.find(b => b.id === blogId);
      return { rows: [{ views: blog ? blog.views : 0 }] };
    }
    
    if (sql.includes('SELECT COUNT(*) as total FROM users')) {
      return { rows: [{ total: mockData.stats.totalUsers }] };
    }
    
    if (sql.includes('SELECT COUNT(*) as total FROM blog_posts')) {
      return { rows: [{ total: mockData.stats.totalBlogs }] };
    }
    
    if (sql.includes('UPDATE users SET banned = true')) {
      const userId = params[0];
      const user = mockData.users.find(u => u.id === userId);
      if (user) {
        user.banned = true;
        user.banned_at = new Date().toISOString();
      }
      return { rows: [] };
    }
    
    if (sql.includes('UPDATE users SET banned = false')) {
      const userId = params[0];
      const user = mockData.users.find(u => u.id === userId);
      if (user) {
        user.banned = false;
        user.banned_at = null;
      }
      return { rows: [] };
    }
    
    if (sql.includes('DELETE FROM blog_posts WHERE id =')) {
      const blogId = params[0];
      const index = mockData.blogs.findIndex(b => b.id === blogId);
      if (index !== -1) {
        mockData.blogs.splice(index, 1);
        mockData.stats.totalBlogs--;
      }
      return { rows: [] };
    }
    
    if (sql.includes('SELECT * FROM users WHERE id =')) {
      const userId = params[0];
      const user = mockData.users.find(u => u.id === userId);
      return { rows: user ? [user] : [] };
    }
    
    if (sql.includes('SELECT * FROM blog_posts WHERE id =')) {
      const blogId = params[0];
      const blog = mockData.blogs.find(b => b.id === blogId);
      return { rows: blog ? [blog] : [] };
    }
    
    // Default response
    return { rows: [] };
  },
  end: () => Promise.resolve()
};

// Mock initDatabase function
const initDatabase = async () => {
  console.log('Mock database initialized');
  return Promise.resolve();
};

// Mock helper functions
const getBlogStats = async (blogId) => {
  const blog = mockData.blogs.find(b => b.id === blogId);
  return {
    likes: blog ? blog.likes : 0,
    comments: blog ? blog.comments : 0,
    views: blog ? blog.views : 0
  };
};

const getUserDashboardStats = async (userId) => {
  const userBlogs = mockData.blogs.filter(b => b.author_id === userId);
  const totalLikes = userBlogs.reduce((sum, blog) => sum + blog.likes, 0);
  const totalComments = userBlogs.reduce((sum, blog) => sum + blog.comments, 0);
  const totalViews = userBlogs.reduce((sum, blog) => sum + blog.views, 0);
  
  return {
    posts: userBlogs.length,
    totalLikes,
    totalComments,
    totalViews
  };
};

module.exports = { 
  pool: mockPool, 
  initDatabase, 
  getBlogStats, 
  getUserDashboardStats 
}; 