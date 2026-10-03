'use strict';

const express = require('express');
const db = require('../db');
const processor = require('./orderProcessor');
const cache = require('./cache');
const { OrderSummary, RushOrderSummary } = require('./orderSummary');
const { formatMessage, listenerTotal } = require('./notifier');
const { parseHost, encodeToken } = require('./legacyAdapters');

const router = express.Router();

router.post('/batch', async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number) : [];
  res.json({ results: await processor.processBatch(ids) });
});

router.post('/order/:id', async (req, res) => {
  res.json(await processor.processOrder(Number(req.params.id)));
});

router.get('/status', (req, res) => {
  res.json(processor.currentState());
});

router.get('/status/:id', async (req, res) => {
  const status = await processor.orderStatus(Number(req.params.id));
  if (!status) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ status });
});

router.get('/stats', (req, res) => {
  processor.refreshStats().then((stats) => res.json(stats));
});

router.get('/products-snapshot', (req, res) => {
  const snapshot = cache.getProductsSnapshot(Number(req.query.maxAge) || 1000);
  if (req.headers['if-none-match'] === snapshot.etag) {
    return res.status(304).end();
  }
  res.set('ETag', snapshot.etag).type('application/json').send(snapshot.body);
});

router.post('/subscribe', (req, res) => {
  const topic = String(req.body.topic || 'order.processed');
  res.json({ topic, listeners: processor.notifier.subscribe(topic) });
});

router.post('/notify', (req, res) => {
  const delivered = processor.notifier.notify(String(req.body.topic), req.body.payload);
  res.json({ delivered, listeners: listenerTotal(String(req.body.topic)), message: formatMessage('Hello {name}', req.body.name) });
});

router.get('/summary/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(Number(req.params.id));
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  const summary = req.query.rush === '1' ? new RushOrderSummary(order) : new OrderSummary(order);
  summary.discount = Number(req.query.discount) || 0;
  res.json({ total: summary.total, itemCount: summary.itemCount, payable: summary.payable });
});

router.get('/host', (req, res) => {
  const link = String(req.query.link || '');
  res.json({ host: parseHost(link), token: encodeToken(link) });
});

module.exports = router;
