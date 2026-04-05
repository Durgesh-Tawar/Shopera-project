const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

// Setup multer for image upload
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'review-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
}).array('images', 5); // accept up to 5 images

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

// Route to handle image upload
router.post('/upload', authenticateToken, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (req.files) {
            const filePaths = req.files.map(file => `/uploads/${file.filename}`);
            return res.json({ success: true, paths: filePaths });
        } else {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
    });
});

// Route to submit a review
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { productId, orderId, rating, comment, images } = req.body;
        const review = await Review.create({
            userId: req.user.id,
            productId,
            orderId,
            rating,
            comment,
            images
        });
        res.status(201).json({ success: true, message: 'Review submitted successfully', review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Route to get reviews for a specific product
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).populate('userId', 'name').sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Route to get all reviews for admin
router.get('/all', async (req, res) => {
    try {
        const reviews = await Review.find().populate('userId', 'name email').populate('orderId').sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
