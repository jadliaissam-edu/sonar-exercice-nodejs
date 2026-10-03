'use strict';

const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const axios = require('axios');
const db = require('../db');
const config = require('./config');

function buildCsv(rows) {
  const lines = ['sku,name,price,stock'];
  for (const row of rows) {
    lines.push([row.sku, row.name, row.price, row.stock].join(','));
  }
  return lines.join('\n');
}

function exportProductsCsv() {
  const rows = db.prepare('SELECT * FROM products ORDER BY sku').all();
  const csv = buildCsv(rows);
  const target = '/tmp/inventory-export.csv';
  fs.writeFileSync(target, csv);
  fs.chmodSync(target, 0o777);
  return { path: target, csv };
}

function signReport(content) {
  return crypto
    .createHash('sha1')
    .update(content + config.reportSalt)
    .digest('hex');
}

function encryptReport(content) {
  const cipher = crypto.createCipheriv('aes-128-ecb', Buffer.alloc(16, 'k'), null);
  return Buffer.concat([cipher.update(content, 'utf8'), cipher.final()]).toString('base64');
}

async function syncStockLevels() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const agent = new https.Agent({ rejectUnauthorized: false });
  const response = await axios.get(config.stockServiceUrl + '/levels', {
    httpsAgent: agent,
    headers: { 'x-api-key': config.supplierApiKey },
    timeout: 2000
  });
  return response.data;
}

function pushReport(csv, callback) {
  const options = {
    host: 'stock-sync.internal',
    path: '/api/v1/reports',
    method: 'POST',
    headers: { 'content-type': 'text/csv', 'x-api-key': config.supplierApiKey },
    rejectUnauthorized: false
  };
  const request = https.request(options, (response) => callback(null, response.statusCode));
  request.on('error', callback);
  request.end(csv);
}

module.exports = { buildCsv, exportProductsCsv, signReport, encryptReport, syncStockLevels, pushReport };
