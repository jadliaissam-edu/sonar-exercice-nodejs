'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();

function validatePayload(body) {
  const errors = [];
  if (!body || typeof body.name !== 'string' || body.name.trim() === '') {
    errors.push('name is required');
  }
  if (body && body.name && body.name.length > 80) {
    errors.push('name is too long');
  }
  if (!body || !body.city) {
    errors.push('city is required');
  }
  if (!body || !body.country || body.country.length !== 2) {
    errors.push('country must be a 2 letter code');
  }
  if (body && body.contactEmail && body.contactEmail.indexOf('@') === -1) {
    errors.push('contactEmail is invalid');
  }
  if (body && body.contactEmail && body.contactEmail.length > 120) {
    errors.push('contactEmail is too long');
  }
  return errors;
}

function toResponse(row) {
  const country = row.country.toUpperCase();
  const email = row.contact_email || null;
  const domain = email ? email.split('@')[1] : null;
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    country: country,
    contactEmail: email,
    contactDomain: domain,
    hasContact: email !== null,
    label: row.name + ' (' + row.city + ', ' + country + ')'
  };
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM carriers ORDER BY name').all();
  const search = req.query.q ? String(req.query.q).toLowerCase() : null;
  const filtered = search
    ? rows.filter((row) => row.name.toLowerCase().includes(search) || row.city.toLowerCase().includes(search))
    : rows;
  res.json(filtered.map(toResponse));
});

router.post('/', (req, res) => {
  const errors = validatePayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const info = db
    .prepare('INSERT INTO carriers (name, city, country, contact_email) VALUES (?, ?, ?, ?)')
    .run(req.body.name.trim(), req.body.city, req.body.country, req.body.contactEmail || null);
  const created = db.prepare('SELECT * FROM carriers WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(toResponse(created));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM carriers WHERE id = ?').get(Number(req.params.id));
  if (!existing) {
    return res.status(404).json({ error: 'Record not found' });
  }
  const errors = validatePayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  db.prepare('UPDATE carriers SET name = ?, city = ?, country = ?, contact_email = ? WHERE id = ?').run(
    req.body.name.trim(),
    req.body.city,
    req.body.country,
    req.body.contactEmail || null,
    existing.id
  );
  const updated = db.prepare('SELECT * FROM carriers WHERE id = ?').get(existing.id);
  res.json(toResponse(updated));
});

module.exports = router;
