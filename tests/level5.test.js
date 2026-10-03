const request = require('supertest');
const { createApp } = require('../src/app');
const cache = require('../src/level5/cache');
const legacy = require('../src/level5/legacyAdapters');
const { Notifier, formatMessage } = require('../src/level5/notifier');

const app = createApp();

async function placeOrder(customerId, productId, quantity) {
  const res = await request(app)
    .post('/api/orders')
    .send({ customerId, lines: [{ productId, quantity }] });
  return res.body.id;
}

describe('Level 5 - order processing', () => {
  it('processes an order', async () => {
    const id = await placeOrder(1, 5, 2);
    const res = await request(app).post('/api/processing/order/' + id);
    expect(res.body.processed).toBe(true);
    const status = await request(app).get('/api/processing/status/' + id);
    expect(status.body.status).toBe('processed');
  });



});

describe('Level 5 - caching and notifications', () => {
  it('serves a snapshot and honours ETags', async () => {
    cache.clearCache();
    const first = await request(app).get('/api/processing/products-snapshot');
    expect(first.status).toBe(200);
    const second = await request(app)
      .get('/api/processing/products-snapshot')
      .set('If-None-Match', first.headers.etag);
    expect(second.status).toBe(304);
    expect(cache.cacheStats().hits).toBeGreaterThan(0);
  });

  it('delivers notifications to subscribers', async () => {
    const sub = await request(app).post('/api/processing/subscribe').send({ topic: 'stock.low' });
    expect(sub.body.listeners).toBe(1);
    const res = await request(app)
      .post('/api/processing/notify')
      .send({ topic: 'stock.low', payload: { sku: 'HW-1002' }, name: 'Ana' });
    expect(res.body.delivered).toBe(true);
    expect(res.body.message).toBe('Hello Ana');
  });

  it('formats messages and flushes notifiers', () => {
    expect(formatMessage('Hi {name}', 'Bob')).toBe('Hi Bob');
    const notifier = new Notifier();
    notifier.subscribe('unit.test');
    notifier.notify('unit.test', 1);
    expect(notifier.flush()).toBe(1);
    expect(notifier.describe()).toContain('0 pending');
  });
});

describe('Level 5 - summaries and adapters', () => {
  it('summarises an order', async () => {
    const id = await placeOrder(1, 5, 1);
    const res = await request(app).get('/api/processing/summary/' + id + '?discount=0.5');
    expect(res.body.itemCount).toBe(1);
    expect(res.body.payable).toBeCloseTo(2.995, 3);
    const missing = await request(app).get('/api/processing/summary/987654');
    expect(missing.status).toBe(404);
  });


  it('parses hosts and decodes tokens', async () => {
    const res = await request(app).get('/api/processing/host?link=https://shop.example.com/items');
    expect(res.body.host).toBe('shop.example.com');
    expect(legacy.decodeToken(res.body.token)).toBe('https://shop.example.com/items');
  });


  it('answers unknown routes with 404', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });
});
