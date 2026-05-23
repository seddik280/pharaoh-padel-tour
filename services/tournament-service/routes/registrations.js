const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const auth = require('../middleware/auth');

function getCategory(pts) {
  if (pts >= 1200) return 'C';
  if (pts >= 500)  return 'D';
  return 'Beginner';
}

// GET /api/registrations — filter by tournament or player
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.tournament) filter.tournament = req.query.tournament;
    if (req.query.player)     filter.player = req.query.player;
    const regs = await Registration.find(filter)
      .populate('player', 'name email points')
      .populate('tournament', 'name category date status');
    res.json(regs);
  } catch { res.status(500).json({ message: 'Server error.' }); }
});

// POST /api/registrations — authenticated players only
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin')
      return res.status(403).json({ message: 'Admins cannot register for tournaments.' });

    const { tournamentId } = req.body;
    if (!tournamentId)
      return res.status(400).json({ message: 'Tournament ID is required.' });

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found.' });
    if (tournament.status !== 'upcoming')
      return res.status(400).json({ message: 'Registration is closed for this tournament.' });

    const user = await User.findById(req.user.id);
    const playerCat = getCategory(user.points);
    const order = ['Beginner', 'D', 'C'];
    if (order.indexOf(playerCat) > order.indexOf(tournament.category))
      return res.status(400).json({ message: `${playerCat} players cannot join ${tournament.category} tournaments.` });

    if (await Registration.findOne({ player: req.user.id, tournament: tournamentId }))
      return res.status(400).json({ message: 'You are already registered for this tournament.' });

    const reg = await Registration.create({ player: req.user.id, tournament: tournamentId });
    await reg.populate('tournament', 'name category date');
    res.status(201).json(reg);
  } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

// DELETE /api/registrations/:id — cancel your own registration (upcoming tournaments only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id).populate('tournament');
    if (!reg)
      return res.status(404).json({ message: 'Registration not found.' });

    if (reg.player.toString() !== req.user.id)
      return res.status(403).json({ message: 'You can only cancel your own registration.' });

    if (reg.tournament?.status !== 'upcoming')
      return res.status(400).json({ message: 'Cannot cancel registration after the tournament has started.' });

    await reg.deleteOne();
    res.json({ message: 'Registration cancelled successfully.' });
  } catch (err) { res.status(500).json({ message: 'Server error.', error: err.message }); }
});

module.exports = router;
