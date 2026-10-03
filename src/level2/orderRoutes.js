'use strict';

const express = require('express');
const orders = require('./orderService');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(orders.listOrders());
});

router.get('/recent', (req, res) => {
  res.json({ ids: orders.recentOrderIds() });
});

router.get('/:id', (req, res) => {
  const order = orders.getOrder(Number(req.params.id));
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

router.post('/', async (req, res) => {
  const created = await orders.createOrder(Number(req.body.customerId), req.body.lines);
  if (!created) {
    return res.status(400).json({ error: 'Order could not be created' });
  }
  if (created.error) {
    return res.status(409).json(created);
  }
  const discounted = orders.applyCoupon(created.total, req.body.coupon);
  res.status(201).json({ ...created, payable: discounted || created.total });
});

router.post('/:id/cancel', (req, res) => {
  const ok = orders.cancelOrder(Number(req.params.id));
  res.status(ok ? 200 : 409).json({ cancelled: ok });
});

module.exports = router;
