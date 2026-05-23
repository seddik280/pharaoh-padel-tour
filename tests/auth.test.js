/**
 * Auth Service Tests
 * Tests: POST /api/auth/register, POST /api/auth/login
 * Database: padelpro_test (separate from production)
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'padelpro_secret_key_2024';

const request  = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const { connectTestDB, disconnectTestDB, clearCollections } = require('./helpers');

// Load auth service
const authServicePath = '../services/auth-service';
const User = require(`${authServicePath}/models/User`);
let app;

before(async () => {
  await connectTestDB();
  app = require(`${authServicePath}/server`).app;
});

after(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearCollections(User);
});

// ── REGISTER ──────────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {

  it('should register a new user and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@padel.com', password: 'pass123' });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('token');
    expect(res.body.user).to.include({ name: 'Test User', email: 'test@padel.com', role: 'player' });
    expect(res.body.user).to.not.have.property('password');
  });

  it('should return 400 if fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@padel.com' });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message');
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'not-an-email', password: '123' });

    expect(res.status).to.equal(400);
  });

  it('should return 400 if password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@padel.com', password: 'ab' });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.include('3 characters');
  });

  it('should return 400 for duplicate email', async () => {
    await request(app).post('/api/auth/register')
      .send({ name: 'First', email: 'same@padel.com', password: '123' });

    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Second', email: 'same@padel.com', password: '123' });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.include('already registered');
  });

  it('should register with case-insensitive email', async () => {
    await request(app).post('/api/auth/register')
      .send({ name: 'User A', email: 'User@Padel.COM', password: '123' });

    const res = await request(app).post('/api/auth/register')
      .send({ name: 'User B', email: 'user@padel.com', password: '123' });

    expect(res.status).to.equal(400); // should detect as duplicate
  });
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {

  beforeEach(async () => {
    await request(app).post('/api/auth/register')
      .send({ name: 'Login User', email: 'login@padel.com', password: 'secret' });
  });

  it('should login with valid credentials and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@padel.com', password: 'secret' });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token');
    expect(res.body.user.email).to.equal('login@padel.com');
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@padel.com', password: 'wrong' });

    expect(res.status).to.equal(401);
    expect(res.body.message).to.include('Invalid');
  });

  it('should return 401 for unregistered email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@padel.com', password: 'secret' });

    expect(res.status).to.equal(401);
  });

  it('should return 400 if email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'secret' });

    expect(res.status).to.equal(400);
  });

  it('should return 400 if password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@padel.com' });

    expect(res.status).to.equal(400);
  });
});
