const express = require('express');
const cors = require('cors');

// Import admin endpoints
const adminIndex = require('./admin/index.js');
const adminUserBan = require('./admin/users/[userId].js');
const adminBlogDelete = require('./admin/blogs/[blogId].js');
const adminNotificationSend = require('./admin/notifications/send.js');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

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
  console.log('Stats Response:', res.body);
}

// Test admin users endpoint
async function testAdminUsers() {
  console.log('\n--- Testing Admin Users Endpoint ---');
  const req = createMockReq('GET', '/api/admin?action=users');
  const res = createMockRes();
  
  await adminIndex(req, res);
  console.log('Users Response:', res.body);
}

// Test admin blogs endpoint
async function testAdminBlogs() {
  console.log('\n--- Testing Admin Blogs Endpoint ---');
  const req = createMockReq('GET', '/api/admin?action=blogs');
  const res = createMockRes();
  
  await adminIndex(req, res);
  console.log('Blogs Response:', res.body);
}

// Test user ban endpoint
async function testUserBan() {
  console.log('\n--- Testing User Ban Endpoint ---');
  const req = createMockReq('PUT', '/api/admin/users/1', { action: 'ban' });
  req.params = { userId: '1' };
  const res = createMockRes();
  
  await adminUserBan(req, res);
  console.log('Ban Response:', res.body);
}

// Test user unban endpoint
async function testUserUnban() {
  console.log('\n--- Testing User Unban Endpoint ---');
  const req = createMockReq('PUT', '/api/admin/users/3', { action: 'unban' });
  req.params = { userId: '3' };
  const res = createMockRes();
  
  await adminUserBan(req, res);
  console.log('Unban Response:', res.body);
}

// Test blog deletion endpoint
async function testBlogDelete() {
  console.log('\n--- Testing Blog Delete Endpoint ---');
  const req = createMockReq('DELETE', '/api/admin/blogs/1');
  req.params = { blogId: '1' };
  const res = createMockRes();
  
  await adminBlogDelete(req, res);
  console.log('Delete Blog Response:', res.body);
}

// Test notification send endpoint
async function testNotificationSend() {
  console.log('\n--- Testing Notification Send Endpoint ---');
  const req = createMockReq('POST', '/api/admin/notifications/send', {
    title: 'Test Notification',
    description: 'This is a test notification',
    sendToAll: true,
    selectedUsers: []
  });
  const res = createMockRes();
  
  await adminNotificationSend(req, res);
  console.log('Notification Response:', res.body);
}

// Run all tests
async function runTests() {
  try {
    console.log('Starting Admin API Tests...');
    
    await testAdminStats();
    await testAdminUsers();
    await testAdminBlogs();
    await testUserBan();
    await testUserUnban();
    await testBlogDelete();
    await testNotificationSend();
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests(); 