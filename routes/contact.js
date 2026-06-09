const express = require('express');
const ContactSubmission = require('../models/ContactSubmission');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, character, message } = req.body;

    if (!firstName || !lastName || !email || !character) {
      return res.status(400).json({
        message: 'First name, last name, email, and favourite character are required.'
      });
    }

    const created = await ContactSubmission.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: String(email).trim().toLowerCase(),
      character: character.trim(),
      message: message ? String(message).trim() : '',
      status: 'New'
    });

    res.status(201).json({
      message: 'Registration sent. We will contact you soon.',
      submission: created
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to save your registration request.',
      error: error.message
    });
  }
});

module.exports = router;
