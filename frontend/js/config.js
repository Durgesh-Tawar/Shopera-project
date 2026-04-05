const CONFIG = {
    // Replace with your actual backend URL after deployment (e.g., https://your-backend.onrender.com)
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000' 
        : 'https://your-backend.onrender.com' // <-- CHANGE THIS AFTER DEPLOYING BACKEND
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
