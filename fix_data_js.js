const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\14ef91fc-510b-44e1-ada6-c69980890f51';
const destBaseDir = 'c:\\Users\\Lenovo\\Desktop\\shopera-project\\images\\women';
const dataFile = 'c:\\Users\\Lenovo\\Desktop\\shopera-project\\js\\data.js';

// 1. Move the skirt and suit images
const extraImages = [
    { sub: 'skirts', file: 'women_skirt_1_1774864652177.png' },
    { sub: 'suits',  file: 'women_suit_1_1774864671615.png' }
];

extraImages.forEach(item => {
    const destDir = path.join(destBaseDir, item.sub);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(path.join(srcDir, item.file), path.join(destDir, item.file));
});

// 2. Load data.js
let content = fs.readFileSync(dataFile, 'utf8');
const dataPrefix = 'window.products = ';
const dataStr = content.replace(dataPrefix, '').trim().replace(/;\s*$/, '');
let products = eval('(' + dataStr + ')');

const imageMappings = {
    'sarees': 'women_saree_1_1774863807182.png',
    'jeans': 'women_jeans_1_1774863773731.png',
    'skirts': 'women_skirt_1_1774864652177.png',
    'suits': 'women_suit_1_1774864671615.png'
};

const colorsList = ["#000000", "#ffffff", "#000080", "#800000", "#808000", "#F5F5DC"];

let maxId = 0;
products.forEach(p => {
    if (p.id > maxId) maxId = p.id;
    
    // Fix existing women products that got broken "undefined" image paths
    if (p.category === 'women') {
        const sub = p.subcategory;
        if (imageMappings[sub] && (!p.image || p.image.includes('undefined'))) {
            p.image = `images/women/${sub}/${imageMappings[sub]}`;
        }
    }
});

// 3. Add Kurti products since there are none for women!
const existingKurti = products.filter(p => p.category === 'women' && p.subcategory === 'kurti');
if (existingKurti.length === 0) {
    products.push({
        id: ++maxId,
        name: "Beautiful Embroidered Kurti",
        price: 999,
        originalPrice: 1999,
        discount: 50,
        image: "images/women/kurti/women_kurti_1_1774863790316.png",
        category: "women",
        mood: "casual",
        subcategory: "kurti",
        sizes: ["S", "M", "L", "XL", "XXL"],
        rating: "4.6",
        ratingCount: 305,
        isNew: true,
        colors: colorsList
    });
    products.push({
        id: ++maxId,
        name: "Casual Printed Kurti",
        price: 799,
        originalPrice: 1499,
        discount: 46,
        image: "images/women/kurti/women_kurti_1_1774863790316.png",
        category: "women",
        mood: "casual",
        subcategory: "kurti",
        sizes: ["S", "M", "L", "XL", "XXL"],
        rating: "4.4",
        ratingCount: 198,
        isNew: false,
        colors: colorsList
    });
}

// 4. Save data.js
const updatedContent = `${dataPrefix}${JSON.stringify(products, null, 4)};`;
fs.writeFileSync(dataFile, updatedContent);

console.log('Successfully fixed broken image paths and added missing kurtis.');
