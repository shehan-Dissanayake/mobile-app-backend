const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/MedicalRecord');
const Notification = require('../models/Notification'); // 🛑 ADDED: Import Notification model

// CREATE
router.post('/', async (req, res) => {
  try {
    // Bulletproof date check
    if (!req.body.date || req.body.date.trim() === '') {
      req.body.date = new Date().toISOString().split('T')[0]; // Gets YYYY-MM-DD
    }

    const newRecord = new MedicalRecord(req.body);
    await newRecord.save();

    // 🛑 ADDED: Create a global notification for the patient when a record is made
    try {
      const newNoti = new Notification({
        userId: req.body.userId,
        userRole: 'patient', 
        title: req.body.status === 'Pending' ? 'Action Required: Pending Record' : 'New Health Record Ready',
        message: req.body.status === 'Pending' 
          ? `Dr. ${req.body.doctorName} has added a pending ${req.body.recordType} that requires your attention.`
          : `Dr. ${req.body.doctorName} has added a new ${req.body.recordType} to your health history.`,
        isRead: false
      });
      await newNoti.save();
    } catch (notiError) {
      console.log("Failed to send global notification on creation:", notiError);
    }

    res.status(201).json(newRecord);
  } catch (error) { 
    console.error("MEDICAL RECORD SAVE ERROR:", error); 
    res.status(500).json({ message: "Error adding record" }); 
  }
});

// GET: ADMIN FETCH ALL
router.get('/', async (req, res) => {
  try {
    const allRecords = await MedicalRecord.find();
    res.status(200).json(allRecords);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// READ (Get by User)
router.get('/user/:userId', async (req, res) => {
  try {
    const records = await MedicalRecord.find({ userId: req.params.userId });
    res.status(200).json(records);
  } catch (error) { res.status(500).json({ message: "Error fetching records" }); }
});

// READ (Get by Doctor)
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const records = await MedicalRecord.find({ doctorId: req.params.doctorId });
    res.status(200).json(records);
  } catch (error) { 
    res.status(500).json({ message: "Error fetching doctor records" }); 
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updatedRecord = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // 🛑 ADDED: If a doctor completes a pending record, notify the patient globally!
    if (req.body.status === 'Completed' && req.body.isRead === false) {
      try {
         const newNoti = new Notification({
            userId: updatedRecord.userId,
            userRole: 'patient',
            title: 'Health Record Completed',
            message: `Your ${updatedRecord.recordType} update from Dr. ${updatedRecord.doctorName} is now complete and ready to view.`,
            isRead: false
         });
         await newNoti.save();
      } catch (notiError) {
         console.log("Failed to send notification on update:", notiError);
      }
    }

    res.status(200).json(updatedRecord);
  } catch (error) { res.status(500).json({ message: "Error updating record" }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await MedicalRecord.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Record deleted" });
  } catch (error) { res.status(500).json({ message: "Error deleting record" }); }
});

module.exports = router;