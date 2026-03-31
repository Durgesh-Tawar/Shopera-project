const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load products dynamically
let products = [];
try {
    const dataJsContent = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');
    const jsonStr = dataJsContent.replace('window.products = ', '').replace(/;\s*$/, '');
    products = JSON.parse(jsonStr);
} catch (e) {
    console.error('Could not load products from data.js:', e);
}

// Get all products
router.get('/', (req, res) => {
    const { category, mood, search } = req.query;
    let filtered = [...products];
    
    if (category && category !== 'all') filtered = filtered.filter(p => p.category === category);
    if (mood) filtered = filtered.filter(p => p.mood === mood);
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    
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
