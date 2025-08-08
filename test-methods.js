const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000'; // Change this to your deployed URL if testing production

async function testMethods() {
  console.log('Testing HTTP methods...\n');

  const methods = ['GET', 'POST', 'PUT', 'DELETE'];

  for (const method of methods) {
    try {
      console.log(`Testing ${method} method...`);
      
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      // Add body for POST and PUT
      if (method === 'POST' || method === 'PUT') {
        options.body = JSON.stringify({ test: 'data' });
      }

      const response = await fetch(`${API_BASE_URL}/api/test-methods`, options);
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
      }
      
      console.log('');
    } catch (error) {
      console.error(`Error testing ${method}:`, error);
    }
  }
}

testMethods();
