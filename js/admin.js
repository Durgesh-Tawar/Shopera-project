document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    fetchStats();
    fetchOrders();
    setupModal();
    setupNavigation();
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    document.getElementById('editForm').addEventListener('submit', updateOrderStatus);
});

function setupNavigation() {
    const dashboardLink = document.getElementById('showDashboard');
    const ordersLink = document.getElementById('showOrders');
    const usersLink = document.getElementById('showUsers');

    const dashboardSection = document.getElementById('dashboardSection');
    const usersSection = document.getElementById('usersSection');

    dashboardLink.onclick = (e) => {
        e.preventDefault();
        showSection('dashboard');
    };

    ordersLink.onclick = (e) => {
        e.preventDefault();
        showSection('dashboard');
    };

    usersLink.onclick = (e) => {
        e.preventDefault();
        showSection('users');
        fetchUsers();
    };

    function showSection(section) {
        dashboardSection.style.display = section === 'dashboard' ? 'block' : 'none';
        usersSection.style.display = section === 'users' ? 'block' : 'none';

        dashboardLink.classList.toggle('active', section === 'dashboard');
        ordersLink.classList.toggle('active', section === 'dashboard');
        usersLink.classList.toggle('active', section === 'users');
    }
}

async function checkAdminAccess() {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    if (!token || !userString) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(userString);
    if (user.role !== 'admin') {
        alert('Access Denied: You do not have admin privileges.');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('adminName').innerText = user.name || 'Admin';
}

async function fetchStats() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
            document.getElementById('totalOrders').innerText = data.stats.totalOrders;
            document.getElementById('pendingOrders').innerText = data.stats.pendingOrders;
            document.getElementById('completedOrders').innerText = data.stats.completedOrders;
            document.getElementById('totalRevenue').innerText = `₹${data.stats.totalRevenue.toLocaleString()}`;
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

async function fetchOrders() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
            renderOrders(data.orders);
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById('ordersBody');
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order._id.slice(-6)}</td>
            <td>
                <strong>${order.address?.name || 'Guest'}</strong><br>
                <small>${order.userId?.email || 'N/A'}</small>
            </td>
            <td>₹${order.totalAmount.toLocaleString()}</td>
            <td><span class="status-badge status-${order.status.toLowerCase().replace(/ /g, '-')}">${order.status}</span></td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="edit-btn" onclick="openEditModal('${order._id}', '${order.status}', '${order.trackingNumber || ''}', '${order.carrier || ''}')">
                    Update
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function setupModal() {
    const modal = document.getElementById('editModal');
    const span = document.getElementsByClassName('close')[0];
    
    span.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
    }
}

window.openEditModal = openEditModal;

function openEditModal(id, status, tracking, carrier) {
    document.getElementById('editOrderId').value = id;
    document.getElementById('editStatus').value = status;
    document.getElementById('editTracking').value = tracking;
    document.getElementById('editCarrier').value = carrier;
    document.getElementById('editMessage').value = '';
    document.getElementById('editModal').style.display = 'block';
}

async function updateOrderStatus(e) {
    e.preventDefault();
    const id = document.getElementById('editOrderId').value;
    const body = {
        status: document.getElementById('editStatus').value,
        trackingNumber: document.getElementById('editTracking').value,
        carrier: document.getElementById('editCarrier').value,
        message: document.getElementById('editMessage').value
    };

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/order/${id}/status`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        
        if (data.success) {
            alert('Order updated successfully!');
            document.getElementById('editModal').style.display = 'none';
            fetchOrders();
            fetchStats();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error updating order:', error);
        alert('Failed to update order');
    }
}

async function fetchUsers() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
            renderUsers(data.users);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('usersBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${user._id.slice(-6)}</td>
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td><span class="status-badge ${user.role === 'admin' ? 'status-delivered' : 'status-placed'}">${user.role.toUpperCase()}</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        `;
        tbody.appendChild(row);
    });
}
