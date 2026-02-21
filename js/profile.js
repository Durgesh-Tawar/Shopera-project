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

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    initializeFormHandlers();
});

// =========================================
// AUTHENTICATION CHECK
// =========================================

function checkAuthStatus() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
        const user = JSON.parse(currentUser);
        showDashboard(user);
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
    document.getElementById('editPhone').value = user.phone || '';
}

function showAuthForms() {
    authContainer.style.display = 'block';
    profileDashboard.style.display = 'none';
    showLogin();
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
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register Form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('registerPassword').addEventListener('input', checkPasswordStrength);
    
    // Forgot Password Form
    document.getElementById('forgotForm').addEventListener('submit', handleForgotPassword);
    
    // Edit Profile Form
    document.getElementById('editProfileForm').addEventListener('submit', handleProfileUpdate);
}

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
        showError('loginEmail', 'No account found with this email');
        return;
    }
    
    if (user.password !== password) {
        showError('loginPassword', 'Incorrect password');
        return;
    }
    
    // Login successful
    if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    showToast('Welcome back, ' + user.name + '!', 'success');
    setTimeout(() => {
        showDashboard(user);
    }, 500);
}

// Register Handler
function handleRegister(e) {
    e.preventDefault();
    clearErrors();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validate name
    if (name.length < 2) {
        showError('registerName', 'Name must be at least 2 characters');
        return;
    }
    
    // Validate email
    if (!validateEmail(email)) {
        showError('registerEmail', 'Please enter a valid email address');
        return;
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        showError('registerPassword', passwordValidation.message);
        return;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
        showError('registerConfirmPassword', 'Passwords do not match');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        showError('registerEmail', 'An account with this email already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    showToast('Account created successfully! Welcome to SOPERA!', 'success');
    setTimeout(() => {
        showDashboard(newUser);
    }, 500);
}

// Forgot Password Handler
function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value.trim();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
        showToast('Password reset link sent to your email!', 'success');
        setTimeout(() => {
            showLogin();
        }, 2000);
    } else {
        showToast('No account found with this email', 'error');
    }
}

// Edit Profile Handler
function handleProfileUpdate(e) {
    e.preventDefault();
    
    const name = document.getElementById('editName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) return;
    
    // Update user data
    currentUser.name = name;
    currentUser.phone = phone;
    
    // Update localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update users array
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex > -1) {
        users[userIndex].name = name;
        users[userIndex].phone = phone;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Update UI
    document.getElementById('profileName').textContent = name;
    document.getElementById('avatarInitial').textContent = getInitials(name);
    
    closeEditProfile();
    showToast('Profile updated successfully!', 'success');
}

// =========================================
// PASSWORD VALIDATION
// =========================================

function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!hasUpperCase) {
        return { isValid: false, message: 'Password must contain at least 1 uppercase letter' };
    }
    if (!hasLowerCase) {
        return { isValid: false, message: 'Password must contain at least 1 lowercase letter' };
    }
    if (!hasNumber) {
        return { isValid: false, message: 'Password must contain at least 1 number' };
    }
    if (!hasSpecialChar) {
        return { isValid: false, message: 'Password must contain at least 1 special character' };
    }
    
    return { isValid: true };
}

function checkPasswordStrength() {
    const password = document.getElementById('registerPassword').value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!password) {
        strengthFill.className = 'strength-fill';
        strengthText.textContent = '';
        return;
    }
    
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    strengthFill.className = 'strength-fill';
    
    if (strength <= 2) {
        strengthFill.classList.add('weak');
        strengthText.className = 'strength-text weak';
        strengthText.textContent = 'Weak password';
    } else if (strength === 3) {
        strengthFill.classList.add('fair');
        strengthText.className = 'strength-text fair';
        strengthText.textContent = 'Fair password';
    } else if (strength === 4) {
        strengthFill.classList.add('good');
        strengthText.className = 'strength-text good';
        strengthText.textContent = 'Good password';
    } else {
        strengthFill.classList.add('strong');
        strengthText.className = 'strength-text strong';
        strengthText.textContent = 'Strong password';
    }
}

// =========================================
// LOGOUT
// =========================================

function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    
    showToast('Logged out successfully!', 'success');
    
    setTimeout(() => {
        showAuthForms();
    }, 500);
}

// =========================================
// EDIT PROFILE MODAL
// =========================================

function showEditProfile() {
    editProfileModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeEditProfile() {
    editProfileModal.style.display = 'none';
    document.body.style.overflow = '';
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEditProfile();
    }
});

// =========================================
// UTILITY FUNCTIONS
// =========================================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function getInitials(name) {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorSpan = document.getElementById(inputId + 'Error');
    
    if (input) {
        input.classList.add('error');
    }
    
    if (errorSpan) {
        errorSpan.textContent = message;
    }
}

function clearErrors() {
    const errorInputs = document.querySelectorAll('.form-group input.error');
    errorInputs.forEach(input => input.classList.remove('error'));
    
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.textContent = '');
    
    // Reset password strength
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    if (strengthFill) strengthFill.className = 'strength-fill';
    if (strengthText) strengthText.textContent = '';
}

function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
