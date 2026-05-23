const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Registration = require('../models/Registration');
const Match = require('../models/Match');
const User = require('../models/User');
const PointsHistory = require('../models/PointsHistory');
const auth = require('../middleware/auth');

const POINTS = {
  Beginner: { winner: 300, finalist: 200, semi: 120, quarter: 60 },
  D:        { winner: 600, finalist: 400, semi: 240, quarter: 120 },
  C:        { winner: 1000, finalist: 600, semi: 360, quarter: 180 }
};

// GET /api/tournaments
router.get('/', async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ date: -1 });
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/tournaments/:id
router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tournaments — admin only
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { name, category, date } = req.body;
    if (!name || !category || !date)
      return res.status(400).json({ message: 'All fields required' });
    const tournament = await Tournament.create({ name, category, date });
    res.status(201).json(tournament);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/tournaments/:id/status — admin only
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { status } = req.body;
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tournaments/:id/complete — admin: complete & award points
router.post('/:id/complete', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Not found' });

    const matches = await Match.find({ tournament: req.params.id });
    const pts = POINTS[tournament.category];
    const awarded = new Set();

    for (const m of matches) {
      if (!m.winner) continue;
      const loserId = m.winner.toString() === m.player1.toString() ? m.player2 : m.player1;
      let winnerPts = 0, loserPts = 0;
      if (m.round === 'final')   { winnerPts = pts.winner;   loserPts = pts.finalist; }
      if (m.round === 'semi')    { winnerPts = pts.semi;     loserPts = pts.quarter; }
      if (m.round === 'quarter') { winnerPts = pts.quarter;  loserPts = 0; }

      const label = m.round === 'final' ? 'Winner' : m.round === 'semi' ? 'Semi-final' : 'Quarter-final';

      if (winnerPts && !awarded.has('w' + m.winner)) {
        await User.findByIdAndUpdate(m.winner, { $inc: { points: winnerPts } });
        await PointsHistory.create({ player: m.winner, points: winnerPts, reason: `${label} — ${tournament.name}`, tournament: tournament._id });
        awarded.add('w' + m.winner);
      }
      if (loserPts && !awarded.has('l' + loserId)) {
        await User.findByIdAndUpdate(loserId, { $inc: { points: loserPts } });
        await PointsHistory.create({ player: loserId, points: loserPts, reason: `${m.round === 'final' ? 'Finalist' : 'Semi-final'} — ${tournament.name}`, tournament: tournament._id });
        awarded.add('l' + loserId);
      }
    }
    tournament.status = 'completed';
    await tournament.save();
    res.json({ message: 'Tournament completed and points awarded', tournament });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
