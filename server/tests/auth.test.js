process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_that_is_definitely_longer_than_32_chars';
process.env.CLIENT_URL = 'http://localhost:5173';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const createApp = require('../app');

let mongod, app;

beforeAll(async () => {
  // Use TEST_MONGODB_URI (a throwaway database!) if set, otherwise download an in-memory MongoDB.
  if (process.env.TEST_MONGODB_URI) {
    await mongoose.connect(process.env.TEST_MONGODB_URI);
    await mongoose.connection.dropDatabase();
  } else {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  }
  app = createApp();
  const hr = new User({ name: 'HR', email: 'hr@test.com', role: 'HR', employeeId: 'HR-1' });
  await hr.setPassword('Password123');
  await hr.save();
  const emp = new User({ name: 'Emp', email: 'emp@test.com', role: 'EMPLOYEE', employeeId: 'E-1' });
  await emp.setPassword('Password123');
  await emp.save();
});

afterAll(async () => {
  if (process.env.TEST_MONGODB_URI) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

const login = (email, password) => request(app).post('/api/auth/login').send({ email, password });

describe('auth', () => {
  test('valid login returns token and no password hash', async () => {
    const res = await login('hr@test.com', 'Password123');
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/);
  });

  test('invalid credentials rejected with same message for bad email / bad password', async () => {
    const a = await login('hr@test.com', 'wrong');
    const b = await login('nobody@test.com', 'Password123');
    expect(a.status).toBe(401);
    expect(b.status).toBe(401);
    expect(a.body.message).toBe(b.body.message);
  });

  test('password is stored hashed', async () => {
    const u = await User.findOne({ email: 'hr@test.com' }).select('+passwordHash');
    expect(u.passwordHash).not.toBe('Password123');
    expect(u.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  test('missing / invalid token rejected', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    const bad = await request(app).get('/api/auth/me').set('Authorization', 'Bearer nonsense');
    expect(bad.status).toBe(401);
  });

  test('me works with valid token', async () => {
    const { body } = await login('emp@test.com', 'Password123');
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('emp@test.com');
  });

  test('authorize blocks wrong role', async () => {
    const probe = express();
    probe.use(express.json());
    probe.get('/hr-only', authenticate, authorize('HR'), (_q, r) => r.json({ ok: true }));
    const { body } = await login('emp@test.com', 'Password123');
    const res = await request(probe).get('/hr-only').set('Authorization', `Bearer ${body.token}`);
    expect(res.status).toBe(403);
  });

  test('change password validates and works', async () => {
    const { body } = await login('emp@test.com', 'Password123');
    const h = { Authorization: `Bearer ${body.token}` };
    const weak = await request(app).post('/api/auth/change-password').set(h).send({ currentPassword: 'Password123', newPassword: 'short' });
    expect(weak.status).toBe(422);
    const wrong = await request(app).post('/api/auth/change-password').set(h).send({ currentPassword: 'nope', newPassword: 'NewPassword456' });
    expect(wrong.status).toBe(400);
    const ok = await request(app).post('/api/auth/change-password').set(h).send({ currentPassword: 'Password123', newPassword: 'NewPassword456' });
    expect(ok.status).toBe(200);
    expect((await login('emp@test.com', 'NewPassword456')).status).toBe(200);
  });
});
