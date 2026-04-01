const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
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

// Add or Update Address
router.post('/addresses', authenticateToken, async (req, res) => {
    try {
        const address = await Address.upsert(req.user.id, req.body);
        
        res.status(201).json({ success: true, message: 'Address saved successfully', address });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get User Addresses
router.get('/addresses', authenticateToken, async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user.id });
        res.json({ success: true, addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
