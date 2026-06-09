const express = require('express');
const Registration = require('../models/Registration');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const items = await Registration.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const payload = items.map(item => {
      const obj = item.toObject();
      const owned = req.user.role === 'admin' || String(obj.userId?._id || obj.userId) === String(req.user.id);
      return {
        ...obj,
        canEdit: owned,
        canDelete: owned
      };
    });

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load registrations.', error: error.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const items = await Registration.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load your registrations.', error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { playerName, teamName, gameId, tournamentName, notes } = req.body;

    if (!playerName || !teamName || !gameId) {
      return res.status(400).json({ message: 'Player name, team name, and game ID are required.' });
    }

    const existing = await Registration.findOne({
      tournamentName: tournamentName || 'Mariokart Tournament',
      gameId: gameId.trim()
    });
    if (existing) {
      return res.status(409).json({ message: 'That Game ID is already registered.' });
    }

    const created = await Registration.create({
  userId: req.user.id === 'admin' ? undefined : req.user.id,

  playerName: playerName.trim(),

  teamName: teamName.trim(),

  gameId: gameId.trim(),

  tournamentName:
    tournamentName || 'Mariokart Tournament',

  notes: notes || '',

  status: 'Registered',

  paymentMethod: 'Stripe',

  paymentStatus: 'Paid',

  registrationFee: 10
});

    if (req.user.id === 'admin') {
      created.userId = null;
    }

    res.status(201).json({ message: 'Registration saved successfully.', registration: created });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create registration.', error: error.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    const owned = req.user.role === 'admin' || String(registration.userId) === String(req.user.id);
    if (!owned) {
      return res.status(403).json({ message: 'You cannot edit this registration.' });
    }

    const { playerName, teamName, gameId, status, notes } = req.body;

    if (playerName !== undefined) registration.playerName = playerName.trim();
    if (teamName !== undefined) registration.teamName = teamName.trim();
    if (gameId !== undefined) registration.gameId = gameId.trim();
    if (status !== undefined) registration.status = status;
    if (notes !== undefined) registration.notes = notes;

    await registration.save();
    res.json({ message: 'Registration updated.', registration });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update registration.', error: error.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    const owned = req.user.role === 'admin' || String(registration.userId) === String(req.user.id);
    if (!owned) {
      return res.status(403).json({ message: 'You cannot delete this registration.' });
    }

    await registration.deleteOne();
    res.json({ message: 'Registration deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete registration.', error: error.message });
  }
});

module.exports = router;
