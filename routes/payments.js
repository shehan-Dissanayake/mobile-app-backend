const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice'); 
// NEW: Import the Notification model so we can create alerts!
const Notification = require('../models/Notification'); 

// STRIPE DEPENDENCY
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// 1. Create a Payment Intent (FOR MOBILE)
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    const amountInCents = Math.round(Number(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd', 
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. STRIPE CHECKOUT SESSION (FOR WEB)
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { invoiceId, amount, userId } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Invoice Payment`,
              description: `Payment for Invoice ID: ${invoiceId.substring(0, 8)}`,
            },
            unit_amount: Math.round(Number(amount) * 100), 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:8081/invoices?success=true&invoiceId=${invoiceId}&amount=${amount}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:8081/invoices?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. CREATE: Add a new payment, update Invoice, and SEND NOTIFICATION
router.post('/pay', async (req, res) => {
  try {
    const { invoiceId, userId, amount, method, date, stripePaymentId } = req.body;
    
    const newPayment = new Payment({ invoiceId, userId, amount, method, date, stripePaymentId });
    await newPayment.save();

    await Invoice.findByIdAndUpdate(invoiceId, { status: 'Paid' });

    // --- NEW: NOTIFICATION TRIGGER FOR PAYMENT ---
    const newNotification = new Notification({
      userId: userId,
      userRole: 'patient', // Assumes the payer is a patient
      title: 'Payment Successful',
      message: `Your payment of $${Number(amount).toFixed(2)} has been successfully processed. Thank you!`
    });
    await newNotification.save();
    // -------------------------------------------

    res.status(201).json({ message: 'Payment successful!', payment: newPayment });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// 4. READ: Admin gets ALL payments
router.get('/', async (req, res) => {
  try {
    const allPayments = await Payment.find().sort({ _id: -1 });
    res.status(200).json(allPayments);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// 5. READ: Get all payments for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const userPayments = await Payment.find({ userId: req.params.userId }).sort({ _id: -1 });
    res.status(200).json(userPayments);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// 6. UPDATE: Admin changes payment details
router.put('/:id', async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: 'Payment updated', payment: updatedPayment });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// 7. DELETE: Admin voids payment, refunds Stripe, and SENDS NOTIFICATION
router.delete('/:id', async (req, res) => {
  try {
    const paymentToVoid = await Payment.findById(req.params.id);
    if (!paymentToVoid) return res.status(404).json({ message: "Payment not found" });

    // Stripe Refund Logic
    if (paymentToVoid.stripePaymentId) {
      try {
        await stripe.refunds.create({ payment_intent: paymentToVoid.stripePaymentId });
      } catch (stripeError) {
        console.error("Stripe refund failed:", stripeError.message);
      }
    }

    if (paymentToVoid.invoiceId) {
      await Invoice.findByIdAndUpdate(paymentToVoid.invoiceId, { status: 'Pending' });
    }

    // --- NEW: NOTIFICATION TRIGGER FOR REFUND ---
    const newNotification = new Notification({
      userId: paymentToVoid.userId,
      userRole: 'patient',
      title: 'Refund Processed',
      message: `A refund of $${Number(paymentToVoid.amount).toFixed(2)} has been processed to your original payment method. Your invoice is now pending.`
    });
    await newNotification.save();
    // ------------------------------------------

    await Payment.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Payment record voided, refunded, and Invoice reset' });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;