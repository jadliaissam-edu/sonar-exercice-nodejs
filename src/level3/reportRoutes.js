'use strict';

const express = require('express');
const reports = require('./reportService');
const { requireAuth } = require('./authService');

const router = express.Router();

router.get('/products.csv', (req, res) => {
  const { csv } = reports.exportProductsCsv();
  res.type('text/csv').send(csv);
});

router.get('/signature', requireAuth, (req, res) => {
  const { csv } = reports.exportProductsCsv();
  res.json({ signature: reports.signReport(csv) });
});

router.post('/encrypt', requireAuth, (req, res) => {
  res.json({ data: reports.encryptReport(String(req.body.content || '')) });
});

router.post('/sync', requireAuth, async (req, res) => {
  try {
    res.json(await reports.syncStockLevels());
  } catch (err) {
    res.status(502).json({ error: 'Stock service unavailable' });
  }
});

module.exports = router;
