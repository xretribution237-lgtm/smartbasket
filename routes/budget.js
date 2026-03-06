const express = require('express');
const router = express.Router();
const BudgetSession = require('../models/BudgetSession');

const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  next();
};

// Get active session - only for THIS user
router.get('/session', auth, async (req, res) => {
  try {
    const session = await BudgetSession.findOne({ userId: req.session.userId, completed: false }).sort({ createdAt: -1 });
    res.json(session || null);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Create new session
router.post('/session', auth, async (req, res) => {
  try {
    const { budget, name, storeName } = req.body;
    const parsedBudget = parseFloat(budget);
    if (!parsedBudget || parsedBudget <= 0) return res.status(400).json({ error: 'Please enter a valid budget amount' });
    const session = await BudgetSession.create({
      userId: req.session.userId,
      budget: parsedBudget,
      name: name || 'Shopping Trip',
      storeName: storeName || '',
      items: []
    });
    res.json(session);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Add item
router.post('/session/:id/items', auth, async (req, res) => {
  try {
    const session = await BudgetSession.findOne({ _id: req.params.id, userId: req.session.userId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const { name, price, barcode, category, imageUrl } = req.body;
    const parsedPrice = parseFloat(price) || 0;
    const existing = session.items.find(i => (barcode && i.barcode === barcode) || i.name === name);
    if (existing) {
      existing.quantity += 1;
    } else {
      session.items.push({ name, price: parsedPrice, barcode, category, imageUrl });
    }
    await session.save();
    res.json(session);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Update item quantity
router.patch('/session/:id/items/:itemId', auth, async (req, res) => {
  try {
    const session = await BudgetSession.findOne({ _id: req.params.id, userId: req.session.userId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const item = session.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const quantity = parseInt(req.body.quantity);
    if (quantity <= 0) {
      session.items.pull(req.params.itemId);
    } else {
      item.quantity = quantity;
    }
    await session.save();
    res.json(session);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Complete session
router.patch('/session/:id/complete', auth, async (req, res) => {
  try {
    const session = await BudgetSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      { completed: true, completedAt: new Date() },
      { new: true }
    );
    res.json(session);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Get history - only THIS user's sessions
router.get('/history', auth, async (req, res) => {
  try {
    const sessions = await BudgetSession.find({ userId: req.session.userId, completed: true }).sort({ completedAt: -1 }).limit(20);
    res.json(sessions);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
