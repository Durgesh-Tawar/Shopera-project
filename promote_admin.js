require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const email = process.argv[2];

if (!email) {
    console.log('Usage: node promote_admin.js <email>');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
        if (user) {
            console.log(`✅ User ${email} is now an ADMIN.`);
        } else {
            console.log(`❌ User ${email} not found.`);
        }
        process.exit();
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
