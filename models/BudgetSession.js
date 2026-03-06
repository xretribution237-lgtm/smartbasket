const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  price: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  barcode: String,
  category: String,
  imageUrl: String,
  addedAt: { type: Date, default: Date.now }
});

const budgetSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: 'Shopping Trip' },
  storeName: { type: String, default: '' },
  budget: { type: Number, required: true },
  items: [itemSchema],
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

module.exports = mongoose.model('BudgetSession', budgetSessionSchema);
