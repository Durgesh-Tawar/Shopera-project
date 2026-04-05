const express = require('express');
console.log('🚀 Product route module loaded');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load products dynamically
let products = [];
try {
    const dataJsContent = fs.readFileSync(path.join(__dirname, '..', '..', 'frontend', 'js', 'data.js'), 'utf8');
    
    // Robust parsing of window.products variable
    let jsonStr = dataJsContent.trim();
    if (jsonStr.includes('window.products =')) {
        jsonStr = jsonStr.split('window.products =')[1].trim();
    }
    if (jsonStr.endsWith(';')) {
        jsonStr = jsonStr.substring(0, jsonStr.length - 1).trim();
    }
    
    products = JSON.parse(jsonStr);
    console.log(`📦 Loaded ${products.length} products from data.js`);
} catch (e) {
    console.error('❌ Failed to load products from data.js:', e.message);
}

// Get all products
router.get('/', (req, res) => {
    console.log(`\n--- 🕵️ API CALL: GET /api/products ---`);
    console.log(`🧐 Products in Memory: ${products.length}`);
    console.log(`🧐 Products is Array: ${Array.isArray(products)}`);
    if (products.length > 0) {
        console.log(`🧐 First Product: ${products[0].name} (Category: ${products[0].category})`);
    }
    
    const { category, mood, search } = req.query;
    console.log(`🧐 Query Params: category=${category}, mood=${mood}, search=${search}`);
    
    let filtered = [...products];
    
    if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
        console.log(`🧐 After category filter: ${filtered.length}`);
    }
    if (mood) filtered = filtered.filter(p => p.mood === mood);
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    
    console.log(`🧐 Sending response: ${filtered.length} products (${JSON.stringify(filtered).length} bytes)`);
    res.json(filtered);
});

// Search API
router.get('/search', (req, res) => {
    const query = (req.query.q || req.query.search || '').trim().toLowerCase();
    if (!query) return res.json({ success: true, products: [] });

    // (Simplified search logic for the modular version, can be expanded)
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
    );
    res.json({ success: true, products: filtered, count: filtered.length });
});

// Get single product
router.get('/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (product) res.json(product);
    else res.status(404).json({ error: 'Product not found' });
});

module.exports = router;
