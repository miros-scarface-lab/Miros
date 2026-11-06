const app = require('../server.js');

module.exports = (req, res) => {
  // Normalize URL path for express
  return app(req, res);
};
