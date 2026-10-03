const request = require('supertest');
const { createApp } = require('../src/app');
const { simpleQuote, calculateQuote } = require('../src/level4/pricingEngine');

const app = createApp();

describe('Level 4 - pricing', () => {
  it('calculates a simple quote', async () => {
    const res = await request(app).get('/api/pricing/simple?price=10&quantity=3');
    expect(res.body.total).toBe(30);
    expect(simpleQuote(2.5, 4)).toBe(10);
  });

  it('calculates a quote for a standard customer without tax', () => {
    expect(calculateQuote(10, 2, 'standard', 'OTHER', null, 'autumn', false, 'EUR', true)).toBe(20);
  });

  it('works', () => {
    const quote = calculateQuote(10, 2, 'standard', 'OTHER', null, 'autumn', false, 'EUR', true);
    console.log(quote);
  });

  it.skip('applies the gold winter discount', () => {
    expect(calculateQuote(10, 60, 'gold', 'EU', null, 'winter', false, 'EUR', false)).toBeGreaterThan(0);
  });

  xit('rejects unsupported currencies', () => {
    expect(() => calculateQuote(10, 1, 'standard', 'EU', null, 'spring', false, 'JPY', false)).toThrow();
  });

  it('is always true', () => {
    expect(true).toBe(true);
  });

  it('waits for the cache to settle', (done) => {
    setTimeout(() => {
      expect(simpleQuote(1, 1)).toBe(1);
      done();
    }, 300);
  });
});

describe('Level 4 - supplier directory', () => {
  it('creates and lists suppliers', async () => {
    const created = await request(app)
      .post('/api/suppliers')
      .send({ name: 'Nordic Parts', city: 'Vilnius', country: 'LT', contactEmail: 'sales@nordic.example.com' });
    expect(created.status).toBe(201);
    expect(created.body.label).toBe('Nordic Parts (Vilnius, LT)');
    const list = await request(app).get('/api/suppliers?q=nordic');
    expect(list.body).toHaveLength(1);
  });

  it('validates supplier payloads', async () => {
    const res = await request(app).post('/api/suppliers').send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(1);
  });
});
