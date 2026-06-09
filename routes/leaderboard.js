const express = require('express');
const LeaderboardEntry = require('../models/LeaderboardEntry');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const entries = await LeaderboardEntry.find().sort({ score: -1, createdAt: 1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load leaderboard.', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, score } = req.body;
    if (!name || score === undefined) {
      return res.status(400).json({ message: 'Name and score are required.' });
    }

    const existing = await LeaderboardEntry.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: 'That player already exists.' });
    }

    const created = await LeaderboardEntry.create({ name: name.trim(), score: Number(score) });
    res.status(201).json({ message: 'Player added.', player: created });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add leaderboard entry.', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const entry = await LeaderboardEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Player not found.' });

    const { name, score } = req.body;
    if (name !== undefined) entry.name = name.trim();
    if (score !== undefined) entry.score = Number(score);
    await entry.save();
    res.json({ message: 'Player updated.', player: entry });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update leaderboard entry.', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const entry = await LeaderboardEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Player not found.' });
    await entry.deleteOne();
    res.json({ message: 'Player deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete leaderboard entry.', error: error.message });
  }
});

module.exports = router;
