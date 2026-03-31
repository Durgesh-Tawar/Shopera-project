const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Place Order
router.post('/place', authenticateToken, async (req, res) => {
    try {
        const { products, totalAmount, address, addressId, paymentId, paymentStatus } = req.body;
        
        // If addressId is provided, fetch address details (logic can be expanded here)
        // For now, we assume address is passed or handles as generic object in Model
        
        const order = await Order.create({
            userId: req.user.id,
            products,
            totalAmount,
            address: address || { name: req.user.name, email: req.user.email }, // Fallback
            paymentId,
            paymentStatus: paymentStatus || 'completed',
            status: 'Placed'
        });
        
        res.status(201).json({ success: true, message: 'Order placed successfully', order });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get My Orders
router.get('/my-orders', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id });
        res.json({ success: true, orders: orders.reverse() }); // Sort by latest
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
