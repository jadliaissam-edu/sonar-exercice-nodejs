'use strict';

const crypto = require('crypto');
const db = require('../db');

const entries = {};
let hits = 0;
let misses = 0;

function etagFor(body) {
  return '"' + crypto.createHash('sha1').update(body).digest('hex') + '"';
}

function getProductsSnapshot(maxAgeMs) {
  const now = Date.now();
  const cached = entries.products;
  if (cached && now - cached.at < maxAgeMs) {
    hits++;
    return cached;
  }
  misses++;
  const body = JSON.stringify(db.prepare('SELECT id, sku, name, price, stock FROM products ORDER BY id').all());
  entries.products = { at: now, body, etag: etagFor(body) };
  return entries.products;
}

function clearCache() {
  delete entries.products;
}

function cacheStats() {
  return { hits, misses, keys: Object.keys(entries) };
}

module.exports = { etagFor, getProductsSnapshot, clearCache, cacheStats };
