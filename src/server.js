'use strict';

const { createApp } = require('./app');

const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  process.stdout.write(`Inventory & Orders API listening on port ${PORT}\n`);
});
