const fs = require('fs');

const dataFile = 'c:\\Users\\Lenovo\\Desktop\\shopera-project\\js\\data.js';

let content = fs.readFileSync(dataFile, 'utf8');
const dataPrefix = 'window.products = ';
const dataStr = content.replace(dataPrefix, '').trim().replace(/;\s*$/, '');
let products;
try {
  products = eval('(' + dataStr + ')');
} catch (e) {
  products = eval(dataStr);
}

// Find max ID
let maxId = 0;
products.forEach(p => {
    if (p.id > maxId) maxId = p.id;
});

const colorsList = ["#000000", "#ffffff", "#000080", "#800000", "#808000", "#F5F5DC"];

const newProducts = [
    {
        id: ++maxId,
        name: "Elegant Designer Saree",
        price: 3499,
        originalPrice: 5999,
        discount: 41,
        image: "images/women/saree/women_saree_1_1774863807182.png",
        category: "women",
        mood: "formal",
        subcategory: "sarees",
        sizes: ["Free Size"],
        rating: "4.8",
        ratingCount: 124,
        isNew: true,
        colors: colorsList
    },
    {
        id: ++maxId,
        name: "Traditional Silk Saree",
        price: 4599,
        originalPrice: 8999,
        discount: 48,
        image: "images/women/saree/women_saree_1_1774863807182.png",
        category: "women",
        mood: "formal",
        subcategory: "sarees",
        sizes: ["Free Size"],
        rating: "4.9",
        ratingCount: 89,
        isNew: false,
        colors: colorsList
    },
    {
        id: ++maxId,
        name: "Stylish Women's Denim Jeans",
        price: 1299,
        originalPrice: 2499,
        discount: 48,
        image: "images/women/jeans/women_jeans_1_1774863773731.png",
        category: "women",
        mood: "casual",
        subcategory: "jeans",
        sizes: ["26", "28", "30", "32", "34"],
        rating: "4.5",
        ratingCount: 210,
        isNew: true,
        colors: colorsList
    },
    {
        id: ++maxId,
        name: "Classic High-Waist Jeans",
        price: 1599,
        originalPrice: 2999,
        discount: 46,
        image: "images/women/jeans/women_jeans_1_1774863773731.png",
        category: "women",
        mood: "casual",
        subcategory: "jeans",
        sizes: ["26", "28", "30", "32", "34"],
        rating: "4.7",
        ratingCount: 156,
        isNew: false,
        colors: colorsList
    },
    {
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
    },
    {
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
    }
];

// Determine if we need to add them (avoid duplicates)
const existingSarees = products.filter(p => p.subcategory === 'sarees');
if (existingSarees.length === 0) {
    products.push(...newProducts);
    const updatedContent = `${dataPrefix}${JSON.stringify(products, null, 4)};`;
    fs.writeFileSync(dataFile, updatedContent);
    console.log('Added new saree, jeans, and kurti products to data.js');
} else {
    console.log('Products already exist.');
}
