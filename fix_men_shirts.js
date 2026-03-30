const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'js', 'data.js');
let content = fs.readFileSync(dataFile, 'utf8');

// Parse window.products
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

// User specified images sequence for casual shirts:
const targetImages = [
    'shirt1.jpg',
    'shirt2.jpg',
    'shirt3.jpg',
    'shirt5.jpg',
    'shirt6.jpg',
    'shirt7.jpg',
    'shirt8.jpg',
    'shirt9.jpg',
    'shirt10.jpg'
];

let index = 0;
let updatedCount = 0;

products.forEach(p => {
    // Look for men's casual shirts ("casual-shirts" or similar subcategories that might fit)
    // Looking at common subcategory names from shopera...
    if (p.category === 'men' && (p.subcategory === 'shirts' || p.subcategory === 'casual-shirts')) {
        const selectedImage = targetImages[index % targetImages.length];
        p.image = `images/men/shirt/${selectedImage}`;
        index++;
        updatedCount++;
    }
});

const newJson = JSON.stringify(products, null, 4);
const newDataFileContent = `window.products = ${newJson};`;

fs.writeFileSync(dataFile, newDataFileContent, 'utf8');

console.log(`Successfully updated ${updatedCount} casual shirts with specified target images!`);
