/**
 * User Service Tests
 * Tests: GET /api/users, GET /api/users/me, PUT /api/users/me, POST /api/users/:id/award
 * Database: padelpro_test
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'padelpro_secret_key_2024';

const request  = require('supertest');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectTestDB, disconnectTestDB, clearCollections } = require('./helpers');

const userServicePath = '../services/user-service';
const User = require(`${userServicePath}/models/User`);
const PointsHistory = require(`${userServicePath}/models/PointsHistory`);
let app, playerToken, adminToken, playerId, adminId;

before(async () => {
  await connectTestDB();
  app = require(`${userServicePath}/server`).app;
});

after(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearCollections(User, PointsHistory);

  const player = await User.create({
    name: 'Test Player', email: 'player@padel.com',
    password: await bcrypt.hash('pass', 10), points: 300, role: 'player'
  });
  const admin = await User.create({
    name: 'Test Admin', email: 'admin@padel.com',
    password: await bcrypt.hash('admin', 10), points: 0, role: 'admin'
  });
  playerId = player._id.toString();
  adminId  = admin._id.toString();
  playerToken = jwt.sign({ id: playerId, role: 'player' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  adminToken  = jwt.sign({ id: adminId,  role: 'admin'  }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

// ── GET /api/users ────────────────────────────────────────────────────────────
describe('GET /api/users', () => {
  it('should return all players sorted by points (no auth required)', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body[0]).to.not.have.property('password');
    // Admins excluded
    expect(res.body.every(u => u.role === 'player')).to.be.true;
  });
});

// ── GET /api/users/me ─────────────────────────────────────────────────────────
describe('GET /api/users/me', () => {
  it('should return the authenticated user profile', async () => {
    const res = await request(app).get('/api/users/me')
      .set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.email).to.equal('player@padel.com');
    expect(res.body).to.not.have.property('password');
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).to.equal(401);
  });

  it('should return 401 with an invalid token', async () => {
    const res = await request(app).get('/api/users/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).to.equal(401);
  });
});

// ── PUT /api/users/me ─────────────────────────────────────────────────────────
describe('PUT /api/users/me', () => {
  it('should update name and email', async () => {
    const res = await request(app).put('/api/users/me')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ name: 'Updated Name', email: 'updated@padel.com' });
    expect(res.status).to.equal(200);
    expect(res.body.name).to.equal('Updated Name');
    expect(res.body.email).to.equal('updated@padel.com');
  });

  it('should return 400 if name is missing', async () => {
    const res = await request(app).put('/api/users/me')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ email: 'ok@padel.com' });
    expect(res.status).to.equal(400);
  });

  it('should return 401 without auth', async () => {
    const res = await request(app).put('/api/users/me')
      .send({ name: 'No Auth', email: 'x@x.com' });
    expect(res.status).to.equal(401);
  });
});

// ── POST /api/users/:id/award ─────────────────────────────────────────────────
describe('POST /api/users/:id/award', () => {
  it('should allow admin to award points', async () => {
    const res = await request(app).post(`/api/users/${playerId}/award`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ points: 200, reason: 'Special achievement' });
    expect(res.status).to.equal(200);
    expect(res.body.points).to.equal(500); // 300 + 200
  });

  it('should return 403 if non-admin tries to award points', async () => {
    const res = await request(app).post(`/api/users/${playerId}/award`)
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ points: 200, reason: 'Hack attempt' });
    expect(res.status).to.equal(403);
  });

  it('should return 400 for invalid points value', async () => {
    const res = await request(app).post(`/api/users/${playerId}/award`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ points: -50, reason: 'Negative points' });
    expect(res.status).to.equal(400);
  });

  it('should return 400 if reason is missing', async () => {
    const res = await request(app).post(`/api/users/${playerId}/award`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ points: 100 });
    expect(res.status).to.equal(400);
  });

  it('should return 401 without a token', async () => {
    const res = await request(app).post(`/api/users/${playerId}/award`)
      .send({ points: 100, reason: 'No token' });
    expect(res.status).to.equal(401);
  });
});
