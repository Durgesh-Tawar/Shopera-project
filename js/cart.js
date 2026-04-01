 // =========================================
// SOPERA - Cart JavaScript (API Connected)
// =========================================

const API_URL = `${CONFIG.API_BASE_URL}/api`;

let cartItems = document.getElementById("cartItems");
let subtotalEl = document.getElementById("subtotal");
let discountText = document.getElementById("discountText");
let finalTotal = document.getElementById("finalTotal");
let loyaltyPointsEl = document.getElementById("loyaltyPoints");
let placeOrderBtn = document.getElementById("placeOrderBtn");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let discount = parseInt(localStorage.getItem("discount")) || 0;
let subtotal = cart.reduce((sum, p) => sum + p.price, 0);
let total = subtotal - (subtotal * discount / 100);
let loyalty = Math.floor(total / 100);

// Render cart items
if (cart.length === 0) {
    cartItems.innerHTML = `
        <div class="empty-cart">
            <p>Your cart is empty</p>
            <a href="index.html"><button>Start Shopping</button></a>
        </div>
    `;
    if (placeOrderBtn) placeOrderBtn.style.display = "none";
} else {
    if (placeOrderBtn) placeOrderBtn.style.display = "block";
    cart.forEach((p, index) => {
        let div = document.createElement("div");
        div.classList.add("cart-item");
        let sizeDisplay = p.selectedSize ? `<span class="cart-size">Size: ${p.selectedSize}</span>` : '';
        div.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <div class="cart-item-info">
                <h3>${p.name}</h3>
                <p>₹${p.price.toLocaleString()}</p>
                ${sizeDisplay}
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" onclick="removeFromCart(${index})">−</button>
                <span>1</span>
                <button class="qty-btn" onclick="addToCartAgain(${p.id})">+</button>
            </div>
        `;
        cartItems.appendChild(div);
    });
}

if (subtotalEl) subtotalEl.innerText = subtotal.toLocaleString();
if (discountText) discountText.innerText = discount + "%";
if (finalTotal) finalTotal.innerText = total.toLocaleString();
if (loyaltyPointsEl) loyaltyPointsEl.innerText = loyalty;

// Remove from cart function
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    location.reload();
}

// Add same item again
function addToCartAgain(id) {
    const product = cart.find(p => p.id === id);
    if (product) {
        cart.push(product);
        localStorage.setItem("cart", JSON.stringify(cart));
        location.reload();
    }
}

// Place order - Redirect to Payment Page with order items
if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", () => {
        // Store cart data for payment processing - include all items for database
        const orderData = {
            items: cart,
            total: total,
            loyalty: loyalty,
            subtotal: subtotal,
            discount: discount,
            date: new Date().toISOString()
        };
        
        // Save to sessionStorage for payment page to access
        sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
        
        // Redirect to checkout page for address selection
        window.location.href = `checkout.html`;
    });
}
