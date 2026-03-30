const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'js', 'data.js');
let content = fs.readFileSync(dataFile, 'utf8');

const jsonMatch = content.match(/window\.products\s*=\s*(\[[\s\S]*\]);/);
let products;
try {
    products = eval(jsonMatch[1]);
} catch (e) {
    console.error("Error parsing JSON array:", e);
    process.exit(1);
}

const kidsProducts = products.filter(p => p.category === 'kids');
const moodCounts = {};

kidsProducts.forEach(p => {
    moodCounts[p.mood] = (moodCounts[p.mood] || 0) + 1;
});

console.log("Kids Products Mood Distribution:");
console.log(moodCounts);
