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

