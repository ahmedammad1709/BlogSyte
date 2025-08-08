const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000'; // Change this to your deployed URL if testing production

async function testAPI() {
  console.log('Testing API endpoints...\n');

  try {
    // Test 1: GET all blogs
    console.log('1. Testing GET /api/blogs');
    const getResponse = await fetch(`${API_BASE_URL}/api/blogs`);
    console.log(`   Status: ${getResponse.status}`);
    console.log(`   Headers:`, Object.fromEntries(getResponse.headers.entries()));
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log(`   Response: ${JSON.stringify(getData, null, 2)}`);
      
      if (getData.blogs && getData.blogs.length > 0) {
        const firstBlog = getData.blogs[0];
        console.log(`   Found blog with ID: ${firstBlog.id}`);
        
        // Test 2: PUT (update) the first blog
        console.log('\n2. Testing PUT /api/blogs/' + firstBlog.id);
        const putResponse = await fetch(`${API_BASE_URL}/api/blogs/${firstBlog.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Updated Test Blog',
            description: 'This is an updated test blog post',
            category: 'Technology'
          })
        });
        
        console.log(`   Status: ${putResponse.status}`);
        console.log(`   Headers:`, Object.fromEntries(putResponse.headers.entries()));
        
        if (putResponse.ok) {
          const putData = await putResponse.json();
          console.log(`   Response: ${JSON.stringify(putData, null, 2)}`);
          
          // Test 3: DELETE the first blog
          console.log('\n3. Testing DELETE /api/blogs/' + firstBlog.id);
          const deleteResponse = await fetch(`${API_BASE_URL}/api/blogs/${firstBlog.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          console.log(`   Status: ${deleteResponse.status}`);
          console.log(`   Headers:`, Object.fromEntries(deleteResponse.headers.entries()));
          
          if (deleteResponse.ok) {
            const deleteData = await deleteResponse.json();
            console.log(`   Response: ${JSON.stringify(deleteData, null, 2)}`);
          } else {
            const deleteError = await deleteResponse.text();
            console.log(`   Error: ${deleteError}`);
          }
        } else {
          const putError = await putResponse.text();
          console.log(`   Error: ${putError}`);
        }
      } else {
        console.log('   No blogs found to test with');
      }
    } else {
      const getError = await getResponse.text();
      console.log(`   Error: ${getError}`);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAPI();
