const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },     // Changed from patientId to userId
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  specialty: { type: String },                  // Added specialty field
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Pending, Confirmed, Completed, Cancelled
  reason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);