import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  BarChart3, 
  User, 
  LogOut, 
  Home, 
  FileText, 
  Settings, 
  Heart, 
  MessageCircle,
  Upload,
  Eye,
  Trash2,
  Save,
  Search,
  Globe,
  RefreshCw,
  AlertTriangle,
  Bell,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalBlogs: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
    blogs: []
  });
  const [accountForm, setAccountForm] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profilePicture: null
  });
  const [accountErrors, setAccountErrors] = useState({});
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch user's blog posts and dashboard stats
  useEffect(() => {
    if (user) {
      fetchUserPosts();
      fetchDashboardStats();
    }
  }, [user]);

  // Refresh posts data when switching to overview or blogs tab
  useEffect(() => {
    if (user && (activeTab === 'overview' || activeTab === 'blogs')) {
      fetchUserPosts();
    }
  }, [activeTab, user]);

  // Auto-refresh data every 30 seconds when on overview or blogs tab
  useEffect(() => {
    if (user && (activeTab === 'overview' || activeTab === 'blogs')) {
      const interval = setInterval(() => {
        fetchUserPosts();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeTab, user]);

  // Fetch notifications when user is available
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    setNotificationsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/user/notifications/${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        const unread = data.notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      } else {
        console.error('Failed to fetch notifications:', data.message);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (userNotificationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/notifications/${userNotificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === userNotificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const fetchUserPosts = async (showToast = false) => {
    if (!user?.id) return;
    
    setPostsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/blog-posts/author/${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setUserPosts(data.posts);
        if (showToast) {
          addToast('Data refreshed successfully!', 'success');
        }
      } else {
        console.error('Failed to fetch posts:', data.message);
        if (showToast) {
          addToast('Failed to refresh data', 'error');
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (showToast) {
        addToast('Network error while refreshing data', 'error');
      }
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/user/dashboard/${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setDashboardStats(data.stats);
      } else {
        console.error('Failed to fetch dashboard stats:', data.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const createBlogPost = async (postData) => {
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: postData.title,
          description: postData.description,
          category: postData.category,
          authorId: user.id,
          authorName: user.name
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh user posts
        await fetchUserPosts();
        return { success: true, message: 'Blog post created successfully!' };
      } else {
        return { success: false, message: data.message || 'Failed to create blog post' };
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setSubmitting(false);
    }
  };

  const updateBlogPost = async (postId, postData) => {
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/blog-posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: postData.title,
          description: postData.description,
          category: postData.category,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchUserPosts();
        return { success: true, message: 'Blog post updated successfully!' };
      } else {
        return { success: false, message: data.message || 'Failed to update blog post' };
      }
    } catch (error) {
      console.error('Error updating blog post:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBlogPost = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/blog-posts/${postId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchUserPosts();
        return { success: true, message: 'Blog post deleted successfully!' };
      } else {
        return { success: false, message: data.message || 'Failed to delete blog post' };
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const deleteAccount = async (password) => {
    setDeleteAccountLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/user/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          password: password
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        logout();
        navigate('/login');
        addToast('Account deleted successfully', 'success');
        return { success: true, message: 'Account deleted successfully!' };
      } else {
        return { success: false, message: data.message || 'Failed to delete account' };
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.title.trim()) newErrors.title = 'Please enter a title';
    if (!formData.description.trim()) newErrors.description = 'Please enter a description';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      let result;
      
      if (editingPost) {
        result = await updateBlogPost(editingPost.id, formData);
      } else {
        result = await createBlogPost(formData);
      }
      
      if (result.success) {
        // Reset form
        setFormData({ category: '', title: '', description: '' });
        setErrors({});
        setEditingPost(null);
        // Switch to blogs tab to show the new/updated post
        setActiveTab('blogs');
        // Show modern toast notification
        addToast(result.message, 'success');
      } else {
        addToast(result.message, 'error');
      }
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      category: post.category,
      title: post.title,
      description: post.description
    });
    setActiveTab('create');
  };

  const handleDelete = (post) => {
    setPostToDelete(post);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (postToDelete) {
      const result = await deleteBlogPost(postToDelete.id);
      if (result.success) {
        addToast(result.message, 'success');
      } else {
        addToast(result.message, 'error');
      }
    }
    setShowDeleteConfirm(false);
    setPostToDelete(null);
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setFormData({ category: '', title: '', description: '' });
    setErrors({});
    setActiveTab('blogs');
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deleteAccountPassword.trim()) {
      addToast('Please enter your password', 'error');
      return;
    }

    const result = await deleteAccount(deleteAccountPassword);
    if (!result.success) {
      addToast(result.message, 'error');
    }
  };

  const handleAccountFormChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'profilePicture' && files) {
      setAccountForm(prev => ({
        ...prev,
        profilePicture: files[0]
      }));
    } else {
      setAccountForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear errors when user starts typing
    if (accountErrors[name]) {
      setAccountErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateAccountForm = () => {
    const errors = {};
    
    // Name validation
    if (!accountForm.name.trim()) {
      errors.name = 'Name is required';
    } else if (accountForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Current password validation (only if changing password)
    if (accountForm.newPassword || accountForm.confirmPassword) {
      if (!accountForm.currentPassword) {
        errors.currentPassword = 'Current password is required to change password';
      }
    }
    
    // New password validation
    if (accountForm.newPassword) {
      if (accountForm.newPassword.length < 6) {
        errors.newPassword = 'Password must be at least 6 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(accountForm.newPassword)) {
        errors.newPassword = 'Password must contain uppercase, lowercase, and number';
      }
    }
    
    // Confirm password validation
    if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Profile picture validation
    if (accountForm.profilePicture) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (accountForm.profilePicture.size > maxSize) {
        errors.profilePicture = 'Image size must be less than 5MB';
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(accountForm.profilePicture.type)) {
        errors.profilePicture = 'Only JPEG, PNG, and GIF images are allowed';
      }
    }
    
    setAccountErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAccountForm()) {
      return;
    }
    
    setAccountLoading(true);
    setAccountSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append('name', accountForm.name);
      formData.append('currentPassword', accountForm.currentPassword);
      formData.append('newPassword', accountForm.newPassword);
      if (accountForm.profilePicture) {
        formData.append('profilePicture', accountForm.profilePicture);
      }
      
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAccountSuccess(true);
        // Update user context with new data
        // You might need to update your AuthContext to handle this
        setAccountForm({
          name: data.user.name,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          profilePicture: null
        });
        
        // Show success message
        setTimeout(() => {
          setAccountSuccess(false);
        }, 3000);
      } else {
        if (data.error === 'Invalid current password') {
          setAccountErrors({ currentPassword: 'Current password is incorrect' });
        } else {
          setAccountErrors({ general: data.error || 'Failed to update account' });
        }
      }
    } catch (error) {
      console.error('Error updating account:', error);
      setAccountErrors({ general: 'Failed to update account. Please try again.' });
    } finally {
      setAccountLoading(false);
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'blogs', label: 'My Blogs', icon: FileText },
    { id: 'create', label: 'Create New Blog', icon: Plus },
    { id: 'explore', label: 'Explore All Blogs', icon: Globe },
    { id: 'account', label: 'Manage Account', icon: Settings }
  ];

  const categories = [
    'Technology', 'Programming', 'Design', 'Personal Growth', 
    'Travel', 'Tutorials', 'News & Trends', 'Productivity', 
    'AI & Machine Learning', 'Others'
  ];

  // Update accountForm when user is available
  useEffect(() => {
    if (user) {
      setAccountForm(prev => ({
        ...prev,
        name: user.name || ''
      }));
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
          <Button 
            onClick={() => {
              fetchUserPosts(true);
              fetchDashboardStats();
            }}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
            disabled={postsLoading}
          >
            <RefreshCw className={`h-4 w-4 ${postsLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Your Posts</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalBlogs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalLikes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalComments}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Globe className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Your Blogs</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalBlogs}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {(dashboardStats.blogs || []).slice(0, 3).map((blog) => (
                <div key={blog.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{blog.title}</h3>
                    <p className="text-sm text-gray-600">{new Date(blog.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {blog.views || 0}
                    </span>
                    <span className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {blog.likes || 0}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {blog.comments || 0}
                    </span>
                  </div>
                </div>
              ))}
              {(dashboardStats.blogs || []).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No blogs yet. Create your first blog to see activity here!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBlogs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">All Your Posts</h2>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => fetchUserPosts(true)}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
            disabled={postsLoading}
          >
            <RefreshCw className={`h-4 w-4 ${postsLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button onClick={() => setActiveTab('create')} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create New Post
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          {userPosts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs posted yet!</h3>
              <p className="text-gray-600 mb-4">Start writing your first blog post and share your thoughts with the world!</p>
              <Button onClick={() => setActiveTab('create')} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          {post.category}
                        </span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {parseInt(post.views) || 0} views
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {parseInt(post.likes) || 0} likes
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {parseInt(post.comments_count) || 0} comments
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {post.description.substring(0, 150)}...
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(post)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCreatePost = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {editingPost ? 'Edit Blog Post' : 'Create a New Blog Post'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleFormChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="" disabled>Choose a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Enter your blog title"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Write your blog here..."
              rows={12}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={editingPost ? cancelEdit : () => setActiveTab('overview')}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 px-6"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingPost ? 'Updating...' : 'Posting...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingPost ? 'Update' : 'Post'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderExplore = () => {
    // Navigate to explore page
    navigate('/explore');
    return null;
  };

  const renderManageAccount = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Account</h2>
      
      {/* Success Message */}
      {accountSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Account updated successfully!
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {accountErrors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {accountErrors.general}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleAccountSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
              {accountForm.profilePicture ? (
                <img 
                  src={URL.createObjectURL(accountForm.profilePicture)} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                />
              ) : user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-white border-2 border-white rounded-full p-1 cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload className="h-4 w-4" />
              <input
                type="file"
                name="profilePicture"
                accept="image/*"
                onChange={handleAccountFormChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-sm text-gray-600">Click to upload profile picture</p>
          {accountErrors.profilePicture && (
            <p className="text-sm text-red-600 mt-1">{accountErrors.profilePicture}</p>
          )}
        </div>

        {/* Name Update */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={accountForm.name}
            onChange={handleAccountFormChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
              accountErrors.name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {accountErrors.name && (
            <p className="text-sm text-red-600 mt-1">{accountErrors.name}</p>
          )}
        </div>

        {/* Email Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>

        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={accountForm.currentPassword}
            onChange={handleAccountFormChange}
            placeholder="Enter current password to make changes"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
              accountErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {accountErrors.currentPassword && (
            <p className="text-sm text-red-600 mt-1">{accountErrors.currentPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={accountForm.newPassword}
            onChange={handleAccountFormChange}
            placeholder="Enter new password (optional)"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
              accountErrors.newPassword ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {accountErrors.newPassword && (
            <p className="text-sm text-red-600 mt-1">{accountErrors.newPassword}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={accountForm.confirmPassword}
            onChange={handleAccountFormChange}
            placeholder="Confirm new password"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
              accountErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {accountErrors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">{accountErrors.confirmPassword}</p>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            disabled={accountLoading}
          >
            {accountLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Delete Account Section */}
      <div className="border-t border-gray-200 pt-6 mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
          </div>
          <p className="text-red-700 text-sm mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button
            onClick={() => setShowDeleteAccountModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'blogs':
        return renderBlogs();
      case 'create':
        return renderCreatePost();
      case 'explore':
        return renderExplore();
      case 'account':
        return renderManageAccount();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex justify-between items-center px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}!</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notification Icon */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    {notificationsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                            notification.read 
                              ? 'bg-gray-50 hover:bg-gray-100' 
                              : 'bg-blue-50 hover:bg-blue-100'
                          }`}
                          onClick={() => {
                            if (!notification.read) {
                              markNotificationAsRead(notification.id);
                            }
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.read ? 'bg-gray-400' : 'bg-blue-500'
                            }`}></div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {notification.title}
                              </h4>
                              <p className="text-gray-600 text-xs mt-1">
                                {notification.description}
                              </p>
                              <p className="text-gray-400 text-xs mt-2">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
              <User className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">{user.email}</span>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === item.id
                          ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone and the post will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete Post
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={deleteAccountPassword}
                  onChange={(e) => setDeleteAccountPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteAccountModal(false);
                    setDeleteAccountPassword('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteAccountLoading}
                >
                  {deleteAccountLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 