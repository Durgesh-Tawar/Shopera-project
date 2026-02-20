// =========================================
// SOPERA - Main JavaScript (API Connected)
// =========================================

const productGrid = document.getElementById("productGrid");
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let products = [];
const searchBar = document.getElementById("searchBar");
const tabBtns = document.querySelectorAll(".tab-btn");

// API Base URL
const API_URL = 'http://localhost:3000/api';

// Update cart and wishlist badges on page load
updateCartBadge();
updateWishlistBadge();

// Check wishlist reminder (7 days)
checkWishlistReminder();

// =========================================
// FETCH PRODUCTS FROM API OR USE LOCAL DATA
// =========================================

async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('API not available');
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.log('Using local data (API not available)');
        // Use local products from data.js
        if (typeof window.products !== 'undefined' && window.products.length > 0) {
            products = window.products;
            renderProducts();
        } else if (typeof products !== 'undefined' && products.length > 0) {
            renderProducts();
        } else {
            productGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: #888;">No products available</p>';
        }
    }
}

// =========================================
// WISHLIST REMINDER POPUP
// =========================================

function checkWishlistReminder() {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    
    if (wishlist.length === 0) return;
    
    let lastViewTime = localStorage.getItem('wishlist_last_view');
    let currentTime = Date.now();
    
    if (!lastViewTime) {
        localStorage.setItem('wishlist_last_view', currentTime);
        return;
    }
    
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const daysPassed = (currentTime - parseInt(lastViewTime)) / (1000 * 60 * 60 * 24);
    
    let reminderDismissed = localStorage.getItem('wishlist_reminder_dismissed');
    let reminderDismissTime = reminderDismissed ? parseInt(reminderDismissed) : 0;
    
    if (daysPassed >= 7 && (currentTime - reminderDismissTime) > 24 * 60 * 60 * 1000) {
        showWishlistReminder(wishlist.length);
    }
}

function showWishlistReminder(itemCount) {
    const popup = document.createElement('div');
    popup.id = 'wishlistReminder';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
        padding: 30px;
        border-radius: 20px;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        max-width: 350px;
        width: 90%;
        animation: slideUp 0.4s ease;
    `;
    
    popup.innerHTML = `
        <div style="font-size: 60px; margin-bottom: 15px;">💝</div>
        <h3 style="color: #1a1a2e; margin-bottom: 10px;">Missing Your Wishlist! ❤️</h3>
        <p style="color: #666; margin-bottom: 20px; line-height: 1.5;">
            You have <strong>${itemCount} item${itemCount > 1 ? 's' : ''}</strong> in your wishlist waiting for you!
        </p>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button onclick="goToWishlist()" style="flex: 1; padding: 12px 20px; background: linear-gradient(45deg, #ff3f6c, #ff6b9d); color: white; border: none; border-radius: 25px; font-weight: 600; cursor: pointer;">View Wishlist</button>
            <button onclick="dismissWishlistReminder()" style="padding: 12px 20px; background: #f0f0f5; color: #666; border: none; border-radius: 25px; font-weight: 600; cursor: pointer;">Later</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    const overlay = document.createElement('div');
    overlay.id = 'wishlistReminderOverlay';
    overlay.style.cssText = `position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999;`;
    document.body.appendChild(overlay);
}

function goToWishlist() {
    removeWishlistReminder();
    window.location.href = 'wishlist.html';
}

function dismissWishlistReminder() {
    localStorage.setItem('wishlist_reminder_dismissed', Date.now().toString());
    removeWishlistReminder();
}

function removeWishlistReminder() {
    const popup = document.getElementById('wishlistReminder');
    const overlay = document.getElementById('wishlistReminderOverlay');
    if (popup) popup.remove();
    if (overlay) overlay.remove();
}

if (window.location.pathname.includes('wishlist.html')) {
    localStorage.setItem('wishlist_last_view', Date.now().toString());
}

// =========================================
// PRODUCT RENDERING
// =========================================

