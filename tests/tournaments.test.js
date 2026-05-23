/**
 * Tournament Service Tests
 * Tests: GET/POST /api/tournaments, status update, registration
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

const svcPath = '../services/tournament-service';
const Tournament   = require(`${svcPath}/models/Tournament`);
const Registration = require(`${svcPath}/models/Registration`);
const User         = require(`${svcPath}/models/User`);
let app, playerToken, adminToken, playerId, adminId, tournamentId;

before(async () => {
  await connectTestDB();
  app = require(`${svcPath}/server`).app;
});

after(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearCollections(Tournament, Registration, User);

  const player = await User.create({ name: 'Player', email: 'p@test.com', password: 'x', points: 200, role: 'player' });
  const admin  = await User.create({ name: 'Admin',  email: 'a@test.com', password: 'x', points: 0,   role: 'admin' });
  playerId = player._id.toString();
  adminId  = admin._id.toString();
  playerToken = jwt.sign({ id: playerId, role: 'player' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  adminToken  = jwt.sign({ id: adminId,  role: 'admin'  }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const t = await Tournament.create({ name: 'Test Open', category: 'Beginner', date: '2026-07-01', status: 'upcoming' });
  tournamentId = t._id.toString();
});

// ── GET /api/tournaments ──────────────────────────────────────────────────────
describe('GET /api/tournaments', () => {
  it('should return all tournaments (public)', async () => {
    const res = await request(app).get('/api/tournaments');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').with.lengthOf(1);
    expect(res.body[0].name).to.equal('Test Open');
  });
});

describe('GET /api/tournaments/:id', () => {
  it('should return a single tournament', async () => {
    const res = await request(app).get(`/api/tournaments/${tournamentId}`);
    expect(res.status).to.equal(200);
    expect(res.body._id).to.equal(tournamentId);
  });

  it('should return 404 for unknown id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/tournaments/${fakeId}`);
    expect(res.status).to.equal(404);
  });
});

// ── POST /api/tournaments ─────────────────────────────────────────────────────
describe('POST /api/tournaments', () => {
  it('should create a tournament as admin', async () => {
    const res = await request(app).post('/api/tournaments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Tournament', category: 'D', date: '2026-08-15' });
    expect(res.status).to.equal(201);
    expect(res.body.name).to.equal('New Tournament');
    expect(res.body.status).to.equal('upcoming');
  });

  it('should return 403 for non-admin', async () => {
    const res = await request(app).post('/api/tournaments')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ name: 'Hack', category: 'C', date: '2026-08-15' });
    expect(res.status).to.equal(403);
  });

  it('should return 400 if fields are missing', async () => {
    const res = await request(app).post('/api/tournaments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'No Date' });
    expect(res.status).to.equal(400);
  });

  it('should return 401 without auth', async () => {
    const res = await request(app).post('/api/tournaments')
      .send({ name: 'X', category: 'C', date: '2026-01-01' });
    expect(res.status).to.equal(401);
  });
});

// ── PUT /api/tournaments/:id/status ───────────────────────────────────────────
describe('PUT /api/tournaments/:id/status', () => {
  it('should update status to active as admin', async () => {
    const res = await request(app).put(`/api/tournaments/${tournamentId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'active' });
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('active');
  });

  it('should return 400 for invalid status', async () => {
    const res = await request(app).put(`/api/tournaments/${tournamentId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'invalid' });
    expect(res.status).to.equal(400);
  });
});

// ── POST /api/registrations ───────────────────────────────────────────────────
describe('POST /api/registrations', () => {
  it('should register an eligible player', async () => {
    const res = await request(app).post('/api/registrations')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ tournamentId });
    expect(res.status).to.equal(201);
  });

  it('should return 400 on duplicate registration', async () => {
    await request(app).post('/api/registrations')
      .set('Authorization', `Bearer ${playerToken}`).send({ tournamentId });
    const res = await request(app).post('/api/registrations')
      .set('Authorization', `Bearer ${playerToken}`).send({ tournamentId });
    expect(res.status).to.equal(400);
    expect(res.body.message).to.include('already registered');
  });

  it('should return 400 if player category is too high', async () => {
    // Update player to C level (1450 pts) but tournament is Beginner
    await User.findByIdAndUpdate(playerId, { points: 1450 });
    const highToken = jwt.sign({ id: playerId, role: 'player' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app).post('/api/registrations')
      .set('Authorization', `Bearer ${highToken}`)
      .send({ tournamentId });
    expect(res.status).to.equal(400);
    expect(res.body.message).to.include('cannot join');
  });

  it('should return 403 if admin tries to register', async () => {
    const res = await request(app).post('/api/registrations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ tournamentId });
    expect(res.status).to.equal(403);
  });

  it('should return 401 without auth', async () => {
    const res = await request(app).post('/api/registrations').send({ tournamentId });
    expect(res.status).to.equal(401);
  });
});
