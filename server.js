// =========================================
// SOPERA - Express.js Backend Server
// =========================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Razorpay imports
const Razorpay = require('razorpay');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// In-memory data store (would be database in production)
let products = [
    // Men Category
    {id:1, name:"Classic White Shirt", price:1299, image:"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500", category:"men", mood:"formal", description:"Premium quality cotton white shirt, perfect for formal occasions.", stock:15, sizes:["S","M","L","XL","XXL"]},
    {id:2, name:"Slim Fit Jeans", price:1899, image:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=500", category:"men", mood:"casual", description:"Modern slim fit jeans with comfortable stretch.", stock:20, sizes:["28","30","32","34","36"]},
    {id:3, name:"Navy Blazer", price:3499, image:"https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500", category:"men", mood:"formal", description:"Elegant navy blazer for professional look.", stock:8, sizes:["S","M","L","XL"]},
    {id:4, name:"Casual T-Shirt", price:599, image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", category:"men", mood:"casual", description:"Soft cotton t-shirt for everyday comfort.", stock:50, sizes:["S","M","L","XL","XXL"]},
    {id:5, name:"Leather Belt", price:499, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500", category:"men", mood:"formal", description:"Genuine leather belt with silver buckle.", stock:25, sizes:["S","M","L"]},
    
    // Women Category
    {id:6, name:"Floral Summer Dress", price:1599, image:"https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500", category:"women", mood:"party", description:"Beautiful floral print summer dress.", stock:12, sizes:["XS","S","M","L","XL"]},
    {id:7, name:"High-Waist Jeans", price:1799, image:"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500", category:"women", mood:"casual", description:"Trendy high-waist jeans for women.", stock:18, sizes:["26","28","30","32","34"]},
    {id:8, name:"Elegant Silk Saree", price:3999, image:"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500", category:"women", mood:"formal", description:"Luxurious silk saree with elegant design.", stock:5, sizes:["Free Size"]},
    {id:9, name:"Crop Top", price:699, image:"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500", category:"women", mood:"party", description:"Stylish crop top for party wear.", stock:30, sizes:["XS","S","M","L"]},
    {id:10, name:"Leather Handbag", price:2499, image:"https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500", category:"women", mood:"formal", description:"Premium leather handbag with multiple compartments.", stock:10, sizes:["One Size"]},
    
    // Kids Category
    {id:11, name:"Kids Denim Set", price:999, image:"https://images.unsplash.com/photo-1519235106638-35e35556b40d?w=500", category:"kids", mood:"casual", description:"Cute denim set for kids.", stock:15, sizes:["2-3Y","4-5Y","6-7Y","8-9Y"]},
    {id:12, name:"Cartoon T-Shirt", price:499, image:"https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500", category:"kids", mood:"casual", description:"Fun cartoon print t-shirt for kids.", stock:40, sizes:["2-3Y","4-5Y","6-7Y","8-9Y","10-11Y"]},
    {id:13, name:"Kids Frock", price:1199, image:"https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500", category:"kids", mood:"party", description:"Beautiful party frock for kids.", stock:12, sizes:["2-3Y","4-5Y","6-7Y","8-9Y"]},
    {id:14, name:"Kids Sport Shoes", price:899, image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", category:"kids", mood:"casual", description:"Comfortable sport shoes for active kids.", stock:20, sizes:["26","28","30","32","34"]},
    {id:15, name:"Kids Winter Jacket", price:1499, image:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500", category:"kids", mood:"casual", description:"Warm winter jacket for kids.", stock:10, sizes:["2-3Y","4-5Y","6-7Y","8-9Y","10-11Y"]},
];

// Initialize orders from localStorage file or empty array
let orders = [];
const ordersFile = path.join(__dirname, 'orders.json');
try {
    if (fs.existsSync(ordersFile)) {
        orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    }
} catch (e) {
    orders = [];
}

// Save orders to file
function saveOrders() {
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

// ==================== API ROUTES ====================

// Get all products
app.get('/api/products', (req, res) => {
    const { category, mood, search } = req.query;
    let filtered = [...products];
    
    if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    if (mood) {
        filtered = filtered.filter(p => p.mood === mood);
    }
    if (search) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    res.json(filtered);
});

// =========================================
// SEARCH API ROUTES
// =========================================

// Dedicated search endpoint with intelligent matching
app.get('/api/search', (req, res) => {
    const query = (req.query.q || req.query.search || '').trim().toLowerCase();
    
    if (!query) {
        return res.json({ success: true, products: [], message: 'No search query provided' });
    }
    
    // Search aliases mapping for intelligent matching
    const aliases = {
        'men': ['men', 'man', 'male', 'boys', 'gentleman'],
        'women': ['women', 'woman', 'female', 'girls', 'ladies'],
        'kids': ['kids', 'kid', 'child', 'children', 'baby'],
        'shirts': ['shirt', 'shirts', 'tshirt', 't-shirt', 'tee', 'polo'],
        'dresses': ['dress', 'dresses', 'gown', 'frock'],
        'jeans': ['jeans', 'jean', 'pants', 'denim'],
        'jackets': ['jacket', 'coat', 'blazer', 'sweater'],
        'sarees': ['saree', 'sari', 'lehenga'],
        'tops': ['top', 'blouse', 'crop top'],
        'party': ['party', 'celebration', 'festive', 'wedding'],
        'formal': ['formal', 'office', 'professional', 'business'],
        'casual': ['casual', 'everyday', 'daily']
    };
    
    // Determine search type
    let searchType = 'products';
    let matchedCategory = null;
    let matchedSection = null;
    
    // Check for category match (men/women/kids)
    for (const [category, keywords] of Object.entries(aliases)) {
        if (['men', 'women', 'kids'].includes(category)) {
            if (keywords.some(kw => query === kw || query.includes(kw))) {
                searchType = 'category';
                matchedCategory = category;
                break;
            }
        }
    }
    
    // Check for section match (shirts, jeans, etc.)
    if (searchType === 'products') {
        for (const [section, keywords] of Object.entries(aliases)) {
            if (!['men', 'women', 'kids', 'party', 'formal', 'casual'].includes(section)) {
                if (keywords.some(kw => query === kw || query.includes(kw))) {
                    searchType = 'section';
                    matchedSection = section;
                    break;
                }
            }
        }
    }
    
    // Check for mood match (party/formal/casual)
    if (searchType === 'products') {
        for (const [mood, keywords] of Object.entries(aliases)) {
            if (['party', 'formal', 'casual'].includes(mood)) {
                if (keywords.some(kw => query === kw || query.includes(kw))) {
                    searchType = 'mood';
                    matchedCategory = mood;
                    break;
                }
            }
        }
    }
    
    // Filter products based on search type
    let filteredProducts = [];
    
    if (searchType === 'category') {
        filteredProducts = products.filter(p => p.category === matchedCategory);
    } else if (searchType === 'section') {
        filteredProducts = products.filter(p => {
            const nameMatch = p.name.toLowerCase().includes(matchedSection) || p.name.toLowerCase().includes(query);
            return nameMatch;
        });
    } else if (searchType === 'mood') {
        filteredProducts = products.filter(p => p.mood === matchedCategory);
    } else {
        filteredProducts = products.filter(p => {
            const nameMatch = p.name.toLowerCase().includes(query);
            const categoryMatch = p.category.toLowerCase().includes(query);
            const moodMatch = p.mood && p.mood.toLowerCase().includes(query);
            return nameMatch || categoryMatch || moodMatch;
        });
    }
    
    // Remove duplicates
    const uniqueProducts = [...new Map(filteredProducts.map(p => [p.id, p])).values()];
    
    // Generate suggestions
    const suggestions = [...new Set(products.filter(p => 
        p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
    ).map(p => p.name))].slice(0, 5);
    
    res.json({
        success: true,
        query: query,
        searchType: searchType,
        category: matchedCategory,
        section: matchedSection,
        count: uniqueProducts.length,
        products: uniqueProducts,
        suggestions: suggestions
    });
});

// Search suggestions for autocomplete dropdown
app.get('/api/search/suggestions', (req, res) => {
    const query = (req.query.q || '').trim().toLowerCase();
    
    if (!query || query.length < 2) {
        return res.json({ suggestions: [] });
    }
    
    const suggestions = [...new Set(products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.mood.toLowerCase().includes(query)
    ).map(p => ({ name: p.name, category: p.category, mood: p.mood })))].slice(0, 8);
    
    res.json({ suggestions: suggestions });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// Create order
app.post('/api/orders', (req, res) => {
    const { items, total, loyalty, customerInfo } = req.body;
    
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }
    
    const order = {
        id: Date.now(),
        items: items,
        total: total,
        loyalty: loyalty || Math.floor(total / 100),
        status: 'placed',
        date: new Date().toISOString(),
        customerInfo: customerInfo || {},
        trackingNumber: 'SOP' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };
    
    orders.push(order);
    saveOrders();
    
    res.json({ success: true, order: order });
});

// Get all orders
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

// Get single order
app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Update order status
app.patch('/api/orders/:id', (req, res) => {
    const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
    if (orderIndex > -1) {
        orders[orderIndex] = { ...orders[orderIndex], ...req.body };
        saveOrders();
        res.json(orders[orderIndex]);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Cancel order
app.delete('/api/orders/:id', (req, res) => {
    const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
    if (orderIndex > -1) {
        orders[orderIndex].status = 'cancelled';
        orders[orderIndex].cancelled = true;
        saveOrders();
        res.json({ success: true, message: 'Order cancelled' });
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Newsletter subscription
app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    
    // In production, save to database
    console.log(`Newsletter subscription: ${email}`);
    res.json({ success: true, message: 'Subscribed successfully!' });
});

// Spin & Win - Get discount
app.post('/api/spin', (req, res) => {
    const prizes = [
        { discount: 5, label: '5% OFF' },
        { discount: 10, label: '10% OFF' },
        { discount: 15, label: '15% OFF' },
        { discount: 20, label: '20% OFF' },
        { discount: 25, label: '25% OFF' },
        { discount: 50, label: '50% OFF' },
    ];
    
    const result = prizes[Math.floor(Math.random() * prizes.length)];
    res.json(result);
});

// =========================================
// REELS COMMENTS API (File-based storage)
// =========================================

// Comments file path
const commentsFile = path.join(__dirname, 'reels-comments.json');

// Load comments from file
function loadComments() {
    try {
        if (fs.existsSync(commentsFile)) {
            return JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
        }
    } catch (e) {
        console.error('Error loading comments:', e);
    }
    return {};
}

// Save comments to file
function saveComments(comments) {
    try {
        fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
    } catch (e) {
        console.error('Error saving comments:', e);
    }
}

// Get comments for a specific reel
app.get('/api/reels/:reelId/comments', (req, res) => {
    const { reelId } = req.params;
    const allComments = loadComments();
    const reelComments = allComments[reelId] || [];
    res.json({ success: true, comments: reelComments });
});

// Add comment to a reel
app.post('/api/reels/:reelId/comments', (req, res) => {
    const { reelId } = req.params;
    const { user, text } = req.body;
    
    if (!user || !text) {
        return res.status(400).json({ success: false, error: 'User and text are required' });
    }
    
    const allComments = loadComments();
    
    if (!allComments[reelId]) {
        allComments[reelId] = [];
    }
    
    const newComment = {
        id: Date.now().toString(),
        reelId: parseInt(reelId),
        user: user,
        text: text,
        time: 'Just now',
        createdAt: new Date().toISOString()
    };
    
    allComments[reelId].unshift(newComment);
    saveComments(allComments);
    
    res.json({ success: true, comment: newComment });
});

// Delete comment from a reel (secured by comment ID and user ownership)
app.delete('/api/reels/:reelId/comments/:commentId', (req, res) => {
    const { reelId, commentId } = req.params;
    const { user } = req.body;
    
    if (!user) {
        return res.status(400).json({ success: false, error: 'User identification required' });
    }
    
    const allComments = loadComments();
    
    if (!allComments[reelId]) {
        return res.status(404).json({ success: false, error: 'Reel not found' });
    }
    
    const commentIndex = allComments[reelId].findIndex(c => c.id === commentId);
    
    if (commentIndex === -1) {
        return res.status(404).json({ success: false, error: 'Comment not found' });
    }
    
    // Verify ownership - only the comment owner can delete
    if (allComments[reelId][commentIndex].user !== user) {
        return res.status(403).json({ success: false, error: 'Unauthorized: You can only delete your own comments' });
    }
    
    // Remove comment
    allComments[reelId].splice(commentIndex, 1);
    saveComments(allComments);
    
    res.json({ success: true, message: 'Comment deleted successfully' });
});

// =========================================
// RAZORPAY PAYMENT ROUTES
// =========================================

// Get Razorpay Key ID for frontend
app.get('/api/razorpay-key', (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// Create Razorpay Order
app.post('/api/create-order', async (req, res) => {
    const { amount, currency = 'INR', receipt } = req.body;
    
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }
    
    try {
        const options = {
            amount: Math.round(amount * 100), // Convert to paise (Razorpay expects amount in paise)
            currency: currency,
            receipt: receipt || 'order_' + Date.now(),
            payment_capture: 1 // Auto-capture payment
        };
        
        const order = await razorpay.orders.create(options);
        
        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({ 
            error: 'Failed to create order',
            details: error.message 
        });
    }
});

// Verify Payment Signature
app.post('/api/verify-payment', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing payment verification details' });
    }
    
    try {
        // Create signature verification string
        const signatureData = razorpay_order_id + '|' + razorpay_payment_id;
        
        // Generate expected signature using HMAC-SHA256
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(signatureData)
            .digest('hex');
        
        // Compare signatures
        if (expectedSignature === razorpay_signature) {
            res.json({
                success: true,
                message: 'Payment verified successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Invalid signature'
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            error: 'Payment verification failed',
            details: error.message
        });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🛍️  SOPERA Server running at http://localhost:${PORT}`);
    console.log(`📦 API Endpoints:`);
    console.log(`   GET  /api/products        - Get all products`);
    console.log(`   GET  /api/products/:id    - Get single product`);
    console.log(`   POST /api/orders          - Create order`);
    console.log(`   GET  /api/orders         - Get all orders`);
    console.log(`   GET  /api/orders/:id     - Get order by ID`);
    console.log(`   PATCH /api/orders/:id    - Update order status`);
    console.log(`   DELETE /api/orders/:id   - Cancel order`);
    console.log(`   POST /api/newsletter     - Newsletter subscription`);
    console.log(`   POST /api/spin          - Spin & Win\n`);
});
