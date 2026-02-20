// =========================================
// SOPERA - Cart JavaScript (API Connected)
// =========================================

const API_URL = 'http://localhost:3000/api';

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

// Place order - Using API
if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: cart,
                    total: total,
                    loyalty: loyalty
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Save to localStorage for backup
                let orders = JSON.parse(localStorage.getItem("orders")) || [];
                orders.push({
                    ...result.order,
                    localOnly: true
                });
                localStorage.setItem("orders", JSON.stringify(orders));
                
                // Clear cart and discount
                localStorage.setItem("cart", JSON.stringify([]));
                localStorage.setItem("discount", "0");
                
                alert(`Order placed successfully! Order ID: ${result.order.trackingNumber}\nLoyalty Points Earned: ${loyalty}`);
                window.location.href = "orders.html";
            }
        } catch (error) {
            console.error('Error placing order:', error);
            // Fallback to local storage
            let orders = JSON.parse(localStorage.getItem("orders")) || [];
            orders.push({
                items: cart,
                total: total,
                loyalty: loyalty,
                date: new Date().toLocaleString(),
                localOnly: true
            });
            localStorage.setItem("orders", JSON.stringify(orders));
            localStorage.setItem("cart", JSON.stringify([]));
            localStorage.setItem("discount", "0");
            alert("Order placed successfully!");
            window.location.href = "orders.html";
        }
    });
}
