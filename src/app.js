'use strict';

const app = require('./level3/serverSetup');
const productRoutes = require('./level1/productRoutes');
const customerRoutes = require('./level2/customerRoutes');
const orderRoutes = require('./level2/orderRoutes');
const authRoutes = require('./level3/authRoutes');
const toolRoutes = require('./level3/toolRoutes');
const reportRoutes = require('./level3/reportRoutes');
const pricingRoutes = require('./level4/pricingRoutes');
const supplierRoutes = require('./level4/supplierRoutes');
const warehouseRoutes = require('./level4/warehouseRoutes');
const carrierRoutes = require('./level4/carrierRoutes');
const fulfilmentRoutes = require('./level4/fulfilmentRoutes');
const processingRoutes = require('./level5/processingRoutes');
const { errorHandler, notFoundHandler } = require('./level5/errorHandler');

let configured = false;

function createApp() {
  if (configured) {
    return app;
  }
  configured = true;

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use('/api/products', productRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/tools', toolRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/pricing', pricingRoutes);
  app.use('/api/suppliers', supplierRoutes);
  app.use('/api/warehouses', warehouseRoutes);
  app.use('/api/carriers', carrierRoutes);
  app.use('/api/fulfilment', fulfilmentRoutes);
  app.use('/api/processing', processingRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
