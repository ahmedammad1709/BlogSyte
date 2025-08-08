// Test script for blog API endpoints
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000'; // Adjust this to your API URL

async function testBlogAPI() {
  console.log('Testing Blog API endpoints...\n');

  try {
    // Test 1: Get all blogs
    console.log('1. Testing GET /api/blogs');
    const getResponse = await fetch(`${API_BASE_URL}/api/blogs`);
    const getData = await getResponse.json();
    console.log('Status:', getResponse.status);
    console.log('Response:', getData);
    console.log('');

    if (getData.success && getData.posts && getData.posts.length > 0) {
      const testBlog = getData.posts[0];
      console.log('Found test blog:', testBlog);

      // Test 2: Update blog
      console.log('\n2. Testing PUT /api/blogs/' + testBlog.id);
      const updateResponse = await fetch(`${API_BASE_URL}/api/blogs/${testBlog.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Updated Test Blog',
          description: 'This is an updated test blog post',
          category: 'Technology'
        }),
      });
      const updateData = await updateResponse.json();
      console.log('Status:', updateResponse.status);
      console.log('Response:', updateData);
      console.log('');

      // Test 3: Delete blog (only if update was successful)
      if (updateData.success) {
        console.log('\n3. Testing DELETE /api/blogs/' + testBlog.id);
        const deleteResponse = await fetch(`${API_BASE_URL}/api/blogs/${testBlog.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const deleteData = await deleteResponse.json();
        console.log('Status:', deleteResponse.status);
        console.log('Response:', deleteData);
        console.log('');
      }

      // Test 4: Verify blog was deleted
      console.log('\n4. Testing GET /api/blogs/' + testBlog.id + ' (should return 404)');
      const verifyResponse = await fetch(`${API_BASE_URL}/api/blogs/${testBlog.id}`);
      console.log('Status:', verifyResponse.status);
      if (verifyResponse.status === 404) {
        console.log('✅ Blog successfully deleted');
      } else {
        console.log('❌ Blog still exists after deletion');
      }
    } else {
      console.log('No blogs found to test with');
    }

  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Run the test
testBlogAPI();
