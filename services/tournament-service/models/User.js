const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  points:    { type: Number, default: 0 },
  role:      { type: String, enum: ['player', 'admin'], default: 'player' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', UserSchema);
