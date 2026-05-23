const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PointsHistory = require('../models/PointsHistory');
const auth = require('../middleware/auth');

// GET /api/users — all players (public leaderboard)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ role: 'player' }, '-password').sort({ points: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/me — current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, '-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/me — update profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email required' });

    const updates = { name, email };
    if (password && password.length >= 3) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, select: '-password' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/:id/history — points history for a user
router.get('/:id/history', auth, async (req, res) => {
  try {
    const history = await PointsHistory.find({ player: req.params.id })
      .populate('tournament', 'name')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/:id/award — admin awards points manually
router.post('/:id/award', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { points, reason } = req.body;
    if (!points || !reason) return res.status(400).json({ message: 'Points and reason required' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $inc: { points: Number(points) } },
      { new: true, select: '-password' }
    );
    await PointsHistory.create({ player: req.params.id, points: Number(points), reason });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
