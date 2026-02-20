// =========================================
// SOPERA - Orders JavaScript with API & Tracking
// =========================================

const API_URL = 'http://localhost:3000/api';

let ordersList = document.getElementById("ordersList");
let totalPointsEl = document.getElementById("totalPoints");

// Order tracking steps
const trackingSteps = [
    { key: 'placed', label: 'Order Placed', icon: '✓' },
    { key: 'confirmed', label: 'Order Confirmed', icon: '✓' },
    { key: 'processing', label: 'Processing', icon: '📦' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'outfordelivery', label: 'Out for Delivery', icon: '🏃' },
    { key: 'delivered', label: 'Delivered', icon: '🏠' }
];

// Generate estimated delivery date
function getEstimatedDelivery() {
    const days = Math.floor(Math.random() * 5) + 3;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

// Get random order status
function getRandomStatus() {
    const statuses = ['placed', 'confirmed', 'processing', 'shipped', 'outfordelivery', 'delivered'];
    const weights = [5, 10, 20, 30, 25, 10];
    let random = Math.random() * 100;
    let cumulative = 0;
    
    for (let i = 0; i < statuses.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) {
            return statuses[i];
        }
    }
    return 'processing';
}

// Get status display text
function getStatusText(status) {
    const statusTexts = {
        'placed': 'Order Placed',
        'confirmed': 'Order Confirmed',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'outfordelivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return statusTexts[status] || 'Processing';
}

// Get status class
function getStatusClass(status) {
    const statusClasses = {
        'placed': 'status-placed',
        'confirmed': 'status-processing',
        'processing': 'status-processing',
        'shipped': 'status-shipped',
        'outfordelivery': 'status-shipped',
        'delivered': 'status-delivered',
        'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-processing';
}

// Calculate progress percentage
function getProgressPercentage(status) {
    if (status === 'cancelled') return 0;
    const statusIndex = trackingSteps.findIndex(s => s.key === status);
    if (statusIndex === -1) return 10;
    return ((statusIndex + 1) / trackingSteps.length) * 100;
}

// Cancel order function
async function cancelOrder(orderIndex) {
    if (confirm('Are you sure you want to cancel this order?')) {
        let orders = JSON.parse(localStorage.getItem("orders")) || [];
        
        if (orders[orderIndex]) {
            const order = orders[orderIndex];
            
            // Try to cancel on server first
            try {
                await fetch(`${API_URL}/orders/${order.id}`, {
                    method: 'DELETE'
                });
            } catch (e) {
                console.log('Server not available, using local cancel');
            }
            
            // Mark as cancelled locally
            orders[orderIndex].status = 'cancelled';
            orders[orderIndex].cancelled = true;
            localStorage.setItem("orders", JSON.stringify(orders));
            
            alert('Order has been cancelled successfully!');
            location.reload();
        }
    }
}

// Render tracking progress
function renderTrackingProgress(status, orderIndex, trackingNumber) {
    if (status === 'cancelled') {
        return `
            <div class="order-tracking-section">
                <div class="tracking-header">
                    <span class="order-status-badge status-cancelled">Order Cancelled</span>
                </div>
                <p style="text-align:center;color:#888;padding:20px;">
                    This order has been cancelled. If you paid online, refund will be processed within 5-7 business days.
                </p>
            </div>
        `;
    }
    
    const statusIndex = trackingSteps.findIndex(s => s.key === status);
    const progressPercent = getProgressPercentage(status);
    const canCancel = ['placed', 'confirmed', 'processing'].includes(status);
    const cancelButton = canCancel ? `
        <button class="cancel-order-btn" onclick="cancelOrder(${orderIndex})">
            Cancel Order ❌
        </button>
    ` : '';
    
    let html = `
        <div class="order-tracking-section">
            <div class="tracking-header">
                <span class="order-status-badge ${getStatusClass(status)}">${getStatusText(status)}</span>
                <span class="tracking-number">TRK: ${trackingNumber || 'SOP' + Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
            <div class="tracking-progress">
                <div class="tracking-progress-line" style="width: ${progressPercent}%"></div>
    `;
    
    trackingSteps.forEach((step, index) => {
        let stepClass = '';
        if (index < statusIndex) {
            stepClass = 'completed';
        } else if (index === statusIndex) {
            stepClass = 'active';
        }
        
        html += `
            <div class="tracking-step ${stepClass}">
                <div class="step-icon">${index < statusIndex ? '✓' : step.icon}</div>
                <span class="step-label">${step.label}</span>
            </div>
        `;
    });
    
    html += `
            </div>
            <div class="estimated-delivery">
                <h4>Estimated Delivery</h4>
                <p>${getEstimatedDelivery()}</p>
            </div>
            ${cancelButton}
        </div>
    `;
    
    return html;
}

// Load orders from API
async function loadOrders() {
    let orders = [];
    
    // Try to fetch from API first
    try {
        const response = await fetch(`${API_URL}/orders`);
        if (response.ok) {
            orders = await response.json();
        }
    } catch (error) {
        console.log('API not available, loading from localStorage');
    }
    
    // If no orders from API, get from localStorage
    if (orders.length === 0) {
        orders = JSON.parse(localStorage.getItem("orders")) || [];
    }
    
    renderOrders(orders);
}

// Render orders to page
function renderOrders(orders) {
    let totalPoints = 0;
    
    if (orders.length === 0) {
        if (ordersList) {
            ordersList.innerHTML = `
                <div class="empty-cart">
                    <p>No orders yet</p>
                    <a href="index.html"><button>Start Shopping</button></a>
                </div>
            `;
        }
        if (totalPointsEl) totalPointsEl.innerText = '0';
        return;
    }
    
    orders.forEach((o, orderIndex) => {
        if (!o.cancelled) {
            totalPoints += o.loyalty || 0;
        }
        
        let orderStatus = o.status || getRandomStatus();
        const trackingNumber = o.trackingNumber || 'SOP' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        let itemsHtml = (o.items || []).map(item => {
            let sizeDisplay = item.selectedSize ? `<small style="color:#888">Size: ${item.selectedSize}</small>` : '';
            return `
                <div class="order-item">
                    <img src="${item.image}" alt="${item.name}">
                    <span>${item.name}<br>${sizeDisplay}</span>
                </div>
            `;
        }).join('');
        
        let div = document.createElement("div");
        div.classList.add("order-card");
        div.innerHTML = `
            ${renderTrackingProgress(orderStatus, orderIndex, trackingNumber)}
            <div class="order-header">
                <p><strong>Date:</strong> ${o.date || new Date().toLocaleString()}</p>
                <p><strong>Total:</strong> ₹${(o.total || 0).toLocaleString()}</p>
                ${!o.cancelled ? `<p><strong>Loyalty Points Earned:</strong> +${o.loyalty || 0}</p>` : ''}
            </div>
            <div class="order-items">
                ${itemsHtml}
            </div>
        `;
        if (ordersList) ordersList.appendChild(div);
    });
    
    if (totalPointsEl) totalPointsEl.innerText = totalPoints;
}

// Initialize
loadOrders();
