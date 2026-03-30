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

// Find the maximum ID to guarantee unique IDs
let maxId = 0;
products.forEach(p => {
    if (p.id > maxId) maxId = p.id;
});

const newFormalKids = [
    {
        "id": maxId + 1,
        "name": "Boys Black Formal Suit",
        "price": 2499,
        "originalPrice": 3200,
        "discount": 22,
        "image": "images/kids/boy/jacket1.jpg",
        "category": "kids",
        "mood": "formal",
        "subcategory": "sets",
        "sizes": ["4-5Y", "5-6Y", "6-7Y"],
        "rating": "4.8",
        "ratingCount": 112,
        "isNew": true,
        "colors": ["#000000"]
    },
    {
        "id": maxId + 2,
        "name": "Girls Elegant Formal Gown",
        "price": 2899,
        "originalPrice": 4000,
        "discount": 27,
        "image": "images/kids/girl/dress1.jpg",
        "category": "kids",
        "mood": "formal",
        "subcategory": "dresses",
        "sizes": ["4-5Y", "5-6Y"],
        "rating": "4.6",
        "ratingCount": 89,
        "isNew": true,
        "colors": ["#ff69b4", "#ffffff"]
    },
    {
        "id": maxId + 3,
        "name": "Boys Formal Shirt & Trouser",
        "price": 1599,
        "originalPrice": 2200,
        "discount": 27,
        "image": "images/kids/boy/set1.jpg",
        "category": "kids",
        "mood": "formal",
        "subcategory": "sets",
        "sizes": ["6-7Y", "7-8Y"],
        "rating": "4.2",
        "ratingCount": 45,
        "isNew": false,
        "colors": ["#ffffff", "#000080"]
    },
    {
        "id": maxId + 4,
        "name": "Girls Formal Party Frock",
        "price": 1999,
        "originalPrice": 2500,
        "discount": 20,
        "image": "images/kids/girl/dress2.jpg",
        "category": "kids",
        "mood": "formal",
        "subcategory": "dresses",
        "sizes": ["5-6Y", "7-8Y", "9-10Y"],
        "rating": "4.9",
        "ratingCount": 230,
        "isNew": true,
        "colors": ["#ffd700", "#ffffff"]
    }
];

// Append new products
products.push(...newFormalKids);

const newJson = JSON.stringify(products, null, 4);
const newDataFileContent = `window.products = ${newJson};`;
fs.writeFileSync(dataFile, newDataFileContent, 'utf8');

console.log("Successfully added 4 formal wear products for Kids!");
