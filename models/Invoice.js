const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Pending or Paid
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);