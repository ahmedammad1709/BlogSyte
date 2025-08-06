// Simple test for admin API endpoints
const adminIndex = require('./admin/index.js');

// Mock request and response objects
const createMockReq = (method, url, body = {}, query = {}) => ({
  method,
  url,
  body,
  query,
  params: {}
});

const createMockRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    json: function(data) {
      this.body = data;
      console.log('Response:', data);
      return this;
    },
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    setHeader: function(name, value) {
      this.headers[name] = value;
    }
  };
  return res;
};

// Test admin stats endpoint
async function testAdminStats() {
  console.log('\n--- Testing Admin Stats Endpoint ---');
  const req = createMockReq('GET', '/api/admin?action=stats');
  const res = createMockRes();
  
  await adminIndex(req, res);
}

// Test admin users endpoint
async function testAdminUsers() {
  console.log('\n--- Testing Admin Users Endpoint ---');
  const req = createMockReq('GET', '/api/admin?action=users');
  const res = createMockRes();
  
  await adminIndex(req, res);
}

// Test admin blogs endpoint
async function testAdminBlogs() {
  console.log('\n--- Testing Admin Blogs Endpoint ---');
  const req = createMockReq('GET', '/api/admin?action=blogs');
  const res = createMockRes();
  
  await adminIndex(req, res);
}

// Run all tests
async function runTests() {
  try {
    console.log('Starting Admin API Tests...');
    
    await testAdminStats();
    await testAdminUsers();
    await testAdminBlogs();
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests(); 