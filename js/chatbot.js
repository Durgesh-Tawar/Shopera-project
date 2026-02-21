// =========================================
// SOPERA - AI Shopping Assistant Chatbot (API Connected)
// =========================================

// Note: API_URL is already declared in main.js

// Chatbot state
let chatOpen = false;
let chatProducts = []; // Products fetched from API

// Initialize chatbot
async function initChatbot() {
    console.log('Chatbot: Initializing...');
    createChatButton();
    createChatWindow();
    console.log('Chatbot: UI created');
    await loadProductsForChat();
    console.log('Chatbot: Products loaded, count:', chatProducts.length);
    
    // Add greeting after page loads
    setTimeout(() => {
        if (!localStorage.getItem('chat_greeted')) {
            addBotMessage("👋 Hi! I'm your fashion assistant. Tell me what you're looking for - like 'casual shirts for men' or 'party dresses' and I'll help you find the perfect outfit!");
            localStorage.setItem('chat_greeted', 'true');
        }
    }, 3000);
}

// Load products from API for chatbot
async function loadProductsForChat() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (response.ok) {
            chatProducts = await response.json();
        } else {
            throw new Error('API response not ok');
        }
    } catch (error) {
        console.log('API not available, using local product data');
        // Use local products from data.js as fallback
        if (typeof products !== 'undefined' && products.length > 0) {
            chatProducts = products;
        } else {
            // Fallback to hardcoded products if data.js not loaded
            chatProducts = getDefaultProducts();
        }
    }
}

