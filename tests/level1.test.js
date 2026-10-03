const request = require('supertest');
const { createApp } = require('../src/app');
const stock = require('../src/level1/stockUtils');
const { formatPrice, format_stock_text } = require('../src/level1/formatters');

const app = createApp();

describe('Level 1 - products API', () => {
  it('lists products with pagination', async () => {
    const res = await request(app).get('/api/products?page=1&size=5');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(5);
    expect(res.body.items[0]).toHaveProperty('priceLabel');
  });

  it('returns a single product with its label', async () => {
    const res = await request(app).get('/api/products/1');
    expect(res.status).toBe(200);
    expect(res.body.sku).toBe('HW-1001');
    expect(res.body.label).toContain('Cordless Drill');
  });

  it('returns 404 for an unknown product', async () => {
    const res = await request(app).get('/api/products/9999');
    expect(res.status).toBe(404);
  });

  it('creates a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ sku: 'TS-0001', name: 'Test Item', price: 3.5, stock: 7, category: 'hardware' });
    expect(res.status).toBe(201);
    expect(res.body.category).toBe('Hardware & Tools');
  });


  it('updates stock', async () => {
    const res = await request(app).put('/api/products/2/stock').send({ stock: 40 });
    expect(res.status).toBe(200);
    expect(res.body.stock).toBe(40);
    expect(res.body.level).toBe('MEDIUM');
  });


  it('computes a stock summary', async () => {
    const res = await request(app).get('/api/products/summary');
    expect(res.status).toBe(200);
    expect(res.body.totalItems).toBeGreaterThan(0);
  });
});

describe('Level 1 - helpers', () => {
  it('classifies stock levels', () => {
    expect(stock.check_stock_level(0)).toBe('OUT');
    expect(stock.check_stock_level(3)).toBe('LOW');
    expect(stock.check_stock_level(20)).toBe('MEDIUM');
    expect(stock.check_stock_level(500)).toBe('OK');
  });

  it('knows whether something is in stock', () => {
    expect(stock.isInStock(1)).toBe(true);
    expect(stock.isInStock(0)).toBe(false);
  });


  it('formats prices and stock text', () => {
    expect(formatPrice(5)).toBe('$5.00');
    expect(format_stock_text(1)).toBe('1 unit');
    expect(format_stock_text(3)).toBe('3 units');
  });

});
