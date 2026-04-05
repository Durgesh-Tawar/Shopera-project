// =========================================
// SOPERA - Orders JavaScript with API & Tracking
// =========================================

const API_URL = `${CONFIG.API_BASE_URL}/api`;

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
async function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${CONFIG.API_BASE_URL}/api/order/${orderId}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Order has been cancelled successfully!');
                location.reload();
            } else {
                alert('Failed to cancel order.');
            }
        } catch (e) {
            console.error('Cancel failed', e);
        }
    }
}

// Modals state
let currentReturnOrderId = null;
let currentFeedbackOrderId = null;
let currentFeedbackProductId = null;

function openReturnModal(orderId, img, price, name) {
    currentReturnOrderId = orderId;
    
    const summaryEl = document.getElementById('returnProductSummary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px; margin-bottom:20px; padding:10px; background:#f8f9fa; border-radius:8px;">
                <img src="${img}" style="width:50px; height:60px; object-fit:cover; border-radius:4px;">
                <div>
                    <div style="font-weight:600; font-size:14px; color:#282c3f;">${name.replace(/'/g, "\\'")}</div>
                    <div style="color:#ff3f6c; font-weight:700; font-size:14px; margin-top:4px;">₹${Number(price).toLocaleString()}</div>
                </div>
            </div>
        `;
    }
    
    document.getElementById('returnModal').style.display = 'flex';
}

function closeReturnModal() {
    currentReturnOrderId = null;
    document.getElementById('returnModal').style.display = 'none';
}

function openFeedbackModal(orderId, productId, img, price, name) {
    currentFeedbackOrderId = orderId;
    currentFeedbackProductId = productId;
    
    const summaryEl = document.getElementById('feedbackProductSummary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px; margin-bottom:20px; padding:10px; background:#f8f9fa; border-radius:8px;">
                <img src="${img}" style="width:50px; height:60px; object-fit:cover; border-radius:4px;">
                <div>
                    <div style="font-weight:600; font-size:14px; color:#282c3f;">${name.replace(/'/g, "\\'")}</div>
                    <div style="color:#ff3f6c; font-weight:700; font-size:14px; margin-top:4px;">₹${Number(price).toLocaleString()}</div>
                </div>
            </div>
        `;
    }
    
    document.getElementById('feedbackModal').style.display = 'flex';
}

function closeFeedbackModal() {
    currentFeedbackOrderId = null;
    currentFeedbackProductId = null;
    document.getElementById('feedbackModal').style.display = 'none';
}

async function submitReturn() {
    if (!currentReturnOrderId) return;
    const reason = document.getElementById('returnReason').value;
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/order/${currentReturnOrderId}/return`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });
        if (res.ok) {
            alert('Return request submitted successfully!');
            location.reload();
        } else {
            alert('Failed to request return.');
        }
    } catch (e) {
        console.error('Return failed', e);
    }
}

async function submitFeedback() {
    if (!currentFeedbackOrderId) return;
    
    const rating = document.getElementById('feedbackRating').value;
    const comment = document.getElementById('feedbackComment').value;
    const imagesInput = document.getElementById('feedbackImages');
    let uploadedImagePaths = [];

    const token = localStorage.getItem('token');

    try {
        // Upload images first if any
        if (imagesInput.files && imagesInput.files.length > 0) {
            const formData = new FormData();
            for (let i = 0; i < imagesInput.files.length; i++) {
                formData.append('images', imagesInput.files[i]);
            }

            const uploadRes = await fetch(`${CONFIG.API_BASE_URL}/api/reviews/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const uploadData = await uploadRes.json();
            if (uploadData.success) {
                uploadedImagePaths = uploadData.paths;
            } else {
                alert('Image upload failed: ' + uploadData.message);
                return;
            }
        }

        // Submit review
        const reviewRes = await fetch(`${CONFIG.API_BASE_URL}/api/reviews`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: currentFeedbackOrderId,
                productId: currentFeedbackProductId,
                rating,
                comment,
                images: uploadedImagePaths
            })
        });

        if (reviewRes.ok) {
            alert('Feedback submitted successfully!');
            closeFeedbackModal();
            location.reload();
        } else {
            alert('Failed to submit feedback.');
        }
    } catch (e) {
        console.error('Feedback failed', e);
    }
}

