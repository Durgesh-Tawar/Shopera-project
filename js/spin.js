// =========================================
// SOPERA - Spin & Win JavaScript (API Connected)
// =========================================

const API_URL = 'http://localhost:3000/api';

let spinResult = document.getElementById("spinResult");
let wheel = document.getElementById("wheel");

// Check if user already spun today
let lastSpin = localStorage.getItem("lastSpin");
let today = new Date().toDateString();

if (lastSpin === today) {
    // Show previous discount
    let savedDiscount = localStorage.getItem("discount");
    if (savedDiscount) {
        spinResult.innerText = `🎉 You already spun today! ${savedDiscount}% discount applied!`;
    }
}

// Spin the wheel
async function spinWheel() {
    lastSpin = localStorage.getItem("lastSpin");
    today = new Date().toDateString();
    
    if (lastSpin === today) {
        spinResult.innerText = "You can spin only once per day!";
        return;
    }

    // Try to get result from API
    let won;
    try {
        const response = await fetch(`${API_URL}/spin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        won = result.discount;
    } catch (error) {
        // Fallback to local calculation
        console.log('API not available, using local spin');
        let discount = [5, 10, 15, 20, 25, 50];
        won = discount[Math.floor(Math.random() * discount.length)];
    }

    // Store discount
    localStorage.setItem("discount", won);
    localStorage.setItem("lastSpin", today);

    spinResult.innerText = `🎉 You won ${won}% discount!`;
    
    // Animate wheel
    let degree = 3600 + (won * 12);
    wheel.style.transition = "transform 4s ease-out";
    wheel.style.transform = `rotate(${degree}deg)`;
    
    // Reset wheel after animation
    setTimeout(() => {
        wheel.style.transition = "none";
        degree = degree % 360;
        wheel.style.transform = `rotate(${degree}deg)`;
    }, 4000);
}

// Make spinWheel available globally
window.spinWheel = spinWheel;
