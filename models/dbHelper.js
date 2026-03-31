const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

// Ensure directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Ensure file exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], addresses: [], orders: [] }, null, 2));
}

const dbHelper = {
    read: () => {
        try {
            const data = fs.readFileSync(DB_PATH, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            console.error('Error reading db.json:', e);
            return { users: [], addresses: [], orders: [] };
        }
    },
    write: (data) => {
        try {
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
            return true;
        } catch (e) {
            console.error('Error writing to db.json:', e);
            return false;
        }
    }
};

module.exports = dbHelper;
