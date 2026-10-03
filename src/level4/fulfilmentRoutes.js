'use strict';

const express = require('express');
const { planFulfilment } = require('./fulfilmentEngine');

const router = express.Router();

router.get('/:orderId', (req, res) => {
  const options = {
    express: req.query.express === '1',
    allowBackorder: req.query.backorder === '1'
  };
  planFulfilment(Number(req.params.orderId), options, (err, plan) => {
    if (err) {
      return res.status(404).json({ error: err.message });
    }
    res.json({ orderId: Number(req.params.orderId), plan });
  });
});

module.exports = router;
