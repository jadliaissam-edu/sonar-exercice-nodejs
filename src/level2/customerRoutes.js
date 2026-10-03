'use strict';

const express = require('express');
const service = require('./customerService');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(service.listCustomers());
});

router.get('/:id', (req, res) => {
  const customer = service.getCustomer(service.parseCustomerId(req.params.id));
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer);
});

router.get('/:id/loyalty', (req, res) => {
  const summary = service.loyaltySummary(service.parseCustomerId(req.params.id));
  if (!summary) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(summary);
});

router.post('/', (req, res) => {
  const created = service.createCustomer(req.body);
  if (!created) {
    return res.status(400).json({ error: 'Customer could not be created' });
  }
  res.status(201).json(created);
});

module.exports = router;
