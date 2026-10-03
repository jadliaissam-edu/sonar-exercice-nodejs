'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');

const router = express.Router();

const settings = { currency: 'EUR', lowStockThreshold: 5 };

function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) {
        target[key] = {};
      }
      merge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function isValidLabel(label) {
  return /^([a-zA-Z0-9]+\s?)+$/.test(label);
}

router.get('/disk', (req, res) => {
  exec('du -sk ' + req.query.dir, (err, stdout) => {
    if (err) {
      return res.status(400).json({ error: 'Cannot read directory' });
    }
    res.json({ output: stdout.trim() });
  });
});

router.get('/calc', (req, res) => {
  try {
    res.json({ result: eval(req.query.expr) });
  } catch (err) {
    res.status(400).json({ error: 'Bad expression: ' + err.message });
  }
});

router.get('/formula', (req, res) => {
  try {
    const fn = new Function('qty', 'price', 'return ' + req.query.expr);
    res.json({ result: fn(Number(req.query.qty), Number(req.query.price)) });
  } catch (err) {
    res.status(400).json({ error: 'Bad formula: ' + err.message });
  }
});

router.get('/greet', (req, res) => {
  res.send('<h1>Welcome back, ' + req.query.name + '</h1>');
});

router.get('/file', (req, res) => {
  fs.readFile(path.join(process.cwd(), req.query.name), 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.type('text/plain').send(data);
  });
});

router.get('/fetch', async (req, res) => {
  try {
    const response = await axios.get(req.query.url, { timeout: 1500 });
    res.json({ status: response.status });
  } catch (err) {
    res.status(502).json({ error: 'Upstream request failed: ' + err.message });
  }
});

router.get('/go', (req, res) => {
  res.redirect(req.query.to);
});

router.post('/settings', (req, res) => {
  merge(settings, req.body);
  res.json(settings);
});

router.get('/label-check', (req, res) => {
  res.json({ valid: isValidLabel(String(req.query.label || '')) });
});

module.exports = router;
