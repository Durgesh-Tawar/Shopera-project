// =========================================
// SOPERA - Profile Page JavaScript
// Authentication & Dashboard Logic
// =========================================

// DOM Elements
const authContainer = document.getElementById('authContainer');
const profileDashboard = document.getElementById('profileDashboard');
const loginBox = document.getElementById('loginBox');
const registerBox = document.getElementById('registerBox');
const forgotBox = document.getElementById('forgotBox');
const editProfileModal = document.getElementById('editProfileModal');
const addressModal = document.getElementById('addressModal');
const addressSection = document.getElementById('addressSection');
const addressList = document.getElementById('addressList');

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    initializeFormHandlers();
});

// =========================================
// AUTHENTICATION CHECK
// =========================================

function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (user && token) {
        showDashboard(user);
        loadAddresses();
    } else {
        showAuthForms();
    }
}

function showDashboard(user) {
    authContainer.style.display = 'none';
    profileDashboard.style.display = 'block';
    
    // Update profile info
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('avatarInitial').textContent = getInitials(user.name);
    
    // Update edit form
    document.getElementById('editName').value = user.name || '';
}

function showAuthForms() {
    authContainer.style.display = 'block';
    profileDashboard.style.display = 'none';
    showLogin();
}

// =========================================
// ADDRESS MANAGEMENT
// =========================================

async function loadAddresses() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/user/addresses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const addresses = await response.json();
        renderAddresses(addresses);
    } catch (error) {
        console.error('Error loading addresses:', error);
    }
}

function renderAddresses(addresses) {
    if (addresses.length === 0) {
        addressList.innerHTML = '<p style="text-align: center; color: #696e79; margin: 20px 0;">No addresses saved yet.</p>';
        return;
    }

    addressList.innerHTML = addresses.map(addr => `
        <div class="address-card" style="padding: 20px; border: 1px solid #eaeaec; border-radius: 4px; margin-bottom: 15px; position: relative;">
            <span style="background: #f5f5f6; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 600; color: #696e79;">${addr.addressType}</span>
            <h4 style="margin: 10px 0 5px; font-size: 14px; font-weight: 600;">${addr.name}</h4>
            <p style="font-size: 14px; line-height: 1.4; color: #282c3f;">${addr.address}, ${addr.locality}</p>
            <p style="font-size: 14px; color: #282c3f;">${addr.city}, ${addr.state} - ${addr.pincode}</p>
            <p style="font-size: 14px; font-weight: 600; margin-top: 10px;">Mobile: ${addr.phone}</p>
            <button onclick="deleteAddress('${addr._id}')" style="position: absolute; top: 20px; right: 20px; color: #ff3f6c; border: none; background: none; cursor: pointer; font-weight: 600;">REMOVE</button>
        </div>
    `).join('');
}

async function handleAddAddress(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const addressData = {
        name: document.getElementById('addrName').value,
        phone: document.getElementById('addrPhone').value,
        pincode: document.getElementById('addrPincode').value,
        locality: document.getElementById('addrLocality').value,
        address: document.getElementById('addrText').value,
        city: document.getElementById('addrCity').value,
        state: document.getElementById('addrState').value,
        addressType: document.querySelector('input[name="addrType"]:checked').value
    };

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/user/addresses`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(addressData)
        });

        const data = await response.json();
        if (data.success) {
            closeAddressModal();
            loadAddresses();
            showToast('Address added successfully!', 'success');
        }
    } catch (error) {
        showToast('Error saving address', 'error');
    }
}

async function deleteAddress(id) {
    if (!confirm('Are you sure you want to remove this address?')) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/user/addresses/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            loadAddresses();
            showToast('Address removed', 'success');
        }
    } catch (error) {
        showToast('Error removing address', 'error');
    }
}

// =========================================
// FORM SWITCHING
// =========================================

function showLogin(event) {
    if (event) event.preventDefault();
    loginBox.style.display = 'block';
    registerBox.style.display = 'none';
    forgotBox.style.display = 'none';
    clearErrors();
}

function showRegister(event) {
    if (event) event.preventDefault();
    loginBox.style.display = 'none';
    registerBox.style.display = 'block';
    forgotBox.style.display = 'none';
    clearErrors();
}

function showForgotPassword(event) {
    if (event) event.preventDefault();
    loginBox.style.display = 'none';
    registerBox.style.display = 'none';
    forgotBox.style.display = 'block';
    clearErrors();
}

// =========================================
// FORM VALIDATION & HANDLERS
// =========================================

function initializeFormHandlers() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('addressForm').addEventListener('submit', handleAddAddress);
    
    document.getElementById('addressMenuBtn').addEventListener('click', () => {
        addressSection.style.display = 'block';
        window.scrollTo({ top: addressSection.offsetTop - 100, behavior: 'smooth' });
    });
}

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast('Welcome back!', 'success');
            setTimeout(() => location.reload(), 500);
        } else {
            showError('loginEmail', data.message || 'Invalid credentials');
        }
    } catch (error) {
        showToast('Server error', 'error');
    }
}

// Register Handler
async function handleRegister(e) {
    e.preventDefault();
    clearErrors();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast('Account created!', 'success');
            setTimeout(() => location.reload(), 500);
        } else {
            showError('registerEmail', data.message || 'Error creating account');
        }
    } catch (error) {
        showToast('Server error', 'error');
    }
}

// =========================================
// LOGOUT
// =========================================

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    showToast('Logged out successfully!', 'success');
    setTimeout(() => location.reload(), 500);
}

// =========================================
// MODALS
// =========================================

function showEditProfile() {
    editProfileModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeEditProfile() {
    editProfileModal.style.display = 'none';
    document.body.style.overflow = '';
}

function showAddAddress() {
    addressModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAddressModal() {
    addressModal.style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('addressForm').reset();
}

// UTILITIES
function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function showError(inputId, message) {
    const errorSpan = document.getElementById(inputId + 'Error');
    if (errorSpan) errorSpan.textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}
