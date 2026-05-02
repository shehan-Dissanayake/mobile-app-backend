const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, default: 'Card' },
  date: { type: String },
  notes: { type: String, default: '' } // Admin can edit this later
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);