const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: String, required: false, default: '5+ Years' },
  location: { type: String, required: false, default: 'Main Clinic' },
  fee: { type: String, required: true },
  imageUrl: { type: String, required: false, default: 'https://via.placeholder.com/150' },
  patients: { type: String, required: false, default: '0+' },
  rating: { type: Number, required: false, default: 5.0 },
  hospital: { type: String, required: false, default: 'Main Clinic' }
});

module.exports = mongoose.model('Doctor', DoctorSchema);