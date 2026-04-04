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
const API_URL = `${CONFIG.API_BASE_URL}/api`;

// =========================================
// SEARCH ALIASES & MAPPING CONFIGURATION
// =========================================

// Smart section navigation keywords
const sectionKeywords = {
    'men': ['men', 'man', 'male', 'boys', 'gentleman', 'gentlemen'],
    'women': ['women', 'woman', 'female', 'girls', 'ladies', 'lady'],
    'kids': ['kids', 'kid', 'child', 'children', 'baby', 'infant', 'little'],
    'shirts': ['shirt', 'shirts', 'tshirt', 't-shirt', 't shirt', 'tee', 'tees', 'polo', 'formal shirt', 'casual shirt'],
    'dresses': ['dress', 'dresses', 'gown', 'gowns', 'frock', 'frocks', 'maxi', ' Midi'],
    'jeans': ['jeans', 'jean', 'pants', 'trousers', 'denim', 'joggers', 'leggings'],
    'jackets': ['jacket', 'jackets', 'coat', 'coats', 'blazer', 'blazers', 'sweater', 'sweaters', 'hoodie'],
    'sarees': ['saree', 'sari', 'sarees', 'saris', 'lehenga', 'lehengas'],
    'tops': ['top', 'tops', 'blouse', 'blouses', 'crop top', 'tunic', 'tunics'],
    'shorts': ['shorts', 'short', 'skirt', 'skirts'],
    'party': ['party', 'party wear', 'partywear', 'celebration', 'festive', 'wedding', 'function'],
    'formal': ['formal', 'office', 'professional', 'business', 'workwear', 'corporate'],
    'casual': ['casual', 'everyday', 'daily', 'relaxed', 'weekend']
};

// Category to section mapping
const categorySections = {
    'men': 'men',
    'women': 'women', 
    'kids': 'kids'
};

// All aliases flat array for matching
const allAliases = [];
Object.keys(sectionKeywords).forEach(key => {
    sectionKeywords[key].forEach(alias => {
        allAliases.push({ alias: alias, target: key });
    });
});

// =========================================
// DEBOUNCE FUNCTION
// =========================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update cart and wishlist badges on page load
updateCartBadge();
updateWishlistBadge();

// Check wishlist reminder (7 days)
checkWishlistReminder();

// Initialize products and search
fetchProducts();
initializeSearch();
showAdminLink();

// Initialize voice search if supported
if (typeof initializeVoiceSearch === 'function') {
    initializeVoiceSearch();
}

// =========================================
// ENHANCED SEARCH FUNCTIONALITY
// =========================================

// Create search container and dropdown
function initializeSearch() {
    if (!searchBar) return;
    
    // Use the existing parent container
    const navSearch = searchBar.parentElement;
    navSearch.classList.add('search-container');
    
    // Create dropdown container
    const dropdown = document.createElement('div');
    dropdown.className = 'search-results-dropdown';
    dropdown.id = 'searchResultsDropdown';
    navSearch.appendChild(dropdown);
    
    // Debounced live search
    const debouncedLiveSearch = debounce((query) => {
        performSearch(query, true);
    }, 300);
    
    // Search on Enter key - Smart Navigation
    searchBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchBar.value.trim();
            if (query) {
                handleSmartSearch(query);
            }
        }
    });
    
    // Allow the left search icon to also trigger search
    const leftSearchIcon = navSearch.querySelector('.search-icon');
    if (leftSearchIcon) {
        leftSearchIcon.style.cursor = 'pointer';
        leftSearchIcon.style.pointerEvents = 'auto'; // allow click
        leftSearchIcon.addEventListener('click', (e) => {
            e.preventDefault();
            const query = searchBar.value.trim();
            if (query) {
                handleSmartSearch(query);
            }
        });
    }
    
    // Live search with debounce
    searchBar.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
            debouncedLiveSearch(query);
        } else if (query.length === 0) {
            hideSearchDropdown();
        }
    });
    
    // Handle focus
    searchBar.addEventListener('focus', () => {
        if (searchBar.value.trim().length >= 2) {
            const dropdown = document.getElementById('searchResultsDropdown');
            if (dropdown && dropdown.children.length > 0) {
                dropdown.classList.add('active');
            }
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!navSearch.contains(e.target)) {
            hideSearchDropdown();
        }
    });
}

// =========================================
// SMART SEARCH & NAVIGATION LOGIC
// =========================================

