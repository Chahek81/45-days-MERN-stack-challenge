const request = require('supertest');
const { app } = require('../src/server');

describe('API smoke tests (mock mode)', () => {
  test('GET /api/analytics/technology returns trends', async () => {
    const res = await request(app).get('/api/analytics/technology');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('trends');
  }, 10000);

  test('GET /api/search?q=react returns results', async () => {
    const res = await request(app).get('/api/search').query({ q: 'react' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('results');
  }, 10000);
});
