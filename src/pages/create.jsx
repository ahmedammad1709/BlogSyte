import React, { useState } from 'react';
import { Save, Eye, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';

const Create = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const categories = [
    'Technology', 'Programming', 'Design', 'Personal Growth', 
    'Travel', 'Tutorials', 'News & Trends', 'Productivity', 
    'AI & Machine Learning', 'Others'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Creating blog post:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCategorySelect = (category) => {
    setFormData({
      ...formData,
      category: category
    });
    setShowCategoryDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
          <p className="text-gray-600">Share your thoughts with the world</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Post Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your post title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between"
                    >
                      <span className={formData.category ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.category || 'Select a category'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </button>

                    {showCategoryDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {categories.map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => handleCategorySelect(category)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="technology, web development, react"
                  />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write your blog post content here..."
                  required
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button type="submit" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Publish Post
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Create; 