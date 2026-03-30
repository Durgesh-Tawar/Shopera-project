const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'js', 'data.js');
let content = fs.readFileSync(dataFile, 'utf8');

const jsonMatch = content.match(/window\.products\s*=\s*(\[[\s\S]*\]);/);
if (!jsonMatch) {
    console.error("Could not find window.products in data.js");
    process.exit(1);
}

let products;
try {
    products = eval(jsonMatch[1]);
} catch (e) {
    console.error("Error parsing JSON array:", e);
    process.exit(1);
}

// Sherwanis will use the premium/heavy looking kurtas from the second half of the sequence
const targetImages = [
    'kurta6.jpg',
    'kurta7.jpg',
    'kurta8.jpg',
    'kurta9.jpg',
    'kurta10.jpg'
];

let index = 0;
let updatedCount = 0;

products.forEach(p => {
    if (p.category === 'men' && p.subcategory === 'sherwanis') {
        const selectedImage = targetImages[index % targetImages.length];
        p.image = `images/men/kurta/${selectedImage}`;
        index++;
        updatedCount++;
    }
});

const newJson = JSON.stringify(products, null, 4);
const newDataFileContent = `window.products = ${newJson};`;

fs.writeFileSync(dataFile, newDataFileContent, 'utf8');

console.log(`Successfully updated ${updatedCount} Sherwanis images!`);
