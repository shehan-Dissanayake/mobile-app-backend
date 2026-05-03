const { Expo } = require('expo-server-sdk');
let expo = new Expo();
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification'); 
const Doctor = require('../models/Doctor');

// POST: Book a new appointment
router.post('/book', async (req, res) => {
  try {
    const { userId, doctorId, doctorName, specialty, date, time } = req.body;
    
    const newAppointment = new Appointment({
      userId,
      doctorId,
      doctorName,
      specialty,
      date,
      time,
      status: 'Pending' // Explicitly setting status on creation
    });

    await newAppointment.save();

    // Notify the Patient
    if (userId) {
      await Notification.create({
        userId: userId,
        userRole: 'patient',
        title: 'Appointment Confirmed ✅',
        message: `Your appointment with Dr. ${doctorName} is booked for ${date} at ${time}.`
      });
    }

    // Notify the Doctor
    if (doctorId) {
      await Notification.create({
        userId: doctorId,
        userRole: 'doctor',
        title: 'New Appointment Booked 📅',
        message: `A new patient booked an appointment with you for ${date} at ${time}.`
      });
    }

    // Physical Expo Push Notification
    const targetPushToken = "ExponentPushToken[YOUR_COPIED_TOKEN_HERE]"; 
    if (Expo.isExpoPushToken(targetPushToken)) {
      let messages = [];
      messages.push({
        to: targetPushToken,
        sound: 'default',
        title: 'Appointment Confirmed ✅',
        body: `Your appointment with Dr. ${doctorName} is booked for ${date} at ${time}.`,
        data: { route: '/notifications' }, 
      });

      try {
        let chunks = expo.chunkPushNotifications(messages);
        for (let chunk of chunks) {
          await expo.sendPushNotificationsAsync(chunk);
        }
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
    }

    res.status(201).json({ message: 'Appointment booked successfully!', appointment: newAppointment });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET: Fetch all appointments for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userAppointments = await Appointment.find({ userId: userId });
    res.status(200).json(userAppointments);
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET: Fetch all appointments for a specific doctor
router.get('/doctor/:userId', async (req, res) => {
  try {
    const { userId } = req.params; 
    const doctorProfile = await Doctor.findOne({ userId: userId });

    if (!doctorProfile) {
      return res.status(200).json([]);
    }

    const doctorAppointments = await Appointment.find({ doctorId: doctorProfile._id });
    res.status(200).json(doctorAppointments);
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// 🛑 NEW ROUTE: Update Appointment Status (Pending -> Confirmed -> Completed)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status: status },
      { new: true } 
    );
    
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Notify Patient about the status change
    if (updatedAppointment.userId) {
      let emoji = status === 'Confirmed' ? '✅' : status === 'Completed' ? '🎉' : 'ℹ️';
      await Notification.create({
        userId: updatedAppointment.userId,
        userRole: 'patient',
        title: `Appointment ${status} ${emoji}`,
        message: `Your appointment with Dr. ${updatedAppointment.doctorName} has been marked as ${status}.`
      });
    }

    res.status(200).json({ message: `Appointment marked as ${status}!`, appointment: updatedAppointment });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// DELETE: Cancel an appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAppointment = await Appointment.findByIdAndDelete(id);
    
    if (!deletedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (deletedAppointment.userId) {
      await Notification.create({
        userId: deletedAppointment.userId,
        userRole: 'patient',
        title: 'Appointment Cancelled ❌',
        message: `Your appointment with Dr. ${deletedAppointment.doctorName} on ${deletedAppointment.date} at ${deletedAppointment.time} has been cancelled.`
      });
    }

    if (deletedAppointment.doctorId) {
      await Notification.create({
        userId: deletedAppointment.doctorId,
        userRole: 'doctor',
        title: 'Schedule Update: Cancellation',
        message: `An appointment on ${deletedAppointment.date} at ${deletedAppointment.time} has been cancelled.`
      });
    }

    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// PUT: Reschedule (Update) an appointment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { date: date, time: time },
      { new: true } 
    );
    
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (updatedAppointment.userId) {
      await Notification.create({
        userId: updatedAppointment.userId,
        userRole: 'patient',
        title: 'Appointment Rescheduled 🔄',
        message: `Your appointment with Dr. ${updatedAppointment.doctorName} has been rescheduled to ${date} at ${time}.`
      });
    }

    if (updatedAppointment.doctorId) {
      await Notification.create({
        userId: updatedAppointment.doctorId,
        userRole: 'doctor',
        title: 'Schedule Update: Rescheduled',
        message: `An appointment has been moved to ${date} at ${time}.`
      });
    }

    res.status(200).json({ message: 'Appointment rescheduled!', appointment: updatedAppointment });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// GET: Admin fetches ALL appointments
router.get('/', async (req, res) => {
  try {
    const allAppointments = await Appointment.find();
    res.status(200).json(allAppointments);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;