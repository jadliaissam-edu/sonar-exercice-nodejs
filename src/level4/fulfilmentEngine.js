'use strict';

const db = require('../db');

function runQuery(sql, params, callback) {
  try {
    const rows = db.prepare(sql).all(...params);
    callback(null, rows);
  } catch (err) {
    callback(err);
  }
}

function planFulfilment(orderId, options, done) {
  runQuery('SELECT * FROM orders WHERE id = ?', [orderId], function (err, orders) {
    if (err) {
      return done(err);
    }
    if (orders.length === 0) {
      return done(new Error('Order not found'));
    }
    runQuery('SELECT * FROM order_items WHERE order_id = ?', [orderId], function (err2, items) {
      if (err2) {
        return done(err2);
      }
      const plan = [];
      let pending = items.length;
      if (pending === 0) {
        return done(null, plan);
      }
      items.forEach(function (item) {
        runQuery('SELECT * FROM products WHERE id = ?', [item.product_id], function (err3, products) {
          if (err3) {
            return done(err3);
          }
          if (products.length > 0) {
            const product = products[0];
            if (product.stock >= item.quantity) {
              if (options && options.express) {
                if (item.quantity > 10) {
                  plan.push({ sku: product.sku, quantity: item.quantity, method: 'freight', source: 'main' });
                } else {
                  plan.push({ sku: product.sku, quantity: item.quantity, method: 'courier', source: 'main' });
                }
              } else {
                plan.push({ sku: product.sku, quantity: item.quantity, method: 'standard', source: 'main' });
              }
            } else {
              if (options && options.allowBackorder) {
                runQuery('SELECT * FROM suppliers ORDER BY id', [], function (err4, suppliers) {
                  if (suppliers && suppliers.length > 0) {
                    suppliers.forEach(function (supplier) {
                      if (supplier.country === 'LT') {
                        if (product.stock > 0) {
                          plan.push({ sku: product.sku, quantity: product.stock, method: 'split', source: 'main' });
                          plan.push({
                            sku: product.sku,
                            quantity: item.quantity - product.stock,
                            method: 'backorder',
                            source: supplier.name
                          });
                        } else {
                          plan.push({ sku: product.sku, quantity: item.quantity, method: 'backorder', source: supplier.name });
                        }
                      }
                    });
                  }
                });
              } else {
                plan.push({ sku: product.sku, quantity: 0, method: 'unavailable', source: null });
              }
            }
          }
          pending = pending - 1;
          if (pending === 0) {
            done(null, plan);
          }
        });
      });
    });
  });
}

module.exports = { planFulfilment, runQuery };
