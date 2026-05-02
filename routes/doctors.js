const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor'); // Make sure Member 2 created this model!

// CREATE: Add a new doctor
router.post('/', async (req, res) => {
  try {
    const newDoctor = new Doctor(req.body);
    await newDoctor.save();
    res.status(201).json(newDoctor);
  } catch (error) {
    res.status(500).json({ message: "Error adding doctor", error });
  }
});

// READ: Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error });
  }
});

// UPDATE: Edit a doctor's details
router.put('/:id', async (req, res) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.status(200).json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: "Error updating doctor", error });
  }
});

// DELETE: Remove a doctor
router.delete('/:id', async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Doctor deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting doctor", error });
  }
});

module.exports = router;