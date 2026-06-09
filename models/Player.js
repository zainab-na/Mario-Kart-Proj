const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  type: { type: String, required: true },
  rank: { type: Number, required: true },
  image: { type: String, default: '' },
  speed: { type: Number, default: 0 },
  handling: { type: Number, default: 0 },
  drift: { type: Number, default: 0 },
  badge: { type: String, default: 'badge-default' },
  badgeLabel: { type: String, default: 'Racer' },
  desc: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
