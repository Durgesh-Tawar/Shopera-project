require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Catch global errors
process.on('uncaughtException', (err) => console.error('🛑 GLOBAL EXCEPTION:', err));
process.on('unhandledRejection', (reason) => console.error('🛑 GLOBAL REJECTION:', reason));

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for development/simple deployment
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Connection
console.log('⏳ Connecting to MongoDB Atlas...');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ ATLAS CONNECTED (soperaDB)'))
    .catch(err => console.error('❌ ATLAS ERROR:', err.message));

// Health Check
app.get('/ping', (req, res) => res.json({ success: true, message: 'Server is LIVE' }));

// Routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/payment');
const userProfileRoutes = require('./routes/user');
const reviewRoutes = require('./routes/reviewRoutes');

app.use('/', userRoutes); // Signup/Login
app.use('/api/products', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', paymentRoutes); // Razorpay routes
app.use('/api/user', userProfileRoutes); // Address and profile routes
app.use('/api/reviews', reviewRoutes); // Review and upload routes

// Catch-all Frontend (Only if running on same server, but good to keep as fallback)
app.get(/^(?!\/signup|\/login|\/api|\/ping).+/, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🛍️  Backend running at http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/ping\n`);
});
