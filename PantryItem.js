const mongoose = require('mongoose');

const pantryItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  barcode: String,
  category: String,
  quantity: { type: Number, default: 1 },
  unit: String,
  expiryDate: Date,
  imageUrl: String,
  addedAt: { type: Date, default: Date.now },
  notes: String
});

module.exports = mongoose.model('PantryItem', pantryItemSchema);
