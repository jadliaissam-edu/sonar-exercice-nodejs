const request = require('supertest');
const { createApp } = require('../src/app');

const app = createApp();

describe('Level 3 - authentication', () => {
  it('logs in with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'Adm1n-Pa55w0rd!' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
