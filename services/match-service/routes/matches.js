const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const auth = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden. Admin access required.' });
  next();
};

// GET /api/matches — public (filter by tournament)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.tournament) filter.tournament = req.query.tournament;
    const matches = await Match.find(filter)
      .populate('player1', 'name points')
      .populate('player2', 'name points')
      .populate('winner', 'name')
      .populate('tournament', 'name category');
    res.json(matches);
  } catch { res.status(500).json({ message: 'Server error.' }); }
});

// POST /api/matches — admin only
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { tournament, player1, player2, winner, round } = req.body;
    if (!tournament || !player1 || !player2 || !winner || !round)
      return res.status(400).json({ message: 'All fields are required.' });
    if (!['quarter', 'semi', 'final'].includes(round))
      return res.status(400).json({ message: 'Round must be quarter, semi, or final.' });
    if (player1 === player2)
      return res.status(400).json({ message: 'Player 1 and Player 2 must be different.' });
    if (winner !== player1 && winner !== player2)
      return res.status(400).json({ message: 'Winner must be one of the two players.' });

    const match = await Match.create({ tournament, player1, player2, winner, round });
    const populated = await Match.findById(match._id)
      .populate('player1', 'name')
      .populate('player2', 'name')
      .populate('winner', 'name')
      .populate('tournament', 'name');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

module.exports = router;