function renderProducts(filter = "all", search = "") {
    if (!productGrid) return;
    
    productGrid.innerHTML = "";
    
    let filtered = products.filter(p => {
        let catMatch = (filter === "all") ? true : p.category === filter;
        let searchMatch = p.name.toLowerCase().includes(search.toLowerCase());
        return catMatch && searchMatch;
    });

    if (filtered.length === 0) {
        productGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: #888;">No products found</p>';
        return;
    }

    filtered.forEach((p, index) => {
        const div = document.createElement("div");
        div.classList.add("product-card");
        div.style.animationDelay = `${index * 0.05}s`;
        
        const inWishlist = wishlist.some(w => w.id === p.id);
        const wishlistBtn = inWishlist ? '❤️' : '🤍';
        const wishlistClass = inWishlist ? 'active' : '';
        
        // Generate rating stars
        const rating = p.rating || 4;
        const ratingCount = p.ratingCount || Math.floor(Math.random() * 100) + 10;
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsHTML += i <= rating ? '<span class="star">★</span>' : '<span class="star empty">★</span>';
        }
        
        // Generate badges
        let badgesHTML = '';
        if (p.category === "men") badgesHTML += `<span class="product-badge">Men's</span>`;
        else if (p.category === "women") badgesHTML += `<span class="product-badge">Women's</span>`;
        else if (p.category === "kids") badgesHTML += `<span class="product-badge">Kids</span>`;
        
        if (p.discount && p.discount > 0) {
            badgesHTML += `<span class="discount-badge">-${p.discount}%</span>`;
        }
        
        if (p.isNew) {
            badgesHTML = `<span class="new-badge">New</span>` + badgesHTML;
        }
        
        // Color swatches
        let colorSwatchesHTML = '';
        if (p.colors && p.colors.length > 0) {
            colorSwatchesHTML = `<div class="color-swatches">`;
            p.colors.forEach((color, i) => {
                colorSwatchesHTML += `<div class="color-swatch ${i === 0 ? 'active' : ''}" style="background-color: ${color}" title="${color}"></div>`;
            });
            colorSwatchesHTML += `</div>`;
        }
        
        // Price
        let priceHTML = `<span class="price">₹${p.price.toLocaleString()}</span>`;
        if (p.originalPrice && p.originalPrice > p.price) {
            priceHTML = `<div class="price-section"><span class="price">₹${p.price.toLocaleString()}</span><span class="original-price">₹${p.originalPrice.toLocaleString()}</span></div>`;
        }
        
        div.innerHTML = `
            <div class="product-image">
                ${badgesHTML}
                <button class="wishlist-btn ${wishlistClass}" onclick="toggleWishlist(event, ${p.id})" title="Add to Wishlist">${wishlistBtn}</button>
                <button class="quick-view-btn" onclick="viewProduct(${p.id})">Quick View 👁</button>
                <img src="${p.image}" alt="${p.name}" onclick="viewProduct(${p.id})">
            </div>
            <div class="product-info">
                <h3 onclick="viewProduct(${p.id})" style="cursor:pointer">${p.name}</h3>
                <div class="product-rating">${starsHTML}<span class="rating-count">(${ratingCount})</span></div>
                ${colorSwatchesHTML}
                ${priceHTML}
                <div class="product-actions">
                    <button class="add-btn" onclick="addToCart(${p.id})">Add to Cart</button>
                    <button class="buy-now-btn" onclick="buyNow(${p.id})">Buy Now ⚡</button>
                </div>
            </div>
        `;
        productGrid.appendChild(div);
    });
}

// =========================================
// CART FUNCTIONS
// =========================================

function viewProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        cart.push(product);
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartBadge();
        showToast(`${product.name} added to cart!`);
    }
}

// Buy Now - Add to cart and redirect to cart page
function buyNow(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        cart.push(product);
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartBadge();
        showToast(`Redirecting to checkout...`);
        // Redirect to cart page after a brief delay
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 500);
    }
}

// Toggle wishlist
function toggleWishlist(event, id) {
    event.stopPropagation();
    const product = products.find(p => p.id === id);
    
    if (!product) return;
    
    const index = wishlist.findIndex(w => w.id === id);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast(`${product.name} removed from wishlist`);
    } else {
        wishlist.push(product);
        showToast(`${product.name} added to wishlist ❤️`);
    }
    
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    updateWishlistBadge();
    renderProducts();
}

