const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  category: { type: String, enum: ['Beginner', 'D', 'C'], required: true },
  date:     { type: String, required: true },
  status:   { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' },
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Tournament', TournamentSchema);
