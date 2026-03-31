const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT and Admin role
const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const user = await User.findById(decoded.id);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid token.' });
    }
};

// GET all orders
router.get('/orders', authenticateAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH update order status
router.patch('/order/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { status, trackingNumber, carrier, message } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (status) order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (carrier) order.carrier = carrier;

        // Add to updates history
        order.updates.push({
            status: status || order.status,
            message: message || `Order status updated to ${status || order.status}`,
            timestamp: new Date()
        });

        await order.save();
        res.json({ success: true, message: 'Order updated successfully', order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET stats for dashboard
router.get('/stats', authenticateAdmin, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: { $in: ['Placed', 'Paid', 'Processing'] } });
        const completedOrders = await Order.countDocuments({ status: 'Delivered' });
        
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            success: true,
            stats: {
                totalOrders,
                pendingOrders,
                completedOrders,
                totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET all users
router.get('/users', authenticateAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
