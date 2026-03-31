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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// DB Connection
console.log('⏳ Connecting to MongoDB Atlas...');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ ATLAS CONNECTED (soperaDB)'))
    .catch(err => console.error('❌ ATLAS ERROR:', err.message));

// Health Check
app.get('/ping', (req, res) => res.json({ success: true, message: 'Server is LIVE on Port 5000' }));

// Routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/adminRoutes');

app.use('/', userRoutes); // Signup/Login
app.use('/api/products', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all Frontend
app.get(/^(?!\/signup|\/login|\/api|\/ping).+/, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🛍️  Backend running at http://localhost:${PORT}`);
    console.log(`📡 PING: http://localhost:${PORT}/ping`);
    console.log(`📡 SIGNUP: http://localhost:${PORT}/signup\n`);
});
