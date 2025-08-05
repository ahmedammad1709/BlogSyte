import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  MessageSquare, 
  Heart, 
  UserX, 
  Search, 
  Filter,
  Send,
  Trash2,
  Ban,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Calendar,
  Bell,
  TrendingUp,
  Shield,
  Crown,
  Activity,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Star,
  Clock,
  Mail,
  Phone,
  MapPin,
  Globe,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  ShieldCheck,
  UserCheck,
  UserMinus,
  UserPlus,
  FileCheck,
  FileX,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Award,
  Gift,
  Sparkles,
  LogOut
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/toast';

const Admin = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    bannedUsers: 0,
    totalLikes: 0,
    totalComments: 0
  });
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [dailyPosts, setDailyPosts] = useState([]);
  const [userSignups, setUserSignups] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [notificationData, setNotificationData] = useState({
    title: '',
    description: '',
    sendToAll: false,
    selectedUsers: []
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-blue-500 to-purple-600' },
    { id: 'users', label: 'Manage Users', icon: Users, color: 'from-green-500 to-teal-600' },
    { id: 'blogs', label: 'All Blogs', icon: FileText, color: 'from-orange-500 to-red-600' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-pink-500 to-rose-600' },
    { id: 'account', label: 'Account', icon: Settings, color: 'from-indigo-500 to-purple-600' }
  ];

  // Fetch admin statistics
  const fetchStats = async () => {
    try {
      console.log('Fetching admin stats...');
      const response = await fetch('http://localhost:5000/api/admin/stats');
      const data = await response.json();
      console.log('Stats response:', data);
      
      if (data.success) {
        setStats(data.stats);
        setDailyPosts(data.dailyPosts);
        setUserSignups(data.userSignups);
        console.log('Stats updated:', data.stats);
      } else {
        console.error('Failed to fetch stats:', data.message);
        addToast('Failed to fetch statistics', 'error');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      addToast('Error fetching statistics', 'error');
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('Fetching users...');
      const response = await fetch('http://localhost:5000/api/admin/users');
      const data = await response.json();
      console.log('Users response:', data);
      
      if (data.success) {
        setUsers(data.users);
        console.log('Users updated:', data.users);
      } else {
        console.error('Failed to fetch users:', data.message);
        addToast('Failed to fetch users', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      addToast('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all blogs
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      console.log('Fetching blogs...');
      const response = await fetch('http://localhost:5000/api/admin/blogs');
      const data = await response.json();
      console.log('Blogs response:', data);
      
      if (data.success) {
        setBlogs(data.blogs);
        console.log('Blogs updated:', data.blogs);
      } else {
        console.error('Failed to fetch blogs:', data.message);
        addToast('Failed to fetch blogs', 'error');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      addToast('Error fetching blogs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Ban user
  const handleBanUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        addToast('User banned successfully', 'success');
        await fetchUsers();
        await fetchStats();
      } else {
        addToast(data.message || 'Failed to ban user', 'error');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      addToast('Error banning user', 'error');
    }
  };

  // Unban user
  const handleUnbanUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/unban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        addToast('User unbanned successfully', 'success');
        await fetchUsers();
        await fetchStats();
      } else {
        addToast(data.message || 'Failed to unban user', 'error');
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      addToast('Error unbanning user', 'error');
    }
  };

  // Delete blog
  const handleDeleteBlog = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBlog = async () => {
    if (blogToDelete) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/blogs/${blogToDelete.id}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        
        if (data.success) {
          addToast('Blog deleted successfully', 'success');
          await fetchBlogs();
          await fetchStats();
        } else {
          addToast(data.message || 'Failed to delete blog', 'error');
        }
      } catch (error) {
        console.error('Error deleting blog:', error);
        addToast('Error deleting blog', 'error');
      }
    }
    setShowDeleteConfirm(false);
    setBlogToDelete(null);
  };

  const handleSendNotification = async () => {
    if (!notificationData.title.trim() || !notificationData.description.trim()) {
      addToast('Please fill in both title and description', 'error');
      return;
    }

    if (!notificationData.sendToAll && notificationData.selectedUsers.length === 0) {
      addToast('Please select users to send notification to', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: notificationData.title,
          description: notificationData.description,
          sendToAll: notificationData.sendToAll,
          selectedUsers: notificationData.selectedUsers
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        addToast(`Notification sent successfully to ${data.recipientCount} users!`, 'success');
        // Reset form
        setNotificationData({
          title: '',
          description: '',
          sendToAll: false,
          selectedUsers: []
        });
      } else {
        addToast(data.message || 'Failed to send notification', 'error');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      addToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelection = (userId) => {
    setNotificationData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Load data on component mount
  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchBlogs();
  }, []);

  // Filter users and blogs based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsers = filteredUsers.filter(user => !user.banned);
  const bannedUsers = filteredUsers.filter(user => user.banned);

  // Generate chart data for daily posts
  const generateDailyPostsData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = new Array(7).fill(0);
    
    dailyPosts.forEach(post => {
      const date = new Date(post.date);
      const dayIndex = date.getDay();
      data[dayIndex] = parseInt(post.count);
    });
    
    return data;
  };

  // Generate chart data for user signups
  const generateUserSignupsData = () => {
    const data = new Array(30).fill(0);
    
    userSignups.forEach(signup => {
      const date = new Date(signup.date);
      const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo < 30) {
        data[29 - daysAgo] = parseInt(signup.count);
      }
    });
    
    return data;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Super Admin
                  </h1>
                  <p className="text-sm text-gray-600">BlogHive Platform Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Admin Panel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 mb-8 overflow-hidden">
          <nav className="flex space-x-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {activeTab === 'overview' && (
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Users className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-300" />
                    <span className="text-sm text-blue-100 ml-2">Active platform users</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Blogs</p>
                      <p className="text-3xl font-bold">{stats.totalBlogs.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <FileText className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-300" />
                    <span className="text-sm text-green-100 ml-2">Published content</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">Banned Users</p>
                      <p className="text-3xl font-bold">{stats.bannedUsers}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <UserX className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <AlertTriangle className="h-4 w-4 text-red-300" />
                    <span className="text-sm text-red-100 ml-2">Restricted accounts</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-100 text-sm font-medium">Total Likes</p>
                      <p className="text-3xl font-bold">{stats.totalLikes.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Heart className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-pink-300" />
                    <span className="text-sm text-pink-100 ml-2">User engagement</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Comments</p>
                      <p className="text-3xl font-bold">{stats.totalComments.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <MessageSquare className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-purple-300" />
                    <span className="text-sm text-purple-100 ml-2">User engagement</span>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Daily New Posts (Last 7 Days)</h3>
                  </div>
                  <div className="flex items-end space-x-2 h-32">
                    {generateDailyPostsData().map((value, index) => (
                      <div key={index} className="flex-1 bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg shadow-lg" style={{ height: `${Math.max((value / Math.max(...generateDailyPostsData(), 1)) * 100, 10)}%` }}>
                        <div className="text-xs text-center text-white mt-1 font-medium">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-4 font-medium">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <span key={index}>{day}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                      <UserPlus className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">User Signups (Last 30 Days)</h3>
                  </div>
                  <div className="flex items-end space-x-1 h-32">
                    {generateUserSignupsData().map((value, index) => (
                      <div key={index} className="flex-1 bg-gradient-to-t from-green-500 to-green-600 rounded-t-lg shadow-lg" style={{ height: `${Math.max((value / Math.max(...generateUserSignupsData(), 1)) * 100, 10)}%` }}>
                        <div className="text-xs text-center text-white mt-1 font-medium">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-4 font-medium">Last 30 days</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : (
                <>
                  {/* Active Users */}
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                        <UserCheck className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">{activeUsers.length}</span>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gradient-to-r from-green-500 to-teal-600">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">User</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Posts</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Signup Date</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {activeUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                      <div className="text-sm text-gray-500">ID: {user.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    {user.posts_count} posts
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <Button
                                    onClick={() => handleBanUser(user.id)}
                                    className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg"
                                  >
                                    <Ban className="h-4 w-4" />
                                    <span>Ban User</span>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Banned Users */}
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                        <UserMinus className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Banned Users</h3>
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">{bannedUsers.length}</span>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gradient-to-r from-red-500 to-red-600">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">User</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Banned Date</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {bannedUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                      <div className="text-sm text-gray-500">ID: {user.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {user.banned_at ? new Date(user.banned_at).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <Button
                                    onClick={() => handleUnbanUser(user.id)}
                                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
                                  >
                                    <Unlock className="h-4 w-4" />
                                    <span>Unban User</span>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'blogs' && (
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">All Blogs</h2>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search blogs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading blogs...</p>
                </div>
              ) : (
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-orange-500 to-red-600">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Blog</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Author</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Comments</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Likes</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredBlogs.map((blog) => (
                          <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                                <div className="text-sm text-gray-500">ID: {blog.id}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{blog.author_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium">
                                {blog.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="h-4 w-4 text-gray-400" />
                                <span>{blog.comments.toLocaleString()}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center space-x-1">
                                <Heart className="h-4 w-4 text-red-400" />
                                <span>{blog.likes.toLocaleString()}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(blog.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                onClick={() => handleDeleteBlog(blog)}
                                className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Send Notifications</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Notification Form */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                    <Send className="h-5 w-5 text-pink-600" />
                    <span>Create Notification</span>
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Title
                      </label>
                      <input
                        type="text"
                        value={notificationData.title}
                        onChange={(e) => setNotificationData({...notificationData, title: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        placeholder="Enter notification title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={notificationData.description}
                        onChange={(e) => setNotificationData({...notificationData, description: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        placeholder="Enter notification description..."
                      />
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200">
                      <input
                        type="checkbox"
                        checked={notificationData.sendToAll}
                        onChange={(e) => {
                          const sendToAll = e.target.checked;
                          setNotificationData({
                            ...notificationData, 
                            sendToAll,
                            selectedUsers: sendToAll ? [] : notificationData.selectedUsers
                          });
                        }}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Send to all users</span>
                        <p className="text-xs text-gray-500">This will send the notification to all active users</p>
                      </div>
                    </div>

                    <Button
                      onClick={handleSendNotification}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-lg py-3 rounded-xl"
                      disabled={!notificationData.title || !notificationData.description || loading}
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>
                            {notificationData.sendToAll 
                              ? 'Send to All Users' 
                              : `Send to ${notificationData.selectedUsers.length} Selected Users`
                            }
                          </span>
                        </>
                      )}
                    </Button>
                    
                    {/* Summary */}
                    {!notificationData.sendToAll && notificationData.selectedUsers.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>{notificationData.selectedUsers.length}</strong> users selected
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Selection */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Select Users {notificationData.sendToAll && '(Disabled - Sending to all users)'}</span>
                  </h3>
                  <div className={`bg-white/50 backdrop-blur-sm rounded-xl p-4 max-h-96 overflow-y-auto border border-gray-200 ${
                    notificationData.sendToAll ? 'opacity-50 pointer-events-none' : ''
                  }`}>
                    {users.filter(user => !user.banned).map((user) => (
                      <div key={user.id} className="flex items-center space-x-3 py-3 hover:bg-gray-50/50 rounded-lg px-2 transition-colors">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          checked={notificationData.selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelection(user.id)}
                          disabled={notificationData.sendToAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <label htmlFor={`user-${user.id}`} className="text-sm text-gray-700 cursor-pointer">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Manage Account</h2>
              </div>
              
              <div className="max-w-2xl">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-xl border border-white/20">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      SA
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Super Admin</h3>
                      <p className="text-gray-600">admin@bloghive.com</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg py-3 rounded-xl">
                      Update Password
                    </Button>

                    <div className="pt-6 border-t border-gray-200">
                      <Button 
                        onClick={handleLogout}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg py-3 rounded-xl flex items-center justify-center space-x-2"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
              Are you sure you want to delete "{blogToDelete?.title}"? This action cannot be undone and the blog will be permanently removed.
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
                onClick={confirmDeleteBlog}
              >
                Delete Blog
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 