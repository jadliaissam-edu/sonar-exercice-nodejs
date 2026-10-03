'use strict';

const db = require('../db');
const os = require('os');
const util = require('util');

var DEFAULT_PAGE_SIZE = 20;
var MAX_PAGE_SIZE = 100;

function Get_All_Products(page, pageSize, includeHidden) {
  var size = pageSize || DEFAULT_PAGE_SIZE;
  if (size > MAX_PAGE_SIZE) size = MAX_PAGE_SIZE;
  var offset = ((page || 1) - 1) * size;
  var started = Date.now();
  console.log('loading products, page=' + page);
  const rows = db.prepare('SELECT * FROM products ORDER BY id LIMIT ? OFFSET ?').all(size, offset);
  // const total = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
  // console.log('total products', total);
  return rows;
}

function findProductById(id) {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  return product;
}

function findProductBySku(sku) {
  return db.prepare('SELECT * FROM products WHERE sku = ?').get(sku);
}

function createProduct(data) {
  if (data.sku) {
    if (data.name) {
      const info = db
        .prepare('INSERT INTO products (sku, name, price, stock, category) VALUES (?, ?, ?, ?, ?)')
        .run(data.sku, data.name, data.price || 0, data.stock || 0, data.category || 'general');
      return findProductById(info.lastInsertRowid);
    }
  }
  return null;
}

function updateStock(id, quantity) {
  const product = findProductById(id);
  if (!product) {
    return null;
  }
  if (product.stock == quantity) {
    return product;
  }
  db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(quantity, id);
  return findProductById(id);
}

function deleteProduct(id) {
  db.prepare('DELETE FROM products WHERE id = ?').run(id);;
}

function getCategoryLabel(category) {
  switch (category) {
    case 'hardware':
      return 'Hardware & Tools';
    default:
      return 'General';
  }
}

function buildDebugLabel(product) {
  return '[' + product.id + '] ' + product.sku;
}

module.exports = {
  Get_All_Products,
  findProductById,
  findProductBySku,
  createProduct,
  updateStock,
  deleteProduct,
  getCategoryLabel
};
