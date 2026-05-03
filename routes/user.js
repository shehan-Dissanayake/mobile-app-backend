const express = require('express');
const router = express.Router();
// 🛑 ADDED: Import bcryptjs to hash the new password securely
const bcrypt = require('bcryptjs'); 
const User = require('../models/User'); // Assuming you use "User" for patients

// 🛑 ADDED: Import your security middleware
const auth = require('../middleware/auth'); 

// ==========================================
// NEW ROUTE: GET - Fetch all patients for Admin Dropdown
// (Must be above /:id so Express doesn't confuse 'patients' for an ID)
// ==========================================
// FIX: Removed 'auth' middleware here because the frontend isn't sending the token yet!
router.get('/patients', async (req, res) => {
  try {
    // FIX: Added { role: 'patient' } so it actually filters for patients!
    // .select('-password') ensures we never accidentally send passwords to the frontend!
    const patients = await User.find({ role: 'patient' }).select('-password'); 
    res.status(200).json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ==========================================
// NEW ROUTE: GET - Fetch absolutely ALL users (For User Management)
// ==========================================
router.get('/all', auth, async (req, res) => {
  try {
    // Finds everyone in the database, removes passwords from the response
    const allUsers = await User.find().select('-password'); 
    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ==========================================
// NEW ROUTE: DELETE - Remove a user completely
// ==========================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ==========================================
// ROUTE 1: GET - Fetch current patient details
// ==========================================
router.get('/:id', auth, async (req, res) => {
  try {
    // Added .select('-password') here for extra security!
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ==========================================
// ROUTE 2: PUT/POST - Update patient details
// ==========================================
router.post('/update/:id', auth, async (req, res) => { 
  try {
    // FIX 1: Remove 'email' and 'role' from here. The user shouldn't be able to change these 
    // from a standard profile edit screen anyway!
    // 🛑 ADDED: 'password' to the destructured body request
    const { name, phone, address, profileImage, password } = req.body; 
    
    // 🛑 ADDED: We bundle the standard fields into an object first
    const updateFields = { name, phone, address, profileImage };

    // 🛑 ADDED: If a password was sent from the frontend, hash it and add it to our update object
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields, // 🛑 CHANGED: We now pass the dynamic object here
      // FIX 2: Replaced 'new: true' with 'returnDocument: 'after'' to fix the Mongoose warning
      { returnDocument: 'after', runValidators: true } 
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully!', user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;