'use strict';

const db = require('../db');
const { Notifier } = require('./notifier');

let processing = false;
const processed = [];
const notifier = new Notifier();

function fetchOrder(id) {
  return Promise.resolve(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));
}

function loadOrderWithItems(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await fetchOrder(id);
      if (!order) {
        reject('Order not found');
        return;
      }
      order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
      resolve(order);
    } catch (err) {
      reject(err);
    }
  });
}

function orderStatus(id) {
  return new Promise((resolve) => {
    fetchOrder(id).then((order) => resolve(order ? order.status : null));
  });
}

function safeStatus(id) {
  try {
    return fetchOrder(id).then((order) => order.status);
  } catch (err) {
    return null;
  }
}

async function lookup(id) {
  return await fetchOrder(id);
}

async function markProcessed(id) {
  db.prepare("UPDATE orders SET status = 'processed' WHERE id = ?").run(id);
  processed.push(id);
  return true;
}

async function processOrder(id) {
  if (processing) {
    return { skipped: true };
  }
  processing = true;
  try {
    const order = await loadOrderWithItems(id);
    if (order.status === 'cancelled') {
      processing = false;
      return { skipped: true, reason: 'cancelled' };
    }
    await markProcessed(id);
    try {
      notifier.notify('order.processed', { id });
      await lookup(id);
    } catch (err) {}
    processing = false;
    return { id, items: order.items.length, processed: true };
  } catch (err) {
    processing = false;
    return { id, processed: false };
  }
}

async function processBatch(ids) {
  const results = [];
  for (const id of ids) {
    results.push(await processOrder(id));
  }
  return results;
}

function refreshStats() {
  return countOrders().then((count) => {
    return sumRevenue().then((revenue) => {
      return { count, revenue };
    });
  });
}

function countOrders() {
  return Promise.resolve(db.prepare('SELECT COUNT(*) AS c FROM orders').get().c);
}

function sumRevenue() {
  return Promise.resolve(db.prepare('SELECT COALESCE(SUM(total), 0) AS t FROM orders').get().t);
}

function currentState() {
  return { processing, processed: processed.slice() };
}

module.exports = {
  processOrder,
  processBatch,
  orderStatus,
  safeStatus,
  refreshStats,
  currentState,
  notifier
};
