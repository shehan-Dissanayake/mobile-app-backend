const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor'); // 🛑 ADDED: Import the Doctor model

// --- REGISTER ROUTE ---
router.post('/register', async (req, res) => {
    try {
        // Extract the 'role' sent from the Admin panel
        const { name, email, password, role } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists!' });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save to database 
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            // If the Admin sent a role, use it. Otherwise, default to 'patient' for public signups
            role: role || 'patient' 
        });
        
        const savedUser = await newUser.save(); // Save and capture the generated _id

        // 🛑 THE BRIDGE: Automatically create the Doctor profile!
        if (savedUser.role === 'doctor') {
            const newDoctorProfile = new Doctor({
                userId: savedUser._id, // Links directly to the User account!
                name: savedUser.name,
                specialty: 'General',  // Default placeholder, admin can edit later
                fee: '0',              // Default placeholder
            });
            await newDoctorProfile.save();
        }

        res.status(201).json({ message: 'User registered successfully!', user: savedUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 2. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'fallback_secret', // Always good to have a fallback during dev
            { expiresIn: '1d' }
        );

        // 4. Send the data back to the app
        res.status(200).json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, // FIXED: Changed from user.fullName to user.name to match schema
                email: user.email, 
                role: user.role // THIS IS THE MAGIC RBAC LINK!
            } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;