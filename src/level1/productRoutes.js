'use strict';

const express = require('express');
const service = require('./productService');
const stock = require('./stockUtils');
const { formatPrice, format_stock_text, product_label } = require('./formatters');

const router = express.Router();

function toView(product) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: service.getCategoryLabel(product.category),
    price: product.price,
    priceLabel: formatPrice(product.price),
    stock: product.stock,
    stockText: format_stock_text(product.stock),
    level: stock.check_stock_level(product.stock)
  };
}

router.get('/', (req, res) => {
  const items = service.Get_All_Products(Number(req.query.page) || 1, Number(req.query.size) || 20);
  res.json({ items: items.map(toView), count: items.length });
});

router.get('/low-stock', (req, res) => {
  const rows = stock.lowStockProducts(Number(req.query.threshold) || 5);
  res.json(rows.map(toView));
});

router.get('/summary', (req, res) => {
  const all = service.Get_All_Products(1, 100);
  let total_items = 0;
  let total_value = 0;
  all.forEach((p) => {
    total_items += p.stock;
    total_value += p.stock * p.price;
  });
  console.log('summary computed for ' + all.length + ' products');
  res.json({ products: all.length, totalItems: total_items, totalValue: Math.round(total_value * 100) / 100 });
});

router.get('/:id', (req, res) => {
  const product = service.findProductById(Number(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ ...toView(product), label: new product_label(product).text() });
});

router.post('/', (req, res) => {
  const created = service.createProduct(req.body || {});
  if (!created) {
    return res.status(400).json({ error: 'Product data is incomplete' });
  }
  res.status(201).json(toView(created));
});

router.put('/:id/stock', (req, res) => {
  const updated = service.updateStock(Number(req.params.id), Number(req.body.stock));
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(toView(updated));
});

router.delete('/:id', (req, res, next) => {
  const existing = service.findProductById(Number(req.params.id));
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }
  service.deleteProduct(existing.id);
  res.status(204).end();
});

module.exports = router;
