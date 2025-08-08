# Debugging 405 Error - Blog Update/Delete

## Problem
You're getting a "Server error: 405" when trying to update or delete blog posts. This indicates "Method Not Allowed".

## What I've Done

### 1. Enhanced Backend Logging
- Added comprehensive logging in `api/blogs.js` to track:
  - Request method, URL, and headers
  - URL parsing details
  - Method comparison checks
  - Database connection status

### 2. Updated Vercel Configuration
- Added explicit CORS headers in `vercel.json` for API routes
- This ensures PUT and DELETE methods are properly allowed

### 3. Created Test Endpoints
- `api/test-methods.js` - Simple endpoint to test HTTP methods
- `test-methods.js` - Script to test all HTTP methods
- `test-api-methods.js` - Script to test blog API specifically

## Debugging Steps

### Step 1: Test the Methods Endpoint
Run this to see if HTTP methods work at all:

```bash
node test-methods.js
```

This will test GET, POST, PUT, DELETE on `/api/test-methods`.

### Step 2: Check Backend Logs
When you try to update/delete a blog, check your Vercel function logs for:

1. `=== BLOGS API HANDLER START ===`
2. `Request method:` (should show PUT or DELETE)
3. `Method comparison:` (should show the method correctly)
4. `URL parsing debug:` (should show correct blog ID)

### Step 3: Test Blog API Directly
Run this to test the blog API:

```bash
node test-api-methods.js
```

This will:
1. Get all blogs
2. Try to update the first blog
3. Try to delete the first blog

## Common Issues and Solutions

### Issue 1: Method Not Being Recognized
**Symptoms**: Backend logs show method as undefined or empty
**Solution**: Check if your deployment is using the latest code

### Issue 2: URL Parsing Issues
**Symptoms**: Blog ID is undefined or incorrect
**Solution**: The URL parsing logic should handle both `/api/blogs/123` and `/api/blogs/123/` formats

### Issue 3: CORS Issues
**Symptoms**: Browser shows CORS errors
**Solution**: The updated `vercel.json` should fix this

## What to Check

1. **Deploy the latest changes** to Vercel
2. **Check the browser console** for any JavaScript errors
3. **Check the Network tab** in browser dev tools to see the actual request
4. **Check Vercel function logs** for the detailed logging I added

## Expected Behavior

When you click update/delete in the dashboard:

1. Frontend should log: `API endpoint: /api/blogs/123`
2. Backend should log: `Processing PUT request for blog ID: 123`
3. Backend should log: `Method comparison: { method: 'PUT', isPUT: true }`
4. Database should be updated/deleted accordingly

## If Still Not Working

1. **Check the exact error message** in browser console
2. **Check Vercel function logs** for the detailed logging
3. **Try the test scripts** to isolate the issue
4. **Share the logs** so I can help diagnose further

## Quick Fix Attempt

If the issue persists, try this temporary fix - add this to the very beginning of `api/blogs.js`:

```javascript
module.exports = async (req, res) => {
  // Force method to be recognized
  const method = req.method || req.headers['x-http-method-override'] || 'GET';
  req.method = method;
  
  // Rest of your existing code...
```

This ensures the method is always defined.