// Handle smart search - determines where to redirect
// Subcategory keywords mapping for smart search
const subcategoryKeywords = {
    't-shirts': ['tshirt', 't-shirt', 't shirt', 'tee', 'tees'],
    'casual-shirts': ['casual shirt'],
    'formal-shirts': ['formal shirt'],
    'sweaters': ['sweater', 'pullover', 'winter wear'],
    'jackets': ['jacket', 'coat', 'blazer', 'hoodie'],
    'kurtas': ['kurta', 'kurta set'],
    'sherwanis': ['sherwani'],
    'nehru-jackets': ['nehru jacket'],
    'jeans': ['jeans', 'jean', 'denim'],
    'casual-trousers': ['casual trouser', 'chinos', 'jogger'],
    'formal-trousers': ['formal trouser', 'pant', 'trousers'],
    'shorts': ['short', 'shorts'],
    'briefs': ['brief', 'trunk', 'underwear'],
    'boxers': ['boxer'],
    'sleepwear': ['sleepwear', 'loungewear', 'pajama'],
    'dresses': ['dress', 'frock', 'maxi'],
    'tops': ['top', 'blouse', 'crop top', 'tunic'],
    'skirts': ['skirt'],
    'sarees': ['saree', 'sari', 'lehenga'],
    'suits': ['suit', 'salwar'],
    'gowns': ['gown'],
    'ethnic': ['ethnic', 'traditional', 'festive'],
    'sets': ['set', 'outfit', 'clothing set']
};

function handleSmartSearch(query) {
    const searchTerm = query.toLowerCase().trim();
    
    // Step 1: Check for exact product match
    const productMatch = products.find(p => p.name.toLowerCase() === searchTerm);
    if (productMatch) {
        redirectToProduct(productMatch);
        return;
    }
    
    // Step 2: Try to extract category AND subcategory from query
    let foundCategory = null;
    let foundSubcategory = null;
    
    const categories = ['men', 'women', 'kids'];
    for (const cat of categories) {
        const aliases = sectionKeywords[cat] || [];
        // Use regex word boundary
        if (aliases.some(alias => new RegExp(`\\b${alias}\\b`).test(searchTerm))) {
            foundCategory = cat;
            break;
        }
    }
    
    for (const [subcat, aliases] of Object.entries(subcategoryKeywords)) {
        if (aliases.some(alias => searchTerm.includes(alias))) {
            foundSubcategory = subcat;
            break;
        }
    }
    
    if (!foundSubcategory) {
        const fallbackSection = findSectionMatch(searchTerm);
        if (fallbackSection) foundSubcategory = fallbackSection;
    }

    // Redirect logic
    if (foundCategory && foundSubcategory) {
        window.location.href = `index.html?category=${foundCategory}&subcategory=${foundSubcategory}`;
        return;
    } else if (foundCategory && !foundSubcategory) {
        window.location.href = `index.html?category=${foundCategory}`;
        return;
    } else if (!foundCategory && foundSubcategory) {
        // Find implicit category from product data
        const sampleProduct = products.find(p => p.subcategory === foundSubcategory);
        if (sampleProduct) {
            window.location.href = `index.html?category=${sampleProduct.category}&subcategory=${foundSubcategory}`;
        } else {
            window.location.href = `index.html?subcategory=${foundSubcategory}`;
        }
        return;
    }
    
    // Step 3: Partial product match
    const partialProductMatch = findProductMatch(searchTerm);
    if (partialProductMatch) {
        redirectToProduct(partialProductMatch);
        return;
    }
    
    // Step 4: No matches found
    // Instead of redirecting to a blank search page, we show the "Product not found" dropdown directly
    performSearch(searchTerm, false);
}

// Find section match (fallback)
function findSectionMatch(searchTerm) {
    for (const [section, aliases] of Object.entries(sectionKeywords)) {
        if (['men', 'women', 'kids'].includes(section)) continue;
        for (const alias of aliases) {
            if (searchTerm === alias || searchTerm.includes(alias)) {
                return section;
            }
        }
    }
    return null;
}

// Find specific product by name
function findProductMatch(searchTerm) {
    return products.find(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        searchTerm.includes(product.name.toLowerCase())
    );
}

// =========================================
// REDIRECTION FUNCTIONS
// =========================================

// Redirect to category page
function redirectToCategory(category) {
    window.location.href = `index.html?category=${category}`;
}

// Redirect to section page
function redirectToSection(section) {
    window.location.href = `index.html?section=${section}`;
}

// Redirect to specific product
function redirectToProduct(product) {
    window.location.href = `product.html?id=${product.id}`;
}

