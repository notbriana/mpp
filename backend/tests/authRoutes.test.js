const request = require('supertest');
const app = require('../src/server');
const { resetStore } = require('../src/data/store');

describe('Auth REST endpoints', () => {
  beforeEach(async () => {
    await resetStore();
  });

  test('register -> login -> refresh', async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'R', email: 'r@example.com', password: 'pass123', confirmPassword: 'pass123' });
    expect(reg.status).toBe(201);
    expect(reg.body.user.email).toBe('r@example.com');
    expect(reg.body.accessToken).toBeDefined();
    expect(reg.body.refreshToken).toBeDefined();

    const login = await request(app).post('/api/auth/login').send({ email: 'r@example.com', password: 'pass123' });
    expect(login.status).toBe(200);
    expect(login.body.user.email).toBe('r@example.com');
    expect(login.body.accessToken).toBeDefined();
    expect(login.body.refreshToken).toBeDefined();

    const refresh = await request(app).post('/api/auth/refresh').send({ refreshToken: login.body.refreshToken });
    expect(refresh.status).toBe(200);
    expect(refresh.body.accessToken).toBeDefined();
  });
});
