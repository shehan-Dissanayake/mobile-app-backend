// models/Prescription.js
const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  doctorId: { type: String },
  isBilled: { type: Boolean, default: false },
  doctorName: { type: String, required: true },
  medications: [
    {
      name: { type: String, required: true },
      dosage: { type: String, required: true }
    }
  ],
  instructions: { type: String },
  date: { type: String },
  
  // 🛑 NEW: Status field added! 
  // 'Pending' means it shows on the Prescriptions page. 
  // 'Completed' means it moves to the Medical Records page.
  status: { type: String, default: 'Pending' }
  
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);