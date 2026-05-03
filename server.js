// Import the packages we just installed
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
require('dotenv').config();

// Initialize the Express App
const app = express();

// Middleware (Allows your app to talk to the web browser and receive JSON data)
app.use(cors()); 
// Increase the limit to 10 megabytes to allow base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- DATABASE CONNECTION ---
// We will put your real MongoDB Atlas link in a .env file later. 
// For now, this is a placeholder.
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/clinic_db";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB!'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth'));             
app.use('/api/doctors', require('./routes/doctors'));       
app.use('/api/appointments', require('./routes/appointments')); 
app.use('/api/medicalrecords', require('./routes/medicalRecords')); 
app.use('/api/prescriptions', require('./routes/prescriptions')); 
app.use('/api/invoices', require('./routes/invoices'));     
app.use('/api/payments', require('./routes/payments'));
app.use('/api/user', require('./routes/user'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// --- BASIC TEST ROUTE ---
app.get('/', (req, res) => {
    res.send('Welcome to the Clinic App Backend API!');
});

// Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