function updateCartBadge() {
    const existingBadge = document.querySelector('.cart-badge');
    if (existingBadge) existingBadge.remove();
    
    if (cart.length > 0) {
        const cartLink = document.querySelector('a[href="cart.html"]');
        if (cartLink) {
            const badge = document.createElement("span");
            badge.className = "cart-badge";
            badge.textContent = cart.length;
            cartLink.appendChild(badge);
        }
    }
}

function updateWishlistBadge() {
    const existingBadge = document.querySelector('.wishlist-badge');
    if (existingBadge) existingBadge.remove();
    
    if (wishlist.length > 0) {
        const wishlistLink = document.querySelector('a[href="wishlist.html"]');
        if (wishlistLink) {
            const badge = document.createElement("span");
            badge.className = "wishlist-badge cart-badge";
            badge.textContent = wishlist.length;
            wishlistLink.appendChild(badge);
        }
    }
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(45deg, #ff3f6c, #ff6b9d);
        color: white;
        padding: 15px 30px;
        border-radius: 30px;
        font-weight: 600;
        z-index: 9999;
        animation: slideUp 0.3s ease;
        box-shadow: 0 10px 30px rgba(255, 63, 108, 0.4);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = "slideDown 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

const style = document.createElement("style");
style.textContent = `
    @keyframes slideUp { from { transform: translateX(-50%) translateY(100px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
    @keyframes slideDown { from { transform: translateX(-50%) translateY(0); opacity: 1; } to { transform: translateX(-50%) translateY(100px); opacity: 0; } }
    
    .product-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
    
    .add-btn, .buy-now-btn {
        flex: 1;
        padding: 12px 15px;
        border: none;
        border-radius: 25px;
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .add-btn {
        background: #2d3436;
        color: white;
    }
    
    .add-btn:hover {
        background: #ff3f6c;
    }
    
    .buy-now-btn {
        background: linear-gradient(45deg, #ff3f6c, #ff6b9d);
        color: white;
        box-shadow: 0 5px 15px rgba(255, 63, 108, 0.4);
    }
    
    .buy-now-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 20px rgba(255, 63, 108, 0.5);
    }
`;
document.head.appendChild(style);

// =========================================
// CATEGORY TABS
// =========================================

tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderProducts(btn.dataset.category, searchBar ? searchBar.value : "");
    });
});

// =========================================
// CATEGORY FILTER FUNCTION - Called from category cards
// =========================================

function filterCategory(category) {
    // Update tab buttons
    tabBtns.forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
    
    // Scroll to products section
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    
    // Render filtered products
    renderProducts(category, searchBar ? searchBar.value : "");
}

// =========================================
// SEARCH
// =========================================

if (searchBar) {
    searchBar.addEventListener("input", () => {
        let activeCat = document.querySelector(".tab-btn.active").dataset.category;
        renderProducts(activeCat, searchBar.value);
    });
}

// =========================================
// HERO SLIDER
// =========================================

let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('sliderDots');
let slideInterval;

if (slides.length > 0) {
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        if (dotsContainer) dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function goToSlide(index) {
        showSlide(index);
        resetTimer();
    }

    function moveSlide(direction) {
        let newIndex = currentSlide + direction;
        if (newIndex >= slides.length) newIndex = 0;
        if (newIndex < 0) newIndex = slides.length - 1;
        showSlide(newIndex);
        resetTimer();
    }

    function resetTimer() {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => moveSlide(1), 5000);
    }

    slideInterval = setInterval(() => moveSlide(1), 5000);

    const slider = document.getElementById('heroSlider');
    if (slider) {
        slider.addEventListener('mouseenter', () => clearInterval(slideInterval));
        slider.addEventListener('mouseleave', () => { slideInterval = setInterval(() => moveSlide(1), 5000); });
    }
}

// =========================================
// 3D CARD HOVER EFFECT
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
});

// =========================================
// INITIAL RENDER
// =========================================

if (typeof products !== 'undefined' && products.length > 0) {
    renderProducts();
} else {
    fetchProducts();
}
