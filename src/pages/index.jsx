import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Edit3, 
  Search, 
  Shield, 
  Mail, 
  Phone, 
  MapPin,
  Send,
  Heart,
  Users,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react';
import MainLayout from '../components/layout/main-layout';
import { Button } from '../components/ui/button';
import BlogCard from '../components/blog/blog-card';

// Sample data for featured blogs
const featuredBlogs = [
  {
    id: '1',
    title: 'The Future of Web Development: What to Expect in 2025',
    description: 'Exploring upcoming trends in web development and what technologies will define the future of the web.',
    coverImage: 'https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'Emily Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg'
    },
    date: 'Aug 1, 2025',
    readingTime: '5 min read'
  },
  {
    id: '2',
    title: 'Mastering Productivity: Time Management Techniques for Busy Professionals',
    description: 'Learn how to optimize your workflow and increase productivity with these proven time management strategies.',
    coverImage: 'https://images.unsplash.com/photo-1485988412941-77a35537dae4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    date: 'Jul 28, 2025',
    readingTime: '8 min read'
  },
  {
    id: '3',
    title: 'The Psychology Behind Successful Content Creation',
    description: 'Understanding human psychology can help you create more engaging and effective content for your audience.',
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'Sarah Williams',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    date: 'Jul 24, 2025',
    readingTime: '6 min read'
  }
];

// Features data
const features = [
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: 'AI-Powered Writing',
    description: 'Advanced AI assistance to help you create compelling content faster and more efficiently.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Community Driven',
    description: 'Connect with like-minded creators and build meaningful relationships in our vibrant community.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: 'Analytics & Insights',
    description: 'Track your content performance with detailed analytics and actionable insights.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'Privacy First',
    description: 'Your data is protected with enterprise-grade security and privacy controls.',
    gradient: 'from-orange-500 to-red-500'
  }
];

// Animated background component
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
    <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
  </div>
);



// Smooth scroll component
const SmoothScrollLink = ({ to, children, className = "" }) => {
  const handleClick = (e) => {
    e.preventDefault();
    const element = document.querySelector(to);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', contactForm);
    // Reset form
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white transition-colors duration-300">
      {/* Enhanced Navbar */}
              <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                BlogSyte
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <SmoothScrollLink to="#home" className="text-gray-700 hover:text-purple-600 transition-colors duration-300">
                Home
              </SmoothScrollLink>
              <SmoothScrollLink to="#features" className="text-gray-700 hover:text-purple-600 transition-colors duration-300">
                Features
              </SmoothScrollLink>
              <SmoothScrollLink to="#blogs" className="text-gray-700 hover:text-purple-600 transition-colors duration-300">
                Blogs
              </SmoothScrollLink>
              <SmoothScrollLink to="#contact" className="text-gray-700 hover:text-purple-600 transition-colors duration-300">
                Contact
              </SmoothScrollLink>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-purple-800 to-violet-900 bg-clip-text text-transparent">
                Where Ideas
                <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Come Alive
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of creators sharing their stories, insights, and passions. 
                Start your blogging journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap" asChild>
                  <Link to="/signup">
                    <span className="flex items-center">
                      Get Started 
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="group border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300 transform hover:scale-105 whitespace-nowrap" asChild>
                  <Link to="/signup">
                    <span className="flex items-center">
                      Explore Blogs
                      <ExternalLink className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-gray-400" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-purple-600 dark:from-white dark:to-purple-400 bg-clip-text text-transparent">
              Why Choose BlogSyte?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the next generation of blogging with cutting-edge features designed for modern creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-600`}
                style={{
                  animationDelay: `${index * 200}ms`
                }}
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Blogs Section */}
      <section id="blogs" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-purple-600 dark:from-white dark:to-purple-400 bg-clip-text text-transparent">
              Featured Stories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover compelling stories from our community of talented writers and creators.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredBlogs.map((blog, index) => (
              <div
                key={blog.id}
                className="group transform hover:scale-105 transition-all duration-300"
                style={{
                  animationDelay: `${index * 200}ms`
                }}
              >
                <BlogCard {...blog} />
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              size="lg"
              className="group border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <Link to="/explore">
                See All Blogs
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-purple-600 dark:from-white dark:to-purple-400 bg-clip-text text-transparent">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Have questions or want to collaborate? We'd love to hear from you!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300"
                    placeholder="Tell us what's on your mind..."
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                >
                  Send Message
                  <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Let's Connect
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email</p>
                      <p className="text-gray-600 dark:text-gray-300">hello@blogsyte.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                      <p className="text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Location</p>
                      <p className="text-gray-600 dark:text-gray-300">San Francisco, CA</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-xl font-bold">BlogSyte</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering creators to share their stories with the world. Join our community and start your blogging journey today.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors duration-300">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors duration-300">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors duration-300">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors duration-300">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Blog</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 BlogSyte. Made with <Heart className="inline h-4 w-4 text-red-500" /> for creators worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 