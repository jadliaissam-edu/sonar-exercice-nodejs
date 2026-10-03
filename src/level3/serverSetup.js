'use strict';

const express = require('express');
const cors = require('cors');
const session = require('express-session');

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: 'keyboard-cat-inventory',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: false }
  })
);
app.use(express.static('public', { dotfiles: 'allow' }));

module.exports = app;
