'use strict';

const express = require('express');
const { simpleQuote, calculateQuote } = require('./pricingEngine');

const router = express.Router();

router.get('/simple', (req, res) => {
  const quantity = Number(req.query.quantity) || 1;
  const basePrice = Number(req.query.price) || 0;
  res.json({ total: simpleQuote(basePrice, quantity) });
});

router.post('/quote', (req, res) => {
  const body = req.body || {};
  try {
    const total = calculateQuote(
      Number(body.basePrice),
      Number(body.quantity),
      body.tier,
      body.region,
      body.coupon,
      body.season,
      Boolean(body.bulk),
      body.currency,
      Boolean(body.taxExempt)
    );
    res.json({ total });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
