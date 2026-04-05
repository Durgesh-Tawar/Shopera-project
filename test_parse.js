const fs = require('fs');
const path = require('path');

try {
    const dataJsPath = 'c:/Users/Lenovo/Desktop/shopera-project/frontend/js/data.js';
    const dataJsContent = fs.readFileSync(dataJsPath, 'utf8');
    
    // Improved parsing logic to handle potential junk at start/end
    let jsonStr = dataJsContent.trim();
    if (jsonStr.startsWith('window.products =')) {
        jsonStr = jsonStr.substring('window.products ='.length).trim();
    }
    if (jsonStr.endsWith(';')) {
        jsonStr = jsonStr.substring(0, jsonStr.length - 1).trim();
    }
    
    const products = JSON.parse(jsonStr);
    console.log('Success! Loaded', products.length, 'products');
    console.log('First product category:', products[0].category);
} catch (e) {
    console.error('Failed to parse data.js:', e);
}