// Default products as final fallback
function getDefaultProducts() {
    return [
        // Men - Formal
        {id:1, name:"Classic White Shirt", price:1299, image:"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500", category:"men", mood:"formal"},
        {id:2, name:"Navy Blazer", price:3499, image:"https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500", category:"men", mood:"formal"},
        {id:3, name:"Formal Trousers", price:1899, image:"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500", category:"men", mood:"formal"},
        // Men - Casual
        {id:7, name:"Slim Fit Jeans", price:1899, image:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=500", category:"men", mood:"casual"},
        {id:8, name:"Casual T-Shirt", price:599, image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", category:"men", mood:"casual"},
        // Men - Party
        {id:13, name:"Party Blazer", price:3999, image:"https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500", category:"men", mood:"party"},
        // Women - Party
        {id:16, name:"Floral Summer Dress", price:1599, image:"https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500", category:"women", mood:"party"},
        {id:18, name:"Sequin Party Dress", price:2999, image:"https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500", category:"women", mood:"party"},
        // Women - Casual
        {id:22, name:"High-Waist Jeans", price:1799, image:"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500", category:"women", mood:"casual"},
        // Women - Formal
        {id:28, name:"Elegant Silk Saree", price:3999, image:"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500", category:"women", mood:"formal"},
        // Kids - Party
        {id:34, name:"Kids Party Frock", price:1199, image:"https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500", category:"kids", mood:"party"},
        // Kids - Casual
        {id:38, name:"Kids Denim Set", price:999, image:"https://images.unsplash.com/photo-1519235106638-35e35556b40d?w=500", category:"kids", mood:"casual"},
        {id:39, name:"Cartoon T-Shirt", price:499, image:"https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500", category:"kids", mood:"casual"},
        // Kids - Formal
        {id:44, name:"Kids Formal Suit", price:1999, image:"https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500", category:"kids", mood:"formal"},
    ];
}

// Create chat button
function createChatButton() {
    const btn = document.createElement('div');
    btn.id = 'chatButton';
    btn.innerHTML = '💬';
    btn.onclick = toggleChat;
    btn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 60px;
        height: 60px;
        background: linear-gradient(45deg, #ff3f6c, #ff6b9d);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        cursor: pointer;
        box-shadow: 0 10px 30px rgba(255, 63, 108, 0.4);
        z-index: 9998;
        transition: all 0.3s;
        animation: pulse 2s infinite;
    `;
    document.body.appendChild(btn);
}

// Create chat window
function createChatWindow() {
    const chat = document.createElement('div');
    chat.id = 'chatWindow';
    chat.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        width: 380px;
        max-height: 500px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        z-index: 9999;
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease;
    `;
    
    chat.innerHTML = `
        <div style="background: linear-gradient(45deg, #ff3f6c, #ff6b9d); padding: 20px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 30px;">🛍️</span>
                    <div>
                        <h3 style="margin: 0; font-size: 1.1rem;">SOPERA Assistant</h3>
                        <small style="opacity: 0.8;">Online | Always here to help</small>
                    </div>
                </div>
                <button onclick="toggleChat()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">✕</button>
            </div>
        </div>
        <div id="chatMessages" style="flex: 1; padding: 20px; overflow-y: auto; max-height: 320px; background: #f8f9fa;">
        </div>
        <div style="padding: 15px; background: white; border-top: 1px solid #eee;">
            <div style="display: flex; gap: 10px;">
                <input type="text" id="chatInput" placeholder="What are you looking for?" 
                    style="flex: 1; padding: 12px 15px; border: 2px solid #eee; border-radius: 25px; outline: none; font-size: 14px;"
                    onkeypress="if(event.key === 'Enter') sendMessage()">
                <button onclick="sendMessage()" style="background: linear-gradient(45deg, #ff3f6c, #ff6b9d); border: none; color: white; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; font-size: 18px;">➤</button>
            </div>
            <div style="margin-top: 10px; display: flex; gap: 5px; flex-wrap: wrap;">
                <span style="font-size: 11px; color: #888; cursor: pointer; background: #eee; padding: 5px 10px; border-radius: 15px;" onclick="quickSearch('men')">Men</span>
                <span style="font-size: 11px; color: #888; cursor: pointer; background: #eee; padding: 5px 10px; border-radius: 15px;" onclick="quickSearch('women')">Women</span>
                <span style="font-size: 11px; color: #888; cursor: pointer; background: #eee; padding: 5px 10px; border-radius: 15px;" onclick="quickSearch('kids')">Kids</span>
                <span style="font-size: 11px; color: #888; cursor: pointer; background: #eee; padding: 5px 10px; border-radius: 15px;" onclick="quickSearch('casual')">Casual</span>
                <span style="font-size: 11px; color: #888; cursor: pointer; background: #eee; padding: 5px 10px; border-radius: 15px;" onclick="quickSearch('party')">Party</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(chat);
}

// Toggle chat window
function toggleChat() {
    const chat = document.getElementById('chatWindow');
    const btn = document.getElementById('chatButton');
    
    if (chatOpen) {
        chat.style.display = 'none';
        btn.style.bottom = '30px';
    } else {
        chat.style.display = 'flex';
        btn.style.bottom = '500px';
        document.getElementById('chatInput').focus();
    }
    chatOpen = !chatOpen;
}

// Send message
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        addUserMessage(message);
        input.value = '';
        
        setTimeout(() => {
            processMessage(message);
        }, 500);
    }
}

// Quick search from tags
function quickSearch(query) {
    addUserMessage(query);
    setTimeout(() => {
        processMessage(query);
    }, 500);
}

// Add user message to chat
function addUserMessage(message) {
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.style.cssText = `
        background: linear-gradient(45deg, #ff3f6c, #ff6b9d);
        color: white;
        padding: 12px 16px;
        border-radius: 18px 18px 4px 18px;
        margin-bottom: 10px;
        max-width: 80%;
        align-self: flex-end;
        margin-left: auto;
        font-size: 14px;
    `;
    msg.textContent = message;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

// Add bot message to chat
function addBotMessage(message) {
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.style.cssText = `
        background: white;
        color: #333;
        padding: 12px 16px;
        border-radius: 18px 18px 18px 4px;
        margin-bottom: 10px;
        max-width: 85%;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    `;
    msg.innerHTML = message;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

// Process user message and find products
function processMessage(query) {
    query = query.toLowerCase();
    
    // Define keywords mapping
    const keywords = {
        'men': ['men', 'male', 'man', 'boy', 'gentleman', 'shirt', 'jeans', 'pants', 'blazer', 'belt', 't-shirt'],
        'women': ['women', 'female', 'woman', 'girl', 'lady', 'dress', 'saree', 'top', 'handbag', 'jeans'],
        'kids': ['kids', 'child', 'children', 'baby', 'infant', 'young'],
        'casual': ['casual', 'everyday', 'relaxed', 'simple', 'comfy', 'comfortable'],
        'party': ['party', 'festive', 'celebration', 'wedding', 'event', 'dance'],
        'formal': ['formal', 'office', 'professional', 'business', 'meeting'],
        'shirt': ['shirt', 'blouse', 'top'],
        'dress': ['dress', 'gown', 'frock'],
        'jeans': ['jeans', 'pant', 'pants', 'trouser'],
        'saree': ['saree', 'sari'],
        'shoes': ['shoes', 'shoe', 'sneakers', 'footwear'],
        'jacket': ['jacket', 'coat', 'hoodie']
    };
    
    // Find matching categories and moods
    let matchedCategories = [];
    let matchedMoods = [];
    
    for (const [category, words] of Object.entries(keywords)) {
        for (const word of words) {
            if (query.includes(word)) {
                if (['men', 'women', 'kids'].includes(category)) {
                    if (!matchedCategories.includes(category)) {
                        matchedCategories.push(category);
                    }
                } else {
                    if (!matchedMoods.includes(category)) {
                        matchedMoods.push(category);
                    }
                }
            }
        }
    }
    
    // Default to all if no matches
    if (matchedCategories.length === 0) {
        matchedCategories = ['men', 'women', 'kids'];
    }
    
    // Filter products from API data
    let filteredProducts = chatProducts.filter(p => {
        const catMatch = matchedCategories.length === 0 || matchedCategories.includes(p.category);
        const moodMatch = matchedMoods.length === 0 || matchedMoods.some(mood => p.mood === mood);
        return catMatch && moodMatch;
    });
    
    // If still no products, show all
    if (filteredProducts.length === 0) {
        filteredProducts = chatProducts.slice(0, 6);
    }
    
    showProductResults(filteredProducts);
}

// Show product results in chat
function showProductResults(products) {
    if (products.length === 0) {
        addBotMessage("😕 Sorry, I couldn't find any products matching your request. Try browsing our categories!");
        return;
    }
    
    let message = `<strong>Found ${products.length} products for you:</strong><br><br>`;
    
    products.slice(0, 4).forEach((p, index) => {
        message += `
            <div style="display: flex; gap: 10px; margin-bottom: 12px; padding: 10px; background: white; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <img src="${p.image}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 13px;">${p.name}</div>
                    <div style="color: #ff3f6c; font-weight: 700;">₹${p.price.toLocaleString()}</div>
                </div>
                <button onclick="addToCartFromChat(${p.id})" style="background: linear-gradient(45deg, #ff3f6c, #ff6b9d); border: none; color: white; padding: 6px 12px; border-radius: 15px; cursor: pointer; font-size: 12px;">Add 🛒</button>
            </div>
        `;
    });
    
    if (products.length > 4) {
        message += `<br><a href="index.html" style="color: #ff3f6c; font-weight: 600;">View all ${products.length} products →</a>`;
    }
    
    addBotMessage(message);
}

// Add to cart from chat
function addToCartFromChat(id) {
    const product = chatProducts.find(p => p.id === id);
    if (product) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.push(product);
        localStorage.setItem("cart", JSON.stringify(cart));
        
        // Update badge
        const cartLink = document.querySelector('a[href="cart.html"]');
        if (cartLink) {
            const existingBadge = document.querySelector('.cart-badge');
            if (existingBadge) {
                existingBadge.textContent = cart.length;
            } else {
                const badge = document.createElement("span");
                badge.className = "cart-badge";
                badge.textContent = cart.length;
                cartLink.appendChild(badge);
            }
        }
        
        addBotMessage(`✅ <strong>${product.name}</strong> added to your cart! <a href="cart.html" style="color: #ff3f6c;">View Cart</a>`);
    }
}

// Add pulse animation
const chatStyle = document.createElement('style');
chatStyle.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(chatStyle);

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
} else {
    initChatbot();
}
