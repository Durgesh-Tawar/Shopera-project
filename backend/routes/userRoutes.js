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
// Initialize Nodemailer transporter
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const message = {
        from: `Shopera Support <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    await transporter.sendMail(message);
};

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            // Return success even if user not found for security reasons
            return res.status(200).json({ success: true, message: 'If an account with that email exists, we have sent a password reset link.' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset url
        // Defaulting to localhost:5000/reset-password.html if running locally
        const host = req.get('host');
        // Let's assume standard protocol is http for this demo, or derive from req
        const protocol = req.protocol;
        const resetUrl = `${protocol}://${host}/reset-password.html?token=${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Shopera - Password Reset Token',
                message
            });

            res.status(200).json({ success: true, message: 'If an account with that email exists, we have sent a password reset link.' });
        } catch (err) {
            console.error('🔥 EMAIL SEND ERROR:', err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error('🔥 FORGOT PASSWORD ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.body.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful!' });
    } catch (error) {
        console.error('🔥 RESET PASSWORD ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
