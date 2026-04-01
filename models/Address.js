const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    phone: String,
    pincode: String,
    locality: String,
    address: String,
    city: String,
    state: String,
    addressType: { type: String, default: 'Home' }
}, { timestamps: true });

// Add static methods to maintain compatibility with existing route code
AddressSchema.statics.upsert = async function(userId, addressData) {
    // Basic mapping to ensure nested updates work if needed
    return await this.findOneAndUpdate(
        { userId: userId },
        { $set: addressData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

module.exports = mongoose.models.Address || mongoose.model('Address', AddressSchema);
