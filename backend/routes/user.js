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

// In-memory fallback for when MongoDB Atlas connection fails
const fallbackAddresses = {};

// Add or Update Address
router.post('/addresses', authenticateToken, async (req, res) => {
    try {
        // Mongoose 6+ Upsert syntax handling
        const address = await Address.findOneAndUpdate(
            { userId: req.user.id },
            { ...req.body, userId: req.user.id },
            { new: true, upsert: true }
        );
        res.status(201).json({ success: true, message: 'Address saved successfully', address });
    } catch (error) {
        console.warn('DB Error on POST /addresses, using fallback:', error.message);
        const newAddr = { _id: Date.now().toString(), ...req.body, userId: req.user.id };
        fallbackAddresses[req.user.id] = [newAddr]; // Store latest address as active
        res.status(201).json({ success: true, message: 'Address saved successfully (Fallback)', address: newAddr });
    }
});

// Get User Addresses
router.get('/addresses', authenticateToken, async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user.id });
        // If DB is empty but we have fallback from a crashed session, return fallback
        if (addresses.length === 0 && fallbackAddresses[req.user.id]) {
            return res.json({ success: true, addresses: fallbackAddresses[req.user.id] });
        }
        res.json({ success: true, addresses });
    } catch (error) {
        console.warn('DB Error on GET /addresses, using fallback:', error.message);
        const addresses = fallbackAddresses[req.user.id] || [];
        res.json({ success: true, addresses, warning: "Using memory fallback due to DB connection issue" });
    }
});

module.exports = router;
