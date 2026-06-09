const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  playerName: {
    type: String,
    required: true,
    trim: true
  },

  teamName: {
    type: String,
    required: true,
    trim: true
  },

  gameId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },

  tournamentName: {
    type: String,
    default: 'Mariokart Tournament'
  },

  status: {
    type: String,
    enum: ['Registered', 'Approved', 'Rejected'],
    default: 'Registered'
  },

  notes: {
    type: String,
    default: ''
  },

  paymentMethod: {
    type: String,
    default: ''
  },

  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Pending', 'Paid'],
    default: 'Unpaid'
  },

  registrationFee: {
    type: Number,
    default: 10
  }

}, { timestamps: true });

registrationSchema.index(
  { tournamentName: 1, gameId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'Registration',
  registrationSchema
);