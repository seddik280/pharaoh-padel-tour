const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const auth = require('../middleware/auth');

// GET /api/matches?tournament=id
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
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/matches — admin only
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { tournament, player1, player2, winner, round } = req.body;
    if (!tournament || !player1 || !player2 || !winner || !round)
      return res.status(400).json({ message: 'All fields required' });
    if (player1 === player2)
      return res.status(400).json({ message: 'Players must be different' });

    const match = await Match.create({ tournament, player1, player2, winner, round });
    const populated = await Match.findById(match._id)
      .populate('player1', 'name')
      .populate('player2', 'name')
      .populate('winner', 'name')
      .populate('tournament', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
