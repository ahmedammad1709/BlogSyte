// Simple API test script
const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('Testing API endpoints...\n');

  // Test database connection
  try {
    console.log('1. Testing database connection...');
    const dbResponse = await fetch(`${API_BASE}/test-db`);
    const dbData = await dbResponse.json();
    console.log('Database test:', dbData.success ? '✅ PASS' : '❌ FAIL');
    if (!dbData.success) console.log('Error:', dbData.message);
  } catch (error) {
    console.log('❌ Database test failed:', error.message);
  }

  // Test admin stats
  try {
    console.log('\n2. Testing admin stats...');
    const statsResponse = await fetch(`${API_BASE}/admin?action=stats`);
    const statsData = await statsResponse.json();
    console.log('Admin stats:', statsData.success ? '✅ PASS' : '❌ FAIL');
    if (statsData.success) {
      console.log('Stats:', statsData.stats);
    } else {
      console.log('Error:', statsData.message);
    }
  } catch (error) {
    console.log('❌ Admin stats test failed:', error.message);
  }

  // Test users endpoint
  try {
    console.log('\n3. Testing users endpoint...');
    const usersResponse = await fetch(`${API_BASE}/admin?action=users`);
    const usersData = await usersResponse.json();
    console.log('Users endpoint:', usersData.success ? '✅ PASS' : '❌ FAIL');
    if (usersData.success) {
      console.log(`Found ${usersData.users.length} users`);
    } else {
      console.log('Error:', usersData.message);
    }
  } catch (error) {
    console.log('❌ Users test failed:', error.message);
  }

  // Test blogs endpoint
  try {
    console.log('\n4. Testing blogs endpoint...');
    const blogsResponse = await fetch(`${API_BASE}/admin?action=blogs`);
    const blogsData = await blogsResponse.json();
    console.log('Blogs endpoint:', blogsData.success ? '✅ PASS' : '❌ FAIL');
    if (blogsData.success) {
      console.log(`Found ${blogsData.blogs.length} blogs`);
    } else {
      console.log('Error:', blogsData.message);
    }
  } catch (error) {
    console.log('❌ Blogs test failed:', error.message);
  }

  // Test blog posts endpoint
  try {
    console.log('\n5. Testing blog posts endpoint...');
    const postsResponse = await fetch(`${API_BASE}/blog-posts`);
    const postsData = await postsResponse.json();
    console.log('Blog posts:', postsData.success ? '✅ PASS' : '❌ FAIL');
    if (postsData.success) {
      console.log(`Found ${postsData.posts.length} posts`);
    } else {
      console.log('Error:', postsData.message);
    }
  } catch (error) {
    console.log('❌ Blog posts test failed:', error.message);
  }

  console.log('\n✅ API testing completed!');
}

// Run the test
testAPI().catch(console.error); 