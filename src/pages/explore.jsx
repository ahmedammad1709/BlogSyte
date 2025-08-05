import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Heart, 
  HeartOff, 
  Calendar, 
  User, 
  ArrowRight,
  ChevronDown,
  TrendingUp,
  Clock,
  Eye,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkPlus,
  Sparkles,
  Zap,
  Target,
  Globe,
  Code,
  Palette,
  BookOpen,
  Activity,
  Coffee,
  Camera,
  Music,
  Gamepad2,
  Car,
  Plane,
  Home,
  Briefcase,
  GraduationCap,
  Heart as HeartIcon,
  Star,
  Award,
  Trophy,
  Crown,
  Brain,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

const Explore = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [showComments, setShowComments] = useState(new Set());
  const [comments, setComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [visibleBlogs, setVisibleBlogs] = useState(3);
  const [hasMoreBlogs, setHasMoreBlogs] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // If still loading or not authenticated, show loading
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const categories = [
    { id: 'all', name: 'All Categories', icon: Globe },
    { id: 'technology', name: 'Technology', icon: Code },
    { id: 'programming', name: 'Programming', icon: Code },
    { id: 'design', name: 'Design', icon: Palette },
    { id: 'personal growth', name: 'Personal Growth', icon: Target },
    { id: 'travel', name: 'Travel', icon: Plane },
    { id: 'tutorials', name: 'Tutorials', icon: BookOpen },
    { id: 'news & trends', name: 'News & Trends', icon: TrendingUp },
    { id: 'productivity', name: 'Productivity', icon: Sparkles },
    { id: 'ai & machine learning', name: 'AI & Machine Learning', icon: Brain },
    { id: 'others', name: 'Others', icon: MoreHorizontal }
  ];

  useEffect(() => {
    // Generate session ID if not exists
    if (!sessionStorage.getItem('sessionId')) {
      sessionStorage.setItem('sessionId', `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
    
    fetchBlogs();
    
    // Load persisted data from localStorage
    const loadPersistedData = () => {
      // Load liked posts
      const savedLikedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      setLikedPosts(new Set(savedLikedPosts));
      
      // Load bookmarked posts
      const savedBookmarkedPosts = JSON.parse(localStorage.getItem('bookmarkedPosts') || '[]');
      setBookmarkedPosts(new Set(savedBookmarkedPosts));
      
      // Load expanded posts
      const savedExpandedPosts = JSON.parse(localStorage.getItem('expandedPosts') || '[]');
      setExpandedPosts(new Set(savedExpandedPosts));
      
      // Load comment visibility
      const savedShowComments = JSON.parse(localStorage.getItem('showComments') || '[]');
      setShowComments(new Set(savedShowComments));
    };
    
    loadPersistedData();
  }, []);

  // Check like status for all blogs when user is available
  useEffect(() => {
    if (user && blogs.length > 0) {
      const checkLikeStatus = async () => {
        const newLikedPosts = new Set();
        
        for (const blog of blogs) {
          try {
            const response = await fetch(`http://localhost:5000/api/blogs/${blog.id}/like-status?userId=${user.id}`);
            const data = await response.json();
            if (data.success && data.liked) {
              newLikedPosts.add(blog.id);
            }
          } catch (error) {
            console.error('Error checking like status:', error);
          }
        }
        
        setLikedPosts(newLikedPosts);
        localStorage.setItem('likedPosts', JSON.stringify(Array.from(newLikedPosts)));
      };
      
      checkLikeStatus();
    }
  }, [user, blogs]);

  // Track view when blog is first rendered (only once per session)
  useEffect(() => {
    if (blogs.length > 0) {
      const viewedBlogs = JSON.parse(localStorage.getItem('viewedBlogs') || '[]');
      blogs.forEach(blog => {
        if (!viewedBlogs.includes(blog.id)) {
          handleViewIncrement(blog.id);
          viewedBlogs.push(blog.id);
        }
      });
      localStorage.setItem('viewedBlogs', JSON.stringify(viewedBlogs));
    }
  }, [blogs]);

  const fetchBlogs = async () => {
    setBlogsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/blog-posts');
      const data = await response.json();
      
      if (data.success && data.posts && data.posts.length > 0) {
        // Transform the data to match the expected format
        const transformedBlogs = data.posts.map(post => ({
          id: post.id,
          title: post.title,
          description: post.description,
          author: post.author_name,
          authorImage: post.author_name.split(' ').map(n => n[0]).join('').toUpperCase(),
          category: post.category,
          image: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=500&h=300&fit=crop`,
          likes: post.likes || 0,
          comments: post.comments_count || 0,
          views: post.views || 0,
          date: new Date(post.created_at).toLocaleDateString(),
          readTime: `${Math.ceil(post.description.length / 200)} min read`
        }));
        setBlogs(transformedBlogs);
      } else {
        console.log('No blogs found or API returned empty response');
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setBlogsLoading(false);
    }
  };

  const handleLike = async (blogId) => {
    if (!user) return;
    
    const newLikedPosts = new Set(likedPosts);
    const isCurrentlyLiked = newLikedPosts.has(blogId);
    
    if (isCurrentlyLiked) {
      newLikedPosts.delete(blogId);
    } else {
      newLikedPosts.add(blogId);
    }
    
    setLikedPosts(newLikedPosts);
    
    // Save to localStorage
    localStorage.setItem('likedPosts', JSON.stringify(Array.from(newLikedPosts)));

    // Send API request to update likes in database
    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${blogId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        })
      });
      
      const data = await response.json();
      if (data.success && data.stats) {
        // Update blogs array with new counts from server
        setBlogs(prev => prev.map(blog => {
          if (blog.id === blogId) {
            return {
              ...blog,
              likes: data.stats.likes,
              views: data.stats.views,
              comments: data.stats.comments
            };
          }
          return blog;
        }));
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleBookmark = (blogId) => {
    const newBookmarkedPosts = new Set(bookmarkedPosts);
    if (newBookmarkedPosts.has(blogId)) {
      newBookmarkedPosts.delete(blogId);
    } else {
      newBookmarkedPosts.add(blogId);
    }
    setBookmarkedPosts(newBookmarkedPosts);
    
    // Save to localStorage
    localStorage.setItem('bookmarkedPosts', JSON.stringify(Array.from(newBookmarkedPosts)));
  };

  const handleViewIncrement = async (blogId) => {
    // Send API request to update views in database
    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${blogId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || null,
          sessionId: sessionStorage.getItem('sessionId') || 'anonymous'
        })
      });
      
      const data = await response.json();
      if (data.success && data.stats) {
        // Update blogs array with new counts from server
        setBlogs(prev => prev.map(blog => {
          if (blog.id === blogId) {
            return {
              ...blog,
              likes: data.stats.likes,
              views: data.stats.views,
              comments: data.stats.comments
            };
          }
          return blog;
        }));
      }
    } catch (error) {
      console.error('Error updating view:', error);
    }
  };

  const handleAddComment = async (blogId, commentText) => {
    if (!commentText.trim() || !user) return;
    
    // Send API request to add comment to database
    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${blogId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          commentText: commentText
        })
      });
      
      const data = await response.json();
      if (data.success && data.comment) {
        // Add comment to local state
        const newComment = { 
          id: data.comment.id, 
          text: data.comment.comment_text, 
          author: data.comment.author_name, 
          date: new Date(data.comment.created_at).toLocaleDateString() 
        };
        
        const updatedComments = {
          ...comments,
          [blogId]: [...(comments[blogId] || []), newComment]
        };
        setComments(updatedComments);

        // Update blogs array with new counts from server
        if (data.stats) {
          setBlogs(prev => prev.map(blog => {
            if (blog.id === blogId) {
              return {
                ...blog,
                likes: data.stats.likes,
                views: data.stats.views,
                comments: data.stats.comments
              };
            }
            return blog;
          }));
        }
        
        // Clear the comment text
        setCommentTexts(prev => ({
          ...prev,
          [blogId]: ''
        }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const loadComments = async (blogId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${blogId}/comments`);
      const data = await response.json();
      if (data.success && data.comments) {
        const serverComments = data.comments.map(comment => ({
          id: comment.id,
          text: comment.comment_text,
          author: comment.author_name,
          date: new Date(comment.created_at).toLocaleDateString()
        }));
        
        setComments(prev => ({
          ...prev,
          [blogId]: serverComments
        }));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const toggleComments = async (blogId) => {
    const newShowComments = new Set(showComments);
    if (newShowComments.has(blogId)) {
      newShowComments.delete(blogId);
    } else {
      newShowComments.add(blogId);
      // Load comments from server when opening comments section
      await loadComments(blogId);
    }
    setShowComments(newShowComments);
    localStorage.setItem('showComments', JSON.stringify(Array.from(newShowComments)));
    
    // Increment view when comments are opened
    handleViewIncrement(blogId);
  };

  const filteredAndSortedBlogs = blogs
    .filter(blog => {
      const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          blog.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
                            blog.category.toLowerCase() === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.date) - new Date(a.date);
        case 'popular':
          return b.likes - a.likes;
        case 'trending':
          return b.views - a.views;
        default:
          return 0;
      }
    });

  // Get only the visible blogs
  const displayedBlogs = filteredAndSortedBlogs.slice(0, visibleBlogs);

  // Check if there are more blogs to load
  useEffect(() => {
    setHasMoreBlogs(visibleBlogs < filteredAndSortedBlogs.length);
  }, [visibleBlogs, filteredAndSortedBlogs.length]);

  // Infinite scroll handler
  const handleScroll = () => {
    if (loadingMore || !hasMoreBlogs) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Load more when user is near bottom (within 100px)
    if (scrollTop + windowHeight >= documentHeight - 100) {
      loadMoreBlogs();
    }
  };

  // Load more blogs with animation
  const loadMoreBlogs = () => {
    if (loadingMore || !hasMoreBlogs) return;

    setLoadingMore(true);
    
    // Simulate loading delay for smooth animation
    setTimeout(() => {
      setVisibleBlogs(prev => prev + 3);
      setLoadingMore(false);
    }, 500);
  };

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMoreBlogs]);

  // Reset visible blogs when filters change
  useEffect(() => {
    setVisibleBlogs(3);
  }, [searchTerm, selectedCategory, sortBy]);

  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.name.toLowerCase().includes(categoryName.toLowerCase()));
    return category ? category.icon : Globe;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Technology': 'from-blue-500 to-purple-600',
      'Programming': 'from-indigo-500 to-blue-600',
      'Design': 'from-purple-500 to-pink-600',
      'Personal Growth': 'from-green-500 to-teal-600',
      'Travel': 'from-yellow-500 to-orange-600',
      'Tutorials': 'from-orange-500 to-red-600',
      'News & Trends': 'from-red-500 to-pink-600',
      'Productivity': 'from-emerald-500 to-green-600',
      'AI & Machine Learning': 'from-violet-500 to-purple-600',
      'Others': 'from-gray-500 to-gray-700'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  BlogHive
                </span>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
                <Link to="/explore" className="text-purple-600 font-semibold border-b-2 border-purple-600 pb-1">Explore</Link>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
            
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" asChild>
                <Link to="/dashboard">My Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Blogs</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover amazing stories, insights, and knowledge from creators around the world
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search blogs, authors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-colors w-full lg:w-auto"
              >
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">
                  {categories.find(cat => cat.id === selectedCategory)?.name || 'All Categories'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>

              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full lg:w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-10">
                  <div className="p-2">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-purple-50 text-purple-700'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Blog Feed */}
        {blogsLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {displayedBlogs.map((blog, index) => {
              const CategoryIcon = getCategoryIcon(blog.category);
              const isLiked = likedPosts.has(blog.id);
              const isBookmarked = bookmarkedPosts.has(blog.id);
              const isExpanded = expandedPosts.has(blog.id);
              const isCommentsVisible = showComments.has(blog.id);
              const blogComments = comments[blog.id] || [];
              const commentText = commentTexts[blog.id] || '';
              
              return (
                <article 
                  key={blog.id} 
                  className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform ${
                    index >= visibleBlogs - 3 ? 'animate-fade-in-up' : ''
                  }`}
                  style={{
                    animationDelay: `${(index % 3) * 0.1}s`,
                    opacity: index >= visibleBlogs - 3 ? 0 : 1,
                    animation: index >= visibleBlogs - 3 ? 'fadeInUp 0.6s ease-out forwards' : 'none'
                  }}
                >
                  {/* Blog Content */}
                  <div className="p-6">
                    {/* Author Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {blog.authorImage}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{blog.author}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{blog.date}</span>
                            <span>•</span>
                            <span>{blog.readTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 bg-gradient-to-r ${getCategoryColor(blog.category)} text-white rounded-full text-xs font-medium flex items-center space-x-1`}>
                          <CategoryIcon className="h-3 w-3" />
                          <span>{blog.category}</span>
                        </span>
                        <button
                          onClick={() => handleBookmark(blog.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          {isBookmarked ? (
                            <Bookmark className="h-4 w-4 text-purple-600 fill-current" />
                          ) : (
                            <BookmarkPlus className="h-4 w-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Blog Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {blog.title}
                    </h3>

                    {/* Blog Description */}
                    <div className="mb-4">
                      <p className={`text-gray-600 text-sm ${!isExpanded ? 'line-clamp-3' : ''}`}>
                        {blog.description}
                      </p>
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedPosts);
                          if (isExpanded) {
                            newExpanded.delete(blog.id);
                          } else {
                            newExpanded.add(blog.id);
                          }
                          setExpandedPosts(newExpanded);
                          localStorage.setItem('expandedPosts', JSON.stringify(Array.from(newExpanded)));
                        }}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2"
                      >
                        {isExpanded ? 'Show Less' : 'Read More'}
                      </button>
                    </div>

                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleLike(blog.id)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            isLiked 
                              ? 'bg-red-50 text-red-600' 
                              : 'hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {isLiked ? (
                            <Heart className="h-5 w-5 fill-current" />
                          ) : (
                            <HeartOff className="h-5 w-5" />
                          )}
                          <span className="text-sm font-medium">{blog.likes}</span>
                        </button>
                        
                        <button
                          onClick={() => toggleComments(blog.id)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">{blog.comments}</span>
                        </button>
                        
                        <div className="flex items-center space-x-2 px-3 py-2 text-gray-600">
                          <Eye className="h-5 w-5" />
                          <span className="text-sm font-medium">{blog.views.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {isCommentsVisible && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {/* Add Comment */}
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={commentText}
                              onChange={(e) => {
                                setCommentTexts({
                                  ...commentTexts,
                                  [blog.id]: e.target.value
                                });
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && commentText.trim()) {
                                  handleAddComment(blog.id, commentText);
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <Button 
                            onClick={() => handleAddComment(blog.id, commentText)}
                            disabled={!commentText.trim()}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Post
                          </Button>
                        </div>
                        
                        {/* Comments List */}
                        <div className="space-y-3">
                          {blogComments.length > 0 ? (
                            blogComments.map((commentItem) => (
                              <div key={commentItem.id} className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                  {commentItem.author.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-sm font-medium text-gray-900">{commentItem.author}</span>
                                      <span className="text-xs text-gray-500">{commentItem.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{commentItem.text}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center items-center py-8">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <span className="text-gray-600">Loading more blogs...</span>
                </div>
              </div>
            )}

            {/* No More Blogs Message */}
            {!hasMoreBlogs && displayedBlogs.length > 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No more blogs to show!</h3>
                <p className="text-gray-600">You've reached the end of all available blogs.</p>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {displayedBlogs.length === 0 && !blogsLoading && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs to show!</h3>
            <p className="text-gray-600 mb-6">There are currently no blogs available. Be the first to create amazing content!</p>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" asChild>
              <Link to="/create">Create Your First Blog</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore; 