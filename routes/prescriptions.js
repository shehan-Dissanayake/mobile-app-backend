const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');

// CREATE
router.post('/', async (req, res) => {
  try {
    const newPrescription = new Prescription(req.body);
    await newPrescription.save();
    res.status(201).json(newPrescription);
  } catch (error) { 
    console.error("PRESCRIPTION SAVE ERROR:", error); 
    res.status(500).json({ message: "Error adding prescription" }); 
  }
});

// GET: ADMIN FETCH ALL
router.get('/', async (req, res) => {
  try {
    const allRecords = await Prescription.find();
    res.status(200).json(allRecords);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// READ (Get by User)
router.get('/user/:userId', async (req, res) => {
  try {
    const records = await Prescription.find({ userId: req.params.userId });
    res.status(200).json(records);
  } catch (error) { 
    res.status(500).json({ message: "Error fetching records" }); 
  }
});

// READ (Get by Doctor)
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const records = await Prescription.find({ doctorId: req.params.doctorId });
    res.status(200).json(records);
  } catch (error) { 
    res.status(500).json({ message: "Error fetching doctor records" }); 
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updatedPrescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedPrescription);
  } catch (error) { 
    res.status(500).json({ message: "Error updating prescription" }); 
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Prescription.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Prescription deleted" });
  } catch (error) { 
    res.status(500).json({ message: "Error deleting prescription" }); 
  }
});

module.exports = router;