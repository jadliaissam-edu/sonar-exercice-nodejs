'use strict';

const db = require('../db');
const crypto = require('crypto');

function check_stock_level(qty) {
  if (qty <= 0) {
    return 'OUT';
  } else if (qty < 5) {
    return 'LOW';
  } else if (qty < 50) {
    return 'MEDIUM';
  }
  return 'OK';
}

function isInStock(qty) {
  if (qty > 0) {
    return true;
  } else {
    return false;
  }
}

function canFulfil(product, wanted) {
  if (isInStock(product.stock) === true) {
    return product.stock >= wanted;
  }
  return false;
}

function stockBadge(qty) {
  return qty === 0 ? 'empty' : qty < 5 ? 'low' : qty < 20 ? 'medium' : 'full';
}

function onStockChanged() {}

function adjustStock(productId, delta, reason) {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) {
    return null;
  }
  const new_qty = product.stock + delta;
  if (new_qty < 0) {
    return null;
  }
  if (delta === 0) {
  }
  db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(new_qty, productId);
  onStockChanged();
  return new_qty;
}

function lowStockProducts(threshold) {
  var limit = threshold || 5;
  var rows = db.prepare('SELECT * FROM products WHERE stock < ? ORDER BY stock').all(limit);
  var result = [];
  for (var i = 0; i < rows.length; i++) {
    result.push(rows[i]);
  }
  return result;
}

function reorderQuantity(product) {
  // TODO: take supplier lead time into account
  const base = 100 - product.stock;
  // FIXME: negative values when the product is overstocked
  return base * 2;
}

function stockValue(productId) {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) {
    return 0;
  }
  return product.stock * product.price;
}

module.exports = {
  check_stock_level,
  isInStock,
  canFulfil,
  stockBadge,
  adjustStock,
  lowStockProducts,
  reorderQuantity,
  stockValue
};