// Render tracking progress vertical timeline
function renderTrackingProgress(order) {
    const status = (order.status || 'processing').toLowerCase();
    const trackingNumber = order.trackingNumber || 'SOP' + (order._id ? order._id.slice(-6).toUpperCase() : '');
    const updates = order.updates || [];
    
    // Sort updates dynamically by Date
    const sortedUpdates = [...updates].sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (status === 'cancelled') {
        return `
            <div class="order-tracking-section">
                <div class="tracking-header">
                    <span class="order-status-badge status-cancelled">Order Cancelled</span>
                </div>
                <div class="myntra-timeline">
                    <div class="myntra-step completed">
                       <div class="step-title" style="color:#d9534f">Cancelled ❌</div>
                       <div class="step-desc">Your order has been cancelled and refund process initiated.</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (['return requested', 'return approved', 'out for pickup', 'picked up', 'returned', 'refunded'].includes(status)) {
        const returnSteps = [
            { key: 'return requested', label: 'Return Requested', icon: '↩️', desc: 'Your return request has been submitted.' },
            { key: 'return approved', label: 'Return Approved', icon: '📋', desc: 'Pickup has been scheduled.' },
            { key: 'out for pickup', label: 'Out for Pickup', icon: '🚚', desc: 'Our executive is out to pick up your item.' },
            { key: 'picked up', label: 'Picked Up', icon: '📦', desc: 'The item has been successfully picked up.' },
            { key: 'returned', label: 'Returned to Warehouse', icon: '🏢', desc: 'Item reached our facility and is being verified.' },
            { key: 'refunded', label: 'Refunded', icon: '💸', desc: 'Refund has been successfully initiated to your original payment mode.' }
        ];

        let returnHtml = `
            <div class="order-tracking-section">
                <div class="tracking-header">
                    <span class="order-status-badge status-processing">Return Tracking</span>
                </div>
                <div class="myntra-timeline" style="margin-top:15px">
                    <div class="myntra-step completed">
                        <div class="step-title">Order Delivered ✅</div>
                    </div>
        `;

        const curStatusIdx = returnSteps.findIndex(s => s.key === status);
        
        returnSteps.forEach((step, idx) => {
            if (idx <= curStatusIdx) {
                const isActive = idx === curStatusIdx ? 'active' : 'completed';
                const color = isActive ? '#ff9800' : '#03a685';
                returnHtml += `
                    <div class="myntra-step ${isActive}">
                        <div class="step-title" style="color:${color}">${step.label} ${step.icon}</div>
                        ${isActive ? `<div class="step-desc">${step.desc}</div>` : ''}
                    </div>
                `;
            } else {
                // Future steps (dimmed)
                returnHtml += `
                    <div class="myntra-step">
                        <div class="step-title" style="color:#adb5bd">${step.label} ${step.icon}</div>
                    </div>
                `;
            }
        });

        returnHtml += `
                </div>
            </div>
        `;
        return returnHtml;
    }
    
    const statusIndex = trackingSteps.findIndex(s => s.key === status);
    
    const canCancel = ['placed', 'paid', 'confirmed', 'processing'].includes(status);
    const cancelButton = canCancel ? `
        <button class="cancel-order-btn" onclick="cancelOrder('${order._id}')">
            Cancel Order ❌
        </button>
    ` : '';
    
    const isDelivered = status === 'delivered';
    const products = order.products || order.items || [];
    const firstProductId = products.length > 0 ? (products[0].productId || products[0]._id) : '';

    const firstProductImg = products.length > 0 ? (products[0].image || '') : '';
    const firstProductPrice = products.length > 0 ? (products[0].price || 0) : 0;
    const firstProductName = products.length > 0 ? (products[0].name || '') : '';

    const returnButton = isDelivered ? `
        <button class="cancel-order-btn" style="background:#ff9800; border-radius:4px" onclick="openReturnModal('${order._id}', '${firstProductImg}', '${firstProductPrice}', '${firstProductName}')">
            Return item ↩️
        </button>
    ` : '';
    
    const feedbackButton = isDelivered ? `
        <button class="cancel-order-btn" style="background:#03a685; margin-left:10px; border-radius:4px" onclick="openFeedbackModal('${order._id}', '${firstProductId}', '${firstProductImg}', '${firstProductPrice}', '${firstProductName}')">
            Leave Feedback ⭐
        </button>
    ` : '';
    
    let html = `
        <div class="order-tracking-section" style="background:#fff; border:1px solid #eaeaec; border-radius:8px">
            <div class="tracking-header" style="border-bottom: 1px dashed #e9ecef; padding-bottom:15px">
                <span style="font-size:14px; color:#535766; font-weight:600">Tracking ID: <span style="color:#ff3f6c">${trackingNumber}</span></span>
            </div>
            <div class="myntra-timeline" style="margin-top:15px">
    `;
    
    // Always show Placed step
    html += `
        <div class="myntra-step completed">
            <div class="step-title">Order Placed ✓</div>
            <div class="step-date">${new Date(order.createdAt).toLocaleString()}</div>
            <div class="step-desc">Your order has been placed successfully</div>
        </div>
    `;

    // Map any custom backend updates
    let lastRenderedBaseStepIdx = 0;
    
    sortedUpdates.forEach(u => {
        let title = u.status;
        let icon = '';
        if(title.toLowerCase() === 'shipped') icon='🚚';
        if(title.toLowerCase() === 'out for delivery') icon='🏃';
        if(title.toLowerCase() === 'delivered') icon='🏠';
        
        let desc = u.message ? `<div class="step-desc">${u.message}</div>` : '';
        let stepClass = (title.toLowerCase() === status) ? 'active' : 'completed';
        
        html += `
            <div class="myntra-step ${stepClass}">
                <div class="step-title">${title} ${icon}</div>
                <div class="step-date">${new Date(u.timestamp).toLocaleString()}</div>
                ${desc}
            </div>
        `;
    });
    
    // If no backend updates but status is beyond Placed, simulate based on `statusIndex`
    if (sortedUpdates.length === 0 && statusIndex > 0) {
        for(let i=1; i<=statusIndex; i++) {
            let s = trackingSteps[i];
            let active = (i === statusIndex) ? 'active' : 'completed';
            html += `
                <div class="myntra-step ${active}">
                    <div class="step-title">${s.label} ${s.icon}</div>
                </div>
            `;
        }
    }
    
    html += `
            </div>
            <div class="estimated-delivery" style="background:#ecfbf7; border:1px dashed #03a685; margin-top:0">
                <h4 style="color:#03a685; font-size:13px">Estimated Delivery</h4>
                <p style="color:#282c3f; font-size:14px">${isDelivered ? 'Delivered successfully' : getEstimatedDelivery()}</p>
            </div>
            <div style="margin-top:10px">${cancelButton}${returnButton}${feedbackButton}</div>
        </div>
    `;
    
    return html;
}

// Load orders from API
async function loadOrders() {
    let orders = [];
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/order/my-orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            orders = data.orders || [];
        }
    } catch (error) {
        console.error('API not available', error);
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
    
    orders.forEach((o) => {
        const excludePointsStatuses = ['Cancelled', 'Return Requested', 'Return Approved', 'Out for Pickup', 'Picked Up', 'Returned', 'Refunded'];
        if (!excludePointsStatuses.includes(o.status)) {
            totalPoints += Math.floor((o.totalAmount || 0) / 100);
        }
        
        const products = o.products || o.items || [];
        
        let itemsHtml = products.map(item => {
            // Priority: item.productId (if numeric), item.id (numeric), then check if productId is set at all.
            // We avoid falling back to the mongo _id (hex string) because it breaks product.html
            let pid = null;
            if (item.productId && !isNaN(item.productId)) pid = item.productId;
            else if (item.id && !isNaN(item.id)) pid = item.id;
            else pid = item.productId || item.id || ''; // Last resort

            let sizeDisplay = item.size ? `<small style="color:#888">Qty: ${item.quantity || 1} | Size: ${item.size}</small>` : '';
            return `
                <div class="order-item" style="display:flex; gap:15px; margin-bottom:15px; align-items:center; cursor:pointer; padding:10px; border-radius:8px; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'" onclick="window.location.href='product.html?id=${pid}'">
                    <img src="${item.image}" alt="${item.name}" style="width:60px; height:80px; object-fit:cover; border-radius:8px;">
                    <div>
                        <div style="font-weight:600; color:#282c3f;">${item.name}</div>
                        ${sizeDisplay}
                        <div style="font-weight:600; margin-top:5px;">₹${(item.price || 0).toLocaleString()}</div>
                    </div>
                    <div style="margin-left:auto; color:#ff3f6c;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                </div>
            `;
        }).join('');
        
        // Extract delivery updates if present
        let updatesHtml = '';
        if (o.updates && o.updates.length > 0) {
            updatesHtml = '<div style="margin-top:10px; padding:10px; background:#f8f9fa; border-radius:8px;"><strong>Delivery Updates:</strong><ul style="margin-top:5px; margin-left:20px; font-size:13px; color:#696e79;">';
            o.updates.forEach(u => {
                updatesHtml += `<li>${new Date(u.timestamp).toLocaleDateString()} - ${u.message} (${u.status})</li>`;
            });
            updatesHtml += '</ul></div>';
        }
        
        let div = document.createElement("div");
        div.classList.add("order-card");
        div.style.background = '#fff';
        div.style.padding = '20px';
        div.style.borderRadius = '12px';
        div.style.marginBottom = '20px';
        div.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
        
        div.innerHTML = `
            ${renderTrackingProgress(o)}
            <div class="order-header" style="display:flex; justify-content:space-between; flex-wrap:wrap; border-top:1px solid #eee; padding-top:15px; margin-top:15px;">
                <p><strong>Order Date:</strong> ${new Date(o.createdAt || o.date).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> <span style="font-size:1.1rem; color:#ff3f6c; font-weight:700;">₹${(o.totalAmount || o.total || 0).toLocaleString()}</span></p>
            </div>
            <div class="order-items" style="margin-top:15px;">
                ${itemsHtml}
            </div>
            ${updatesHtml}
        `;
        if (ordersList) ordersList.appendChild(div);
    });
    
    if (totalPointsEl) totalPointsEl.innerText = totalPoints;
}

// Initialize
loadOrders();
