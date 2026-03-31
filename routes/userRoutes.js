const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Signup API with Extreme Transparency
router.post('/signup', async (req, res) => {
    console.log('\n--- 🟢 SIGNUP REQUEST ---');
    console.log('Time:', new Date().toISOString());
    console.log('Body:', JSON.stringify(req.body, null, 2));

    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            console.log('⚠️ Missing fields');
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        console.log('🔍 Checking DB Connection (ReadyState:', mongoose.connection.readyState, ')');
        if (mongoose.connection.readyState !== 1) {
            console.error('❌ DB Disconnected');
            return res.status(503).json({ success: false, message: 'Database disconnected. Please check Atlas.' });
        }

        console.log('🔍 Checking for existing user:', email);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('⚠️ Duplicate Email');
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        console.log('💾 Saving to MongoDB Atlas...');
        const user = new User({ name, email, password });
        await user.save();
        console.log('✅ SAVED SUCCESSFULLY');

        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully!',
            user: { name: user.name, email: user.email }
        });

    } catch (error) {
        console.error('🔥 SIGNUP ERROR:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error',
            debug_info: error.message 
        });
    }
});

// Login with JWT support
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔍 Login attempt:', email);
        
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '7d' }
        );

        res.json({ 
            success: true, 
            message: 'Login successful!', 
            token,
            user: { 
                id: user._id,
                name: user.name, 
                email: user.email,
                role: user.role
            } 
        });
    } catch (error) {
        console.error('🔥 LOGIN ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
