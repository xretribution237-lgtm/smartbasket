const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: { type: Number, default: 1 },
  barcode: String,
  category: String,
  imageUrl: String,
  addedAt: { type: Date, default: Date.now }
});

const budgetSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: 'Shopping Trip' },
  budget: { type: Number, required: true },
  items: [itemSchema],
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

budgetSessionSchema.virtual('total').get(function() {
  return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

module.exports = mongoose.model('BudgetSession', budgetSessionSchema);
