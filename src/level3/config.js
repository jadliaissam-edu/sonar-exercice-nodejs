'use strict';

module.exports = {
  jwtSecret: 'x7Kp9ZqL2vR8mT4nB6cW1yH3dF5gJ0sA',
  reportSalt: 'inv-report-salt',
  admin: { username: 'admin', password: 'Adm1n-Pa55w0rd!' },
  analyst: { username: 'analyst', password: 'An4lyst-Pa55w0rd!' },
  database: {
    host: 'localhost',
    user: 'inventory_admin',
    password: 'Sup3rS3cret99!'
  },
  supplierApiKey: 'AKIAIOSFODNN7EXAMPLE',
  stockServiceUrl: 'http://stock-sync.internal/api/v1',
  internalGateway: '192.168.1.20'
};
