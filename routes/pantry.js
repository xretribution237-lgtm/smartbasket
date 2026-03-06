const express = require('express');
const router = express.Router();
const PantryItem = require('../models/PantryItem');

const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  next();
};

// Get all pantry items
router.get('/', auth, async (req, res) => {
  try {
    const items = await PantryItem.find({ userId: req.session.userId }).sort({ expiryDate: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Add pantry item
router.post('/', auth, async (req, res) => {
  try {
    const { name, barcode, category, quantity, unit, expiryDate, imageUrl, notes } = req.body;
    const item = await PantryItem.create({ userId: req.session.userId, name, barcode, category, quantity, unit, expiryDate, imageUrl, notes });
    res.json(item);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Update pantry item
router.patch('/:id', auth, async (req, res) => {
  try {
    const item = await PantryItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      req.body,
      { new: true }
    );
    res.json(item);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Delete pantry item
router.delete('/:id', auth, async (req, res) => {
  try {
    await PantryItem.findOneAndDelete({ _id: req.params.id, userId: req.session.userId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Get expiring soon (within X days)
router.get('/expiring', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 3;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    const items = await PantryItem.find({
      userId: req.session.userId,
      expiryDate: { $lte: cutoff, $gte: new Date() }
    });
    res.json(items);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
