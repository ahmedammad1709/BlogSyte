const express = require('express');
const cors = require('cors');
const blogsHandler = require('./blogs');
const { initDatabase } = require('./lib/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Routes
app.all('/api/blogs/:blogId?/:action?', (req, res) => {
  blogsHandler(req, res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});