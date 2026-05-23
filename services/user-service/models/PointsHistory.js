const mongoose = require('mongoose');
const PointsHistorySchema = new mongoose.Schema({
  player:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points:     { type: Number, required: true },
  reason:     { type: String, required: true },
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
  date:       { type: String, default: () => new Date().toISOString().split('T')[0] },
  createdAt:  { type: Date, default: Date.now }
});
module.exports = mongoose.model('PointsHistory', PointsHistorySchema);
