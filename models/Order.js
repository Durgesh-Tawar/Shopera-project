const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            productId: String,
            name: String,
            price: Number,
            quantity: Number,
            image: String,
            color: String,
            size: String
        }
    ],
    totalAmount: { type: Number, required: true },
    address: {
        name: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        zip: String
    },
    status: { 
        type: String, 
        enum: ['Placed', 'Paid', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Return Approved', 'Out for Pickup', 'Picked Up', 'Returned', 'Refunded'],
        default: 'Placed' 
    },
    returnReason: { type: String },
    paymentId: String,
    paymentStatus: { type: String, default: 'Pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    trackingNumber: String,
    carrier: String,
    updates: [
        {
            status: String,
            message: String,
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
