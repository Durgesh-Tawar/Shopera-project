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

const imagesCache = {};

function getImagesForFolderPath(fullDirPath) {
    if (imagesCache[fullDirPath]) return imagesCache[fullDirPath];
    try {
        const files = fs.readdirSync(fullDirPath).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
        imagesCache[fullDirPath] = files;
        return files;
    } catch(e) {
        console.error(`Folder reading error for ${fullDirPath}:`, e.message);
        return [];
    }
}

const folderIndexes = { 'sarees': 0, 'kurti': 0 };

const sareesPath = path.join(__dirname, 'images', 'women', 'sarees');
const kurtiPath = path.join(__dirname, 'images', 'women', 'kurti');

let updatedCount = 0;

products.forEach(p => {
    if (p.category === 'women') {
        const subName = p.subcategory.toLowerCase();
        
        // Match sarees
        if (subName === 'sarees' || subName === 'saree') {
            const availableImages = getImagesForFolderPath(sareesPath);
            if (availableImages.length > 0) {
                const selectedImage = availableImages[folderIndexes['sarees'] % availableImages.length];
                p.image = `images/women/sarees/${selectedImage}`;
                folderIndexes['sarees']++;
                updatedCount++;
            }
        }
        
        // Match kurtis/kurtas in women section
        else if (subName === 'kurtis' || subName === 'kurti' || subName === 'kurtas') {
            const availableImages = getImagesForFolderPath(kurtiPath);
            if (availableImages.length > 0) {
                const selectedImage = availableImages[folderIndexes['kurti'] % availableImages.length];
                p.image = `images/women/kurti/${selectedImage}`;
                folderIndexes['kurti']++;
                updatedCount++;
            }
        }
    }
});

const newJson = JSON.stringify(products, null, 4);
const newDataFileContent = `window.products = ${newJson};`;

fs.writeFileSync(dataFile, newDataFileContent, 'utf8');

console.log(`Successfully updated ${updatedCount} women's products (Sarees and Kurtis)!`);
