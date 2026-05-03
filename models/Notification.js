const mongoose = require('mongoose');
const { Schema } = mongoose; // <-- Extract Schema cleanly

const notificationSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, // <-- Use the clean reference here
    required: true,
    ref: 'User' // Make sure this matches exactly what you named your User model!
  },
  userRole: {
    type: String,
    required: true,
    enum: ['patient', 'doctor', 'admin']
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true }); 

module.exports = mongoose.model('Notification', notificationSchema);