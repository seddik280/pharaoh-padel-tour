const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  player:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  avgPoints:  { type: Number, required: true },
  createdAt:  { type: Date, default: Date.now }
});

RegistrationSchema.index({ player: 1, tournament: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
