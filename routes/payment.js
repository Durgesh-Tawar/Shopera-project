const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Output status to logs cleanly without throwing if missing
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("⚠️ RAZORPAY KEYS MISSING from .env!");
}

let razorpay;
try {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
} catch (err) {
    console.error("Razorpay initialization failed:", err.message);
}

// GET: Send Razorpay Key to Frontend
router.get('/razorpay-key', (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// POST: Create Order
router.post('/create-order', async (req, res) => {
    if (!razorpay) return res.status(500).json({ success: false, error: 'Razorpay not initialized' });
    
    try {
        const { amount, currency, receipt } = req.body;
        
        const options = {
            amount: amount, // Amount is in paise
            currency: currency || "INR",
            receipt: receipt || ('order_rcptid_' + Date.now())
        };

        const order = await razorpay.orders.create(options);
        
        if (!order) {
            return res.status(500).json({ success: false, error: 'Failed to create order' });
        }
        
        res.json({ 
            success: true, 
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        console.error("Razorpay Create Order Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST: Verify Payment
router.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");
            
        const isAuthentic = expectedSignature === razorpay_signature;
        
        if (isAuthentic) {
            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
    } catch (error) {
        console.error("Razorpay Verify Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
