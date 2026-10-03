'use strict';

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Unexpected error' });
}

module.exports = { errorHandler, notFoundHandler };
