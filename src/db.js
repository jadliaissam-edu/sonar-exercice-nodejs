'use strict';

const Database = require('better-sqlite3');

const db = new Database(':memory:');

db.exec(`
  CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'general'
  );
  CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    tier TEXT NOT NULL DEFAULT 'standard',
    points INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    total REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL
  );
  CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    contact_email TEXT
  );
  CREATE TABLE warehouses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    contact_email TEXT
  );
  CREATE TABLE carriers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    contact_email TEXT
  );
`);

const insertProduct = db.prepare(
  'INSERT INTO products (sku, name, price, stock, category) VALUES (?, ?, ?, ?, ?)'
);
[
  ['HW-1001', 'Cordless Drill', 89.9, 25, 'hardware'],
  ['HW-1002', 'Hammer 500g', 14.5, 3, 'hardware'],
  ['HW-1003', 'Safety Goggles', 7.25, 120, 'hardware'],
  ['SW-2001', 'Barcode Scanner License', 199, 10, 'software'],
  ['OF-3001', 'A4 Paper (500 sheets)', 5.99, 400, 'office'],
  ['OF-3002', 'Stapler', 9.75, 0, 'office'],
  ['EL-4001', 'USB-C Cable 2m', 12, 60, 'electronics'],
  ['EL-4002', 'Label Printer', 149.5, 4, 'electronics']
].forEach((row) => insertProduct.run(...row));

const insertCustomer = db.prepare(
  'INSERT INTO customers (name, email, tier, points) VALUES (?, ?, ?, ?)'
);
[
  ['Acme Tools Ltd', 'orders@acme.example.com', 'gold', 1200],
  ['Birch Offices', 'purchasing@birch.example.com', 'silver', 640],
  ['Cedar Workshop', 'hello@cedar.example.com', 'standard', 80],
  ['Delta Retail', 'buyers@delta.example.com', 'bronze', 310]
].forEach((row) => insertCustomer.run(...row));

module.exports = db;
