const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'js', 'data.js');
let content = fs.readFileSync(dataFile, 'utf8');

// We need to parse window.products
const jsonMatch = content.match(/window\.products\s*=\s*(\[[\s\S]*\]);/);
if (!jsonMatch) {
    console.error("Could not find window.products in data.js");
    process.exit(1);
}

let products;
try {
    // using eval is easiest for raw js objects if they aren't strict JSON
    products = eval(jsonMatch[1]);
} catch (e) {
    console.error("Error parsing JSON array:", e);
    process.exit(1);
}

// Map subcategories to their respective folders
const subcategoryFolderMap = {
    't-shirts': 't-shirt',
    'shirts': 'shirt',
    'jeans': 'jeans',
    'trousers': 'jeans', // fallback
    'suits': 'jacket', // fallback
    'kurtas': 'kurta',
    'ethnic-sets': 'kurta', // fallback
    'sweaters': 'jacket', // fallback
    'jackets': 'jacket',
    'shoes': 'shoes',
    'accessories': 'accessories'
};

const imagesCache = {};

function getImagesForFolder(folderName) {
    if (imagesCache[folderName]) return imagesCache[folderName];
    const dirPath = path.join(__dirname, 'images', 'men', folderName);
    try {
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
        imagesCache[folderName] = files;
        return files;
    } catch(e) {
        console.error(`Folder reading error for ${folderName}:`, e.message);
        return [];
    }
}

// keep track of index to cycle through images
const folderIndexes = {};

let updatedCount = 0;

products.forEach(p => {
    if (p.category === 'men') {
        if (p.subcategory === 'formal-shirts') {
            // Keep existing formal shirts
            return;
        }

        const folderName = subcategoryFolderMap[p.subcategory];
        if (folderName) {
            const availableImages = getImagesForFolder(folderName);
            if (availableImages && availableImages.length > 0) {
                if (folderIndexes[folderName] === undefined) {
                    folderIndexes[folderName] = 0;
                }
                
                // assign the image
                const selectedImage = availableImages[folderIndexes[folderName] % availableImages.length];
                p.image = `images/men/${folderName}/${selectedImage}`;
                
                folderIndexes[folderName]++;
                updatedCount++;
            }
        }
    }
});

// Stringify properties explicitly to maintain structure as json
const newJson = JSON.stringify(products, null, 4);
const newDataFileContent = `window.products = ${newJson};`;

fs.writeFileSync(dataFile, newDataFileContent, 'utf8');

console.log(`Successfully updated ${updatedCount} products in data.js!`);
