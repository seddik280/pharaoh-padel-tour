const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const auth = require('../middleware/auth');

function getCategory(points) {
  if (points >= 1200) return 'C';
  if (points >= 500) return 'D';
  return 'Beginner';
}

// GET /api/registrations?tournament=id
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.tournament) filter.tournament = req.query.tournament;
    if (req.query.player) filter.player = req.query.player;
    const regs = await Registration.find(filter)
      .populate('player', 'name email points')
      .populate('partner', 'name email points')
      .populate('tournament', 'name category date status');
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/registrations — register current user with a partner
router.post('/', auth, async (req, res) => {
  try {
    const { tournamentId, partnerId } = req.body;

    if (!partnerId) return res.status(400).json({ message: 'You must select a partner to register' });
    if (partnerId === req.user.id) return res.status(400).json({ message: 'You cannot register with yourself' });

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    if (tournament.status !== 'upcoming')
      return res.status(400).json({ message: 'Registration is closed for this tournament' });

    const [user, partner] = await Promise.all([
      User.findById(req.user.id),
      User.findById(partnerId)
    ]);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });

    // Category based on average points of both players
    const avgPoints = Math.round((user.points + partner.points) / 2);
    const teamCat = getCategory(avgPoints);
    const order = ['Beginner', 'D', 'C'];
    if (order.indexOf(teamCat) > order.indexOf(tournament.category))
      return res.status(400).json({ message: `Your team average (${avgPoints} pts) is too high for this ${tournament.category} tournament` });

    // Check neither player is already registered in this tournament
    const alreadyRegistered = await Registration.findOne({
      tournament: tournamentId,
      $or: [
        { player: req.user.id }, { partner: req.user.id },
        { player: partnerId },   { partner: partnerId }
      ]
    });
    if (alreadyRegistered) return res.status(400).json({ message: 'You or your partner are already registered in this tournament' });

    const reg = await Registration.create({ player: req.user.id, partner: partnerId, tournament: tournamentId, avgPoints });
    await reg.populate([
      { path: 'partner', select: 'name points' },
      { path: 'tournament', select: 'name category date' }
    ]);
    res.status(201).json(reg);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
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
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
