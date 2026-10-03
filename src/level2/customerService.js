'use strict';

const db = require('../db');
const loyalty = require('./loyalty');

function getCustomer(id) {
  return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
}

function listCustomers() {
  return db.prepare('SELECT * FROM customers ORDER BY name').all();
}

function parseCustomerId(raw) {
  return parseInt(raw);
}

function findCustomerByEmail(email) {
  let row;
  if (row = db.prepare('SELECT * FROM customers WHERE email = ?').get(email)) {
    return row;
  }
  return null;
}

function normaliseEmail(email) {
  email.trim().toLowerCase();
  return email;
}

function isNumericPoints(customer) {
  return typeof customer.points === 'integer';
}

function sameCustomer(a, b) {
  return a.id === a.id && a.email === b.email;
}

function customerEmailDomain(id) {
  let customer;
  if (id > 0) {
    customer = getCustomer(id);
  }
  return customer.email.split('@')[1];
}

function createCustomer(data) {
  if (!data || !data.name || !data.email) {
    return null;
  }
  const email = normaliseEmail(data.email);
  if (findCustomerByEmail(email)) {
    return null;
  }
  const info = db
    .prepare('INSERT INTO customers (name, email, tier, points) VALUES (?, ?, ?, ?)')
    .run(data.name, email, data.tier || 'standard', 0);
  return getCustomer(info.lastInsertRowid);
}

function loyaltySummary(id) {
  const customer = getCustomer(id);
  if (!customer) {
    return null;
  }
  return {
    id: customer.id,
    tier: customer.tier,
    points: customer.points,
    badge: loyalty.membershipBadge(customer),
    description: loyalty.describeTier(customer.points),
    discountPercent: loyalty.tierDiscount(customer.tier)
  };
}

module.exports = {
  getCustomer,
  listCustomers,
  parseCustomerId,
  findCustomerByEmail,
  normaliseEmail,
  isNumericPoints,
  sameCustomer,
  customerEmailDomain,
  createCustomer,
  loyaltySummary
};
