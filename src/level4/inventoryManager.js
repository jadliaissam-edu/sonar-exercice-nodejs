'use strict';

const db = require('../db');

const TAX_RATE = 0.21;
const CURRENCY_SYMBOLS = { EUR: 'EUR ', USD: '$', GBP: 'GBP ' };

function stockValuation() {
  const rows = db.prepare('SELECT price, stock FROM products').all();
  let total = 0;
  for (const row of rows) {
    total += row.price * row.stock;
  }
  return Math.round(total * 100) / 100;
}

function stockValuationByCategory() {
  const rows = db.prepare('SELECT category, price, stock FROM products').all();
  const result = {};
  for (const row of rows) {
    result[row.category] = (result[row.category] || 0) + row.price * row.stock;
  }
  return result;
}

function productsToCsv(rows) {
  const header = 'sku,name,price,stock';
  const lines = rows.map((r) => [r.sku, r.name, r.price, r.stock].join(','));
  return [header].concat(lines).join('\n');
}

function csvToProducts(csv) {
  const lines = csv.split('\n').slice(1);
  return lines
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const parts = line.split(',');
      return { sku: parts[0], name: parts[1], price: Number(parts[2]), stock: Number(parts[3]) };
    });
}

function addTax(amount) {
  return Math.round(amount * (1 + TAX_RATE) * 100) / 100;
}

function formatMoney(amount, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] || '';
  return symbol + amount.toFixed(2);
}

function formatSupplierLine(supplier) {
  const name = supplier.name.trim();
  const city = supplier.city.trim();
  const country = supplier.country.toUpperCase();
  return name + ' - ' + city + ' (' + country + ')';
}

function formatWarehouseLine(warehouse) {
  const name = warehouse.name.trim();
  const city = warehouse.city.trim();
  const country = warehouse.country.toUpperCase();
  return name + ' - ' + city + ' (' + country + ')';
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-/, '')
    .replace(/-$/, '');
}

function paginate(items, page, size) {
  const start = (page - 1) * size;
  return { items: items.slice(start, start + size), page, pages: Math.ceil(items.length / size) };
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function createPurchaseOrder(supplierId, sku, quantity, unitCost, currency, deliveryDate, notes, priority) {
  return {
    supplierId,
    sku,
    quantity,
    unitCost,
    currency,
    deliveryDate,
    notes,
    priority,
    total: quantity * unitCost
  };
}

function buildEmailBody(customerName, orderId, total) {
  return 'Dear ' + customerName + ',\n\nThank you for order #' + orderId + ' totalling ' + formatMoney(total, 'EUR') + '.';
}

module.exports = {
  stockValuation,
  stockValuationByCategory,
  productsToCsv,
  csvToProducts,
  addTax,
  formatMoney,
  formatSupplierLine,
  formatWarehouseLine,
  slugify,
  paginate,
  daysBetween,
  createPurchaseOrder,
  buildEmailBody
};
