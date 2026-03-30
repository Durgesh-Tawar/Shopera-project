const fs = require('fs');

const dataFile = 'c:\\Users\\Lenovo\\Desktop\\shopera-project\\js\\data.js';

let content = fs.readFileSync(dataFile, 'utf8');
const dataPrefix = 'window.products = ';
const dataStr = content.replace(dataPrefix, '').trim().replace(/;\s*$/, '');
let products = eval('(' + dataStr + ')');

// Define exactly what images we have for each subcategory
const imageFiles = {
    'dresses': ['women_dress_1_1774862896208.png', 'women_dress_2_1774862930732.png'],
    'tops': ['women_top_1_1774862955784.png', 'women_top_2_1774862982437.png'],
    'gowns': ['women_gown_1_1774863030565.png', 'women_gown_2_1774863061340.png'],
    'sweaters': ['women_sweater_1_1774863095448.png', 'women_sweater_2_1774863124545.png'],
    'sarees': ['women_saree_1_1774863807182.png'],
    'jeans': ['women_jeans_1_1774863773731.png'],
    'kurti': ['women_kurti_1_1774863790316.png'],
    'skirts': ['women_skirt_1_1774864652177.png'],
    'suits': ['women_suit_1_1774864671615.png']
};

// Folders are named EXACTLY as the keys in imageFiles
// EXCEPT potentially singular/plural? No, I checked:
// dresses, tops, gowns, sweaters, sarees, jeans, kurti, skirts, suits.

const counters = {};
Object.keys(imageFiles).forEach(k => counters[k] = 0);

products.forEach(p => {
    if (p.category === 'women') {
        const sub = p.subcategory;
        if (imageFiles[sub]) {
            const files = imageFiles[sub];
            const idx = counters[sub] % files.length;
            p.image = `images/women/${sub}/${files[idx]}`;
            counters[sub]++;
        } else {
            // fallback for missing subcategory mapping
            console.log('No image mapping for subcategory:', sub);
        }
    }
});

const updatedContent = `${dataPrefix}${JSON.stringify(products, null, 4)};`;
fs.writeFileSync(dataFile, updatedContent);

console.log('Successfully applied global image path fix for all women categories.');
console.log('Counts:', counters);
