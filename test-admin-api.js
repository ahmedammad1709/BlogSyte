// Test admin API endpoints
const API_BASE = 'http://localhost:5000/api';

async function testAdminAPI() {
  try {
    console.log('Testing Admin API endpoints...\n');

    // Test admin stats
    console.log('1. Testing admin stats...');
    const statsResponse = await fetch(`${API_BASE}/admin?action=stats`);
    const statsData = await statsResponse.json();
    console.log('Stats response:', statsData);

    // Test admin users
    console.log('\n2. Testing admin users...');
    const usersResponse = await fetch(`${API_BASE}/admin?action=users`);
    const usersData = await usersResponse.json();
    console.log('Users response:', usersData);

    // Test admin blogs
    console.log('\n3. Testing admin blogs...');
    const blogsResponse = await fetch(`${API_BASE}/admin?action=blogs`);
    const blogsData = await blogsResponse.json();
    console.log('Blogs response:', blogsData);

    console.log('\n✅ All admin API tests completed!');
  } catch (error) {
    console.error('❌ Error testing admin API:', error);
  }
}

testAdminAPI(); 