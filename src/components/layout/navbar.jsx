import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { Button } from '../ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const smoothScrollTo = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              BlogSyte
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => smoothScrollTo('#home')}
              className="text-gray-700 hover:text-purple-600 transition-colors duration-300 font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => smoothScrollTo('#features')}
              className="text-gray-700 hover:text-purple-600 transition-colors duration-300 font-medium"
            >
              Features
            </button>
            <button 
              onClick={() => smoothScrollTo('#blogs')}
              className="text-gray-700 hover:text-purple-600 transition-colors duration-300 font-medium"
            >
              Blogs
            </button>
            <button 
              onClick={() => smoothScrollTo('#contact')}
              className="text-gray-700 hover:text-purple-600 transition-colors duration-300 font-medium"
            >
              Contact
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" className="group">
              <Search className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Search
            </Button>
            <Button asChild className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-purple-200">
              <Link to="/login">
                <span className="flex items-center whitespace-nowrap">
                  Login
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="group border-2 border-purple-600 text-purple-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-purple-200">
              <Link to="/signup">
                <span className="flex items-center whitespace-nowrap">
                  Get Started
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="py-4 border-t border-gray-200 space-y-4">
            <button 
              onClick={() => smoothScrollTo('#home')}
              className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors duration-300 font-medium py-2"
            >
              Home
            </button>
            <button 
              onClick={() => smoothScrollTo('#features')}
              className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors duration-300 font-medium py-2"
            >
              Features
            </button>
            <button 
              onClick={() => smoothScrollTo('#blogs')}
              className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors duration-300 font-medium py-2"
            >
              Blogs
            </button>
            <button 
              onClick={() => smoothScrollTo('#contact')}
              className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors duration-300 font-medium py-2"
            >
              Contact
            </button>
            
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-purple-200" asChild>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button variant="outline" className="w-full border-2 border-purple-600 text-purple-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-purple-200" asChild>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 