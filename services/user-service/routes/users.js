const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PointsHistory = require('../models/PointsHistory');
const auth = require('../middleware/auth');

// ── Admin-only guard ──────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden. Admin access required.' });
  next();
};

// GET /api/users — public leaderboard (players only, sorted by points)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ role: 'player' }, '-password').sort({ points: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/users/me — authenticated user's own profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, '-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/users/me — update own profile (authenticated)
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim())
      return res.status(400).json({ message: 'Name and email are required.' });
    if (!/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ message: 'Enter a valid email address.' });

    const updates = { name: name.trim(), email: email.toLowerCase() };
    if (password) {
      if (password.length < 3)
        return res.status(400).json({ message: 'Password must be at least 3 characters.' });
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, select: '-password' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/users/:id/history — points history (authenticated, own history or admin)
router.get('/:id/history', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden.' });

    const history = await PointsHistory.find({ player: req.params.id })
      .populate('tournament', 'name')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/users/:id/award — admin awards points manually
router.post('/:id/award', auth, adminOnly, async (req, res) => {
  try {
    const { points, reason } = req.body;
    if (!points || isNaN(points) || Number(points) <= 0)
      return res.status(400).json({ message: 'Points must be a positive number.' });
    if (!reason?.trim())
      return res.status(400).json({ message: 'Reason is required.' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $inc: { points: Number(points) } },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'Player not found.' });

    await PointsHistory.create({ player: req.params.id, points: Number(points), reason: reason.trim() });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
