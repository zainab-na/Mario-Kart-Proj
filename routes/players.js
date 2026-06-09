const express = require('express');
const Player = require('../models/Player');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const players = await Player.find().sort({ rank: 1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load players.', error: error.message });
  }
});

module.exports = router;
