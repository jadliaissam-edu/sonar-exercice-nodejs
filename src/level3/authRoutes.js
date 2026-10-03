'use strict';

const express = require('express');
const auth = require('./authService');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const token = auth.login(username || '', password || '');
  if (!token) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  res.cookie('inventory_token', token);
  res.json({ token });
});

router.post('/reset-request', (req, res) => {
  const resetToken = auth.createResetToken();
  res.json({ message: 'Reset link generated', resetToken });
});

router.get('/me', auth.requireAuth, (req, res) => {
  res.json({ id: req.user.sub, name: req.user.name, role: req.user.role });
});

module.exports = router;
