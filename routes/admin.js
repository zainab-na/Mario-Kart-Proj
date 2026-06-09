const express = require('express');
const User = require('../models/User');
const Registration = require('../models/Registration');
const ContactSubmission = require('../models/ContactSubmission');
const { requireAuth, requireAdmin } = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/users', async (req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json(users);
});

router.delete('/users/:id', async (req, res) => {
  if (req.params.id === 'admin') {
    return res.status(400).json({ message: 'Default admin account cannot be deleted.' });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  await Registration.deleteMany({ userId: user._id });
  await user.deleteOne();

  res.json({ message: 'User deleted.' });
});

router.get('/registrations', async (req, res) => {
  const registrations = await Registration.find()
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 });
  res.json(registrations);
});

router.put('/registrations/:id', async (req, res) => {
  const registration = await Registration.findById(req.params.id);
  if (!registration) {
    return res.status(404).json({ message: 'Registration not found.' });
  }

  const { playerName, teamName, gameId, status, paymentMethod, paymentStatus, notes } = req.body;
  if (playerName !== undefined) registration.playerName = playerName.trim();
  if (teamName !== undefined) registration.teamName = teamName.trim();
  if (gameId !== undefined) registration.gameId = gameId.trim();
  if (status !== undefined) registration.status = status;
  if (paymentMethod !== undefined) registration.paymentMethod = paymentMethod;
  if (paymentStatus !== undefined) registration.paymentStatus = paymentStatus;
  if (notes !== undefined) registration.notes = notes;

  await registration.save();
  res.json({ message: 'Registration updated by admin.', registration });
});

router.delete('/registrations/:id', async (req, res) => {
  const registration = await Registration.findById(req.params.id);
  if (!registration) {
    return res.status(404).json({ message: 'Registration not found.' });
  }
  await registration.deleteOne();
  res.json({ message: 'Registration deleted by admin.' });
});

router.get('/contact-submissions', async (req, res) => {
  const submissions = await ContactSubmission.find().sort({ createdAt: -1 });
  res.json(submissions);
});

router.patch('/contact-submissions/:id', async (req, res) => {
  const submission = await ContactSubmission.findById(req.params.id);
  if (!submission) {
    return res.status(404).json({ message: 'Contact submission not found.' });
  }

  const { status } = req.body;
  if (status !== undefined) submission.status = status;
  await submission.save();

  res.json({ message: 'Contact submission updated.', submission });
});

router.delete('/contact-submissions/:id', async (req, res) => {
  const submission = await ContactSubmission.findById(req.params.id);
  if (!submission) {
    return res.status(404).json({ message: 'Contact submission not found.' });
  }

  await submission.deleteOne();
  res.json({ message: 'Contact submission deleted.' });
});

router.get('/summary', async (req, res) => {
  const [userCount, registrationCount, paidCount, contactCount] = await Promise.all([
    User.countDocuments(),
    Registration.countDocuments(),
    Registration.countDocuments({ paymentStatus: 'Paid' }),
    ContactSubmission.countDocuments()
  ]);
  res.json({ userCount, registrationCount, paidCount, contactCount });
});

module.exports = router;
