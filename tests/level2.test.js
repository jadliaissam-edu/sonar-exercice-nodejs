const request = require('supertest');
const { createApp } = require('../src/app');
const loyalty = require('../src/level2/loyalty');
const orders = require('../src/level2/orderService');

const app = createApp();

describe('Level 2 - customers', () => {
  it('lists customers', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(4);
  });

  it('returns a customer and the loyalty summary', async () => {
    const one = await request(app).get('/api/customers/1');
    expect(one.body.name).toBe('Acme Tools Ltd');
    const summary = await request(app).get('/api/customers/1/loyalty');
    expect(summary.status).toBe(200);
    expect(summary.body.tier).toBe('gold');
    expect(summary.body.badge).toBe('member');
  });


  it('creates a customer and refuses duplicates', async () => {
    const payload = { name: 'Elm Supplies', email: 'info@elm.example.com' };
    const created = await request(app).post('/api/customers').send(payload);
    expect(created.status).toBe(201);
    const duplicate = await request(app).post('/api/customers').send(payload);
    expect(duplicate.status).toBe(400);
  });

});

describe('Level 2 - loyalty rules', () => {

  it('calculates points and discounts', () => {
    expect(loyalty.pointsForOrder(250)).toBe(25);
    expect(loyalty.tierDiscount('bronze')).toBe(5);
    expect(loyalty.tierDiscount('silver')).toBe(10);
    expect(loyalty.tierDiscount('standard')).toBe(0);
  });

});

describe('Level 2 - orders', () => {
  it('creates an order and reduces stock', async () => {
    const before = await request(app).get('/api/products/7');
    const res = await request(app)
      .post('/api/orders')
      .send({ customerId: 1, lines: [{ productId: 7, quantity: 2 }] });
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(24);
    expect(res.body.items).toHaveLength(1);
    const after = await request(app).get('/api/products/7');
    expect(after.body.stock).toBe(before.body.stock - 2);
  });

  it('applies a coupon to the payable amount', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ customerId: 2, coupon: 'WELCOME10', lines: [{ productId: 5, quantity: 10 }] });
    expect(res.status).toBe(201);
    expect(res.body.payable).toBeCloseTo(res.body.total * 0.9, 2);
  });



  it('lists, fetches and cancels orders', async () => {
    const created = await request(app)
      .post('/api/orders')
      .send({ customerId: 3, lines: [{ productId: 5, quantity: 1 }] });
    const id = created.body.id;
    const list = await request(app).get('/api/orders');
    expect(list.body.length).toBeGreaterThan(0);
    const one = await request(app).get('/api/orders/' + id);
    expect(one.body.customer_id).toBe(3);
    const cancelled = await request(app).post('/api/orders/' + id + '/cancel');
    expect(cancelled.body.cancelled).toBe(true);
    const missing = await request(app).get('/api/orders/99999');
    expect(missing.status).toBe(404);
  });


  it('computes totals', () => {
    expect(orders.computeTotal([{ quantity: 2, unit_price: 5 }])).toBe(10);
    expect(orders.applyCoupon(100, 'WELCOME10')).toBe(90);
  });
});
