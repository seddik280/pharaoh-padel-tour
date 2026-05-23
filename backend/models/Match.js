const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  player1:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  player2:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  winner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  round:      { type: String, enum: ['quarter', 'semi', 'final'], required: true },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', MatchSchema);
