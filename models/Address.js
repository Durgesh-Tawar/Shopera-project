const dbHelper = require('./dbHelper');

const Address = {
    find: async ({ userId }) => {
        const db = dbHelper.read();
        return db.addresses.filter(a => a.userId === userId);
    },
    create: async (addressData) => {
        const db = dbHelper.read();
        const newAddress = {
            _id: Date.now().toString(),
            ...addressData,
            createdAt: new Date().toISOString()
        };
        db.addresses.push(newAddress);
        dbHelper.write(db);
        return newAddress;
    }
};

module.exports = Address;