// Redirect to search results page
function redirectToSearchPage(searchTerm) {
    window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}`;
}

// =========================================
// URL PARAMETER HANDLING
// =========================================

// Handle URL parameters on page load
function handleURLParams() {
    const params = new URLSearchParams(window.location.search);
    const homeContent = document.getElementById('homeContent');
    const heroSlider = document.getElementById('heroSlider');
    const productsSection = document.getElementById('products');

    // Default: Show home content if no params except maybe 'welcome'
    let isHome = !params.has('category') && !params.has('subcategory') && !params.has('section') && !params.has('search') && !params.has('q');
    
    if (homeContent) {
        homeContent.style.display = isHome ? 'block' : 'none';
    }
    
    if (heroSlider) {
        heroSlider.style.display = isHome ? 'block' : 'none';
    }
    
    if (productsSection) {
        productsSection.style.display = isHome ? 'none' : 'block';
    }

    // Handle category parameter
    if (params.has('category')) {
        const category = params.get('category');
        const subcategory = params.get('subcategory') || "";
        filterByCategoryFromURL(category, subcategory);
    }
    
    // Handle section parameter
    if (params.has('section')) {
        const section = params.get('section');
        filterBySectionFromURL(section);
    }
    
    // Handle search parameter (for search page or homepage direct search)
    if (params.has('search')) {
        const searchQuery = params.get('search');
        
        // Update product title to show search results
        const productsTitle = document.querySelector('.products h2');
        if (productsTitle) {
            productsTitle.textContent = `Search Results for "${searchQuery}"`;
        }
        
        // Scroll to products section
        const productsSection = document.getElementById('products');
        if (productsSection) {
            productsSection.style.display = 'block';
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        renderProducts('all', searchQuery, '');
    }
}

// Filter by category from URL
function filterByCategoryFromURL(category, subcategory = "") {
    // Update tab buttons
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });

    // Update the title if subcategory exists
    const productsTitle = document.querySelector('.products h2');
    if (productsTitle && subcategory) {
        const formattedSub = subcategory.replace(/-/g, ' ').toUpperCase();
        productsTitle.textContent = `${formattedSub} FOR ${category.toUpperCase()}`;
    } else if (productsTitle) {
        productsTitle.textContent = "Trending Products";
    }
    
    // Scroll to products section
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Render filtered products
    renderProducts(category, "", subcategory);
}

// Filter by section from URL (filters by mood)
function filterBySectionFromURL(section) {
    // Map section to mood
    const sectionToMood = {
        'shirts': 'all',
        'dresses': 'party',
        'jeans': 'casual',
        'jackets': 'casual',
        'sarees': 'formal',
        'tops': 'party',
        'shorts': 'casual',
        'party': 'party',
        'formal': 'formal',
        'casual': 'casual'
    };
    
    const mood = sectionToMood[section] || 'all';
    
    // Determine category based on section
    let category = 'all';
    if (['party', 'formal', 'casual'].includes(section)) {
        // For mood-based sections, show all categories
        category = 'all';
    }
    
    // Update tab to show "all" but filter by mood
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === 'all') {
            btn.classList.add('active');
        }
    });
    
    // Render products filtered by mood
    renderProductsFilteredByMood(category, mood);
}

// Render products filtered by mood
function renderProductsFilteredByMood(filter, mood) {
    if (!productGrid) return;
    
    productGrid.innerHTML = "";
    
    let filtered = products.filter(p => {
        let catMatch = (filter === "all") ? true : p.category === filter;
        let moodMatch = mood === 'all' ? true : p.mood === mood;
        return catMatch && moodMatch;
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
// ORIGINAL SEARCH FUNCTIONS (Live Search Dropdown)
// =========================================

// Perform search with enhanced matching (for live dropdown)
function performSearch(query, isLive = false) {
    const dropdown = document.getElementById('searchResultsDropdown');
    if (!dropdown || !products.length) return;
    
    const searchTerm = query.toLowerCase().trim();
    if (searchTerm.length === 0) {
        hideSearchDropdown();
        // Reset to show all products in current category
        let activeCat = document.querySelector(".tab-btn.active")?.dataset.category || "all";
        renderProducts(activeCat, "");
        return;
    }
    
    // Enhanced search - matches name, category, subcategory, and mood (tags)
    const filtered = products.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const categoryMatch = product.category.toLowerCase().includes(searchTerm);
        const subcatMatch = product.subcategory && product.subcategory.toLowerCase().includes(searchTerm);
        const moodMatch = product.mood && product.mood.toLowerCase().includes(searchTerm);
        
        return nameMatch || categoryMatch || subcatMatch || moodMatch;
    });
    
    // Show results
    if (filtered.length > 0) {
        showSearchResults(filtered, searchTerm, isLive);
    } else {
        if (isLive) {
            hideSearchDropdown();
        } else {
            showNoResults(searchTerm);
        }
    }
}

// Show search results in dropdown
function showSearchResults(results, searchTerm, isLive) {
    const dropdown = document.getElementById('searchResultsDropdown');
    if (!dropdown) return;
    
    const maxResults = isLive ? 6 : results.length;
    const displayResults = results.slice(0, maxResults);
    
    let html = `
        <div class="search-results-header">
            <span>Search Results</span>
            <span class="search-results-count">${results.length} product${results.length !== 1 ? 's' : ''} found</span>
        </div>
    `;
    
    displayResults.forEach(product => {
        const categoryLabel = product.category.charAt(0).toUpperCase() + product.category.slice(1);
        const moodLabel = product.mood ? product.mood.charAt(0).toUpperCase() + product.mood.slice(1) : '';
        
        html += `
            <div class="search-result-item" onclick="viewProduct(${product.id})">
                <img src="${product.image}" alt="${product.name}" class="search-result-image" onerror="this.src='images/men/t-shirt/t-shirt1.jpg'">
                <div class="search-result-info">
                    <div class="search-result-name">${highlightMatch(product.name, searchTerm)}</div>
                    <div class="search-result-category">
                        <span>${categoryLabel}</span>
                        ${moodLabel ? `<span>${moodLabel}</span>` : ''}
                    </div>
                </div>
                <div class="search-result-price">₹${product.price.toLocaleString()}</div>
                <button class="search-result-add-btn" onclick="event.stopPropagation(); addToCartFromSearch(${product.id})">Add to Cart</button>
            </div>
        `;
    });
    
    // Add "View All" button if there are more results
    if (results.length > maxResults) {
        html += `
            <div class="search-view-all" onclick="viewAllSearchResults('${searchTerm}')">
                View All ${results.length} Results →
            </div>
        `;
    }
    
    dropdown.innerHTML = html;
    dropdown.classList.add('active');
}

// Show "No results" message
function showNoResults(searchTerm) {
    const dropdown = document.getElementById('searchResultsDropdown');
    if (!dropdown) return;
    
    const suggestions = getSearchSuggestions(searchTerm);
    
    dropdown.innerHTML = `
        <div class="search-no-results">
            <span class="search-no-results-icon">🔍</span>
            <h3>No products found</h3>
            <p>Please try a different keyword or browse our categories.</p>
            <div class="search-suggestions">
                <p>Popular searches:</p>
                <div class="search-suggestion-tags">
                    ${suggestions.map(tag => `<button class="search-suggestion-tag" onclick="useSuggestion('${tag}')">${tag}</button>`).join('')}
                </div>
            </div>
        </div>
    `;
    dropdown.classList.add('active');
}

// Highlight matching text
function highlightMatch(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<strong style="color: var(--primary);">$1</strong>');
}

// Get search suggestions based on current query
function getSearchSuggestions(currentQuery) {
    const allSuggestions = ['shirt', 'dress', 'jeans', 'jacket', 'party', 'casual', 'formal', 'men', 'women', 'kids', 'saree', 'blazer'];
    return allSuggestions.filter(s => s.toLowerCase() !== currentQuery.toLowerCase()).slice(0, 5);
}

// Use a suggestion tag
function useSuggestion(tag) {
    searchBar.value = tag;
    performSearch(tag, true);
}

// Hide search dropdown
function hideSearchDropdown() {
    const dropdown = document.getElementById('searchResultsDropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}

// View all search results - filter products on page
function viewAllSearchResults(searchTerm) {
    hideSearchDropdown();
    
    // Reset to All category when viewing all results
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === 'all') {
            btn.classList.add('active');
        }
    });
    
    // Render all matching products
    renderProducts('all', searchTerm);
    
    // Scroll to products section
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add to cart from search results
function addToCartFromSearch(productId) {
    addToCart(productId);
}

// =========================================
// FETCH PRODUCTS FROM API OR USE LOCAL DATA
// =========================================

async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('API not available');
        products = await response.json();
        handleURLParams(); // Use URL params for initial render
    } catch (error) {
        console.log('Using local data (API not available)');
        // Use local products from data.js
        if (typeof window.products !== 'undefined' && window.products.length > 0) {
            products = window.products;
            handleURLParams(); // Use URL params for initial render
        } else if (typeof products !== 'undefined' && products.length > 0) {
            handleURLParams(); // Use URL params for initial render
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

function renderProducts(filter = "all", search = "", subcategory = "") {
    if (!productGrid) return;
    
    productGrid.innerHTML = "";
    
    let filtered = products.filter(p => {
        let catMatch = (filter === "all") ? true : p.category === filter;
        let searchMatch = p.name.toLowerCase().includes(search.toLowerCase());
        let subcatMatch = true;
        if (subcategory) {
            subcatMatch = p.subcategory === subcategory;
        }
        
        // Hide exclusive Nike fitness collection from regular browsing
        let isFitness = p.name.toLowerCase().includes('nike');
        if (isFitness && !search.toLowerCase().includes('nike')) {
            return false;
        }

        return catMatch && searchMatch && subcatMatch;
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
        let badgesInner = '';
        
        if (p.isNew) {
            badgesInner = `<span class="new-badge">New</span>` + badgesInner;
        }
        
        let badgesHTML = badgesInner ? `<div class="badges-container">${badgesInner}</div>` : '';
        
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
        const discountPercent = parseInt(localStorage.getItem("discount")) || 0;
        const subtotal = product.price;
        const total = subtotal - (subtotal * discountPercent / 100);
        
        const orderData = {
            items: [{...product, quantity: 1}],
            total: total,
            loyalty: Math.floor(total / 100),
            subtotal: subtotal,
            discount: discountPercent,
            date: new Date().toISOString()
        };
        sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
        showToast(`Redirecting to checkout...`);
        setTimeout(() => window.location.href = 'checkout.html', 500);
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
        
        let subcategory = "";
        
        // Reset title
        const productsTitle = document.querySelector('.products h2');
        if (productsTitle) {
            productsTitle.textContent = "Trending Products";
        }
        
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
    
    // Reset title
    const productsTitle = document.querySelector('.products h2');
    if (productsTitle) {
        productsTitle.textContent = "Trending Products";
    }

    // Render filtered products
    renderProducts(category, searchBar ? searchBar.value : "");
}

// =========================================
// SEARCH
// =========================================

if (searchBar) {
    searchBar.addEventListener("input", () => {
        const activeBtn = document.querySelector(".tab-btn.active");
        const activeCat = activeBtn ? activeBtn.dataset.category : "all";
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

// Initialize enhanced search after products are loaded
setTimeout(() => {
    initializeSearch();
    initializeVoiceSearch();
}, 100);

// =========================================
// VOICE SEARCH INITIALIZATION
// =========================================

function initializeVoiceSearch() {
    const micIcon = document.getElementById('micIcon');
    const searchBarElement = document.getElementById('searchBar');
    
    if (!micIcon || !searchBarElement) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        micIcon.style.display = 'none';
        console.warn('Speech Recognition not supported in this browser.');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Better for Indian context

    micIcon.addEventListener('click', (e) => {
        e.preventDefault();
        try {
            recognition.start();
            micIcon.classList.add('listening');
            searchBarElement.placeholder = "Listening...";
        } catch (error) {
            console.error('Speech recognition error', error);
        }
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim().replace(/\.$/, ''); // Remove trailing dot if added
        searchBarElement.value = transcript;
        micIcon.classList.remove('listening');
        searchBarElement.placeholder = "Search for products, brands and more";
        
        // Trigger search logic
        if (typeof handleSmartSearch === 'function') {
            handleSmartSearch(transcript);
        } else if (typeof performSearch === 'function') {
            performSearch(transcript, true);
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        micIcon.classList.remove('listening');
        searchBarElement.placeholder = "Search for products, brands and more";
    };

    recognition.onend = () => {
        micIcon.classList.remove('listening');
        searchBarElement.placeholder = "Search for products, brands and more";
    };
}

// =========================================
// ADMIN ACCESS CONTROL
// =========================================

function showAdminLink() {
    const userString = localStorage.getItem('user');
    if (!userString) return;

    try {
        const user = JSON.parse(userString);
        if (user.role === 'admin') {
            const navActions = document.querySelector('.nav-actions');
            if (navActions && !document.getElementById('adminLink')) {
                const adminA = document.createElement('a');
                adminA.href = 'admin.html';
                adminA.id = 'adminLink';
                adminA.className = 'action-btn';
                adminA.style.color = '#ff3f6c'; // Highlight admin link
                adminA.style.display = 'flex';
                adminA.style.flexDirection = 'column';
                adminA.style.alignItems = 'center';
                adminA.style.textDecoration = 'none';
                
                adminA.innerHTML = `
                    <span class="action-icon">🛠️</span>
                    <span class="action-text">Admin</span>
                `;
                // Insert before profile link
                navActions.insertBefore(adminA, navActions.firstChild);
            }
        }
    } catch (e) {
        console.error('Error checking admin role:', e);
    }
}

