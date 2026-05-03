<<<<<<< HEAD
const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Pending or Paid
}, { timestamps: true });

=======
const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Pending or Paid
}, { timestamps: true });

>>>>>>> 8a2849b (Add remaining backend base files to main)
module.exports = mongoose.model('Invoice', InvoiceSchema);