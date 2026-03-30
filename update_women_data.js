const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\14ef91fc-510b-44e1-ada6-c69980890f51';
const destBaseDir = 'c:\\Users\\Lenovo\\Desktop\\shopera-project\\images\\women';
const dataFile = 'c:\\Users\\Lenovo\\Desktop\\shopera-project\\js\\data.js';

const subcategories = ['dresses', 'tops', 'gowns', 'sweaters'];
const imageMappings = {
  'dresses': ['women_dress_1_1774862896208.png', 'women_dress_2_1774862930732.png'],
  'tops': ['women_top_1_1774862955784.png', 'women_top_2_1774862982437.png'],
  'gowns': ['women_gown_1_1774863030565.png', 'women_gown_2_1774863061340.png'],
  'sweaters': ['women_sweater_1_1774863095448.png', 'women_sweater_2_1774863124545.png']
};

// Colors to assign to women's products
const colorsList = ["#000000", "#ffffff", "#000080", "#800000", "#808000", "#F5F5DC"];

subcategories.forEach(sub => {
  const destDir = path.join(destBaseDir, sub);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  imageMappings[sub].forEach(file => {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  });
});

let content = fs.readFileSync(dataFile, 'utf8');
const dataPrefix = 'window.products = ';
const dataStr = content.replace(dataPrefix, '').trim();
let products;
try {
  products = eval('(' + dataStr + ')');
} catch (e) {
  products = eval(dataStr);
}

const counters = { 'dresses': 0, 'tops': 0, 'gowns': 0, 'sweaters': 0 };

products.forEach(p => {
  if (p.category === 'women') {
    const sub = p.subcategory || 'dresses'; // default to dresses if unknown
    const mapping = imageMappings[sub] || imageMappings['dresses'];
    const idx = counters[sub] % mapping.length;
    p.image = `images/women/${sub}/${mapping[idx]}`;
    p.colors = colorsList;
    counters[sub]++;
  }
});

const updatedContent = `${dataPrefix}${JSON.stringify(products, null, 4)};`;
fs.writeFileSync(dataFile, updatedContent);

console.log('Successfully updated women products with images and 6 colors.');
