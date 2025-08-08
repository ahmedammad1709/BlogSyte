const handler = require('../../blogs.js');

module.exports = async (req, res) => {
  // Delegate to the shared blogs handler which supports GET/POST with action routing
  return handler(req, res);
};


