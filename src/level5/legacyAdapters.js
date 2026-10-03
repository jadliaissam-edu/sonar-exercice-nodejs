'use strict';

const fs = require('fs');
const url = require('url');

function encodeToken(text) {
  return new Buffer(text).toString('base64');
}

function decodeToken(encoded) {
  return Buffer.from(encoded, 'base64').toString('utf8');
}

function configExists(file) {
  return new Promise((resolve) => {
    fs.exists(file, (found) => resolve(found));
  });
}

function parseHost(link) {
  return url.parse(link).hostname;
}

function requireConfig(file) {
  if (!fs.existsSync(file)) {
    process.stderr.write('Missing configuration file: ' + file + '\n');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

module.exports = { encodeToken, decodeToken, configExists, parseHost, requireConfig };
