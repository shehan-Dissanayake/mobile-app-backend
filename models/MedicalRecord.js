const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  doctorId: { type: String },
  doctorName: { type: String, required: true },
  recordType: { type: String, default: 'Diagnosis' }, 
  diagnosis: { type: String, required: true }, 
  treatment: { type: String, required: false }, 
  date: { type: String, required: true },
  status: { type: String, default: 'Completed' }, 
  expectedTime: { type: String, required: false },
  isRead: { type: Boolean, default: false },
  attachedFile: { type: String, required: false }, 
  
  // 🛑 NEW: Field to track if this record has been invoiced
  isBilled: { type: Boolean, default: false }
  
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);