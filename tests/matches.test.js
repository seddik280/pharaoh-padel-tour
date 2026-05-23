/**
 * Match Service Tests
 * Tests: GET /api/matches, POST /api/matches
 * Database: padelpro_test
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'padelpro_secret_key_2024';

const request  = require('supertest');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { connectTestDB, disconnectTestDB, clearCollections } = require('./helpers');

const svcPath = '../services/match-service';
const Match = require(`${svcPath}/models/Match`);

// We re-use the User and Tournament models from another service (same DB)
const User       = require('../services/user-service/models/User');
const Tournament = require('../services/tournament-service/models/Tournament');

let app, adminToken, playerToken, p1Id, p2Id, tournamentId;

before(async () => {
  await connectTestDB();
  app = require(`${svcPath}/server`).app;
});

after(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearCollections(Match, User, Tournament);

  const p1 = await User.create({ name: 'P1', email: 'p1@t.com', password: 'x', points: 800, role: 'player' });
  const p2 = await User.create({ name: 'P2', email: 'p2@t.com', password: 'x', points: 600, role: 'player' });
  const admin = await User.create({ name: 'Admin', email: 'a@t.com', password: 'x', points: 0, role: 'admin' });
  const t = await Tournament.create({ name: 'T', category: 'D', date: '2026-07-01', status: 'active' });

  p1Id = p1._id.toString();
  p2Id = p2._id.toString();
  tournamentId = t._id.toString();
  adminToken  = jwt.sign({ id: admin._id.toString(), role: 'admin'  }, process.env.JWT_SECRET, { expiresIn: '1h' });
  playerToken = jwt.sign({ id: p1Id,                 role: 'player' }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

// ── GET /api/matches ──────────────────────────────────────────────────────────
describe('GET /api/matches', () => {
  it('should return an empty array when no matches exist (public)', async () => {
    const res = await request(app).get('/api/matches');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').with.lengthOf(0);
  });

  it('should return matches filtered by tournament', async () => {
    await Match.create({ tournament: tournamentId, player1: p1Id, player2: p2Id, winner: p1Id, round: 'final' });
    const res = await request(app).get(`/api/matches?tournament=${tournamentId}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.lengthOf(1);
  });
});

// ── POST /api/matches ─────────────────────────────────────────────────────────
describe('POST /api/matches', () => {
  it('should create a match as admin', async () => {
    const res = await request(app).post('/api/matches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ tournament: tournamentId, player1: p1Id, player2: p2Id, winner: p1Id, round: 'quarter' });
    expect(res.status).to.equal(201);
    expect(res.body.round).to.equal('quarter');
    expect(res.body.winner).to.be.an('object');
  });

  it('should return 403 if a non-admin tries to create a match', async () => {
    const res = await request(app).post('/api/matches')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ tournament: tournamentId, player1: p1Id, player2: p2Id, winner: p1Id, round: 'quarter' });
    expect(res.status).to.equal(403);
  });

  it('should return 400 if players are the same', async () => {
    const res = await request(app).post('/api/matches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ tournament: tournamentId, player1: p1Id, player2: p1Id, winner: p1Id, round: 'quarter' });
    expect(res.status).to.equal(400);
    expect(res.body.message).to.include('different');
  });

  it('should return 400 if winner is not one of the players', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).post('/api/matches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ tournament: tournamentId, player1: p1Id, player2: p2Id, winner: fakeId, round: 'final' });
    expect(res.status).to.equal(400);
    expect(res.body.message).to.include('Winner must be');
  });

  it('should return 400 for invalid round value', async () => {
    const res = await request(app).post('/api/matches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ tournament: tournamentId, player1: p1Id, player2: p2Id, winner: p1Id, round: 'invalidRound' });
    expect(res.status).to.equal(400);
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/api/matches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ player1: p1Id, player2: p2Id });
    expect(res.status).to.equal(400);
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app).post('/api/matches')
      .send({ tournament: tournamentId, player1: p1Id, player2: p2Id, winner: p1Id, round: 'final' });
    expect(res.status).to.equal(401);
  });
});
