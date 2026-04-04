document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('global-footer')) return;

    const footerHTML = `
<style>
/* Premium Footer Styles */
.global-footer-wrapper {
    background: linear-gradient(135deg, #0f111a 0%, #171a2b 100%);
    color: #ffffff;
    padding: 80px 5% 30px;
    margin-top: 80px;
    font-family: 'Poppins', sans-serif;
    position: relative;
    overflow: hidden;
    border-top: 1px solid rgba(255, 63, 108, 0.2);
}

.global-footer-wrapper::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #ff3f6c, #ff9a44, #ff3f6c);
    background-size: 200% auto;
    animation: gradientFlow 5s ease infinite;
}

@keyframes gradientFlow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.glow-circle {
    position: absolute;
    width: 300px;
    height: 300px;
    background: rgba(255, 63, 108, 0.05);
    filter: blur(80px);
    border-radius: 50%;
    z-index: 0;
}

.glow-circle.top-left { top: -150px; left: -150px; }
.glow-circle.bottom-right { bottom: -150px; right: -150px; }

.footer-container {
    display: flex;
    flex-wrap: wrap;
    gap: 50px;
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
}

.footer-brand {
    flex: 1.5;
    min-width: 300px;
}

.footer-logo-wrapper {
    display: inline-block;
    font-size: 2.2rem;
    font-weight: 800;
    background: linear-gradient(45deg, #ff3f6c, #ffb88c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 20px;
    letter-spacing: 1px;
}

.footer-desc {
    color: #a0a5b1;
    line-height: 1.8;
    margin-bottom: 25px;
    font-size: 0.95rem;
    max-width: 350px;
}

.social-links {
    display: flex;
    gap: 15px;
}

.social-icon {
    width: 45px;
    height: 45px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #fff;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    text-decoration: none;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.social-icon:hover {
    background: linear-gradient(45deg, #ff3f6c, #ff6b9d);
    border-color: transparent;
    transform: translateY(-5px) scale(1.1);
    box-shadow: 0 10px 20px rgba(255,63,108,0.4);
}

.footer-links-group {
    flex: 3;
    display: flex;
    flex-wrap: wrap;
    gap: 40px;
}

.footer-column {
    flex: 1;
    min-width: 160px;
}

.footer-column h4, .newsletter-column h4 {
    color: #ffffff;
    font-size: 1.15rem;
    margin-bottom: 25px;
    position: relative;
    padding-bottom: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
    display: inline-block;
    width: max-content;
}

.footer-column h4::after, .newsletter-column h4::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(45deg, #ff3f6c, #ffb88c);
    border-radius: 3px;
}

.footer-column ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-column ul li {
    margin-bottom: 16px;
}

.footer-column ul li a {
    color: #a0a5b1;
    text-decoration: none;
    transition: all 0.3s ease;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
}

.footer-column ul li a::before {
    content: '→';
    margin-right: 8px;
    font-size: 0.8rem;
    color: #ff3f6c;
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.3s ease;
}

.footer-column ul li a:hover {
    color: #ffffff;
    transform: translateX(5px);
}

.footer-column ul li a:hover::before {
    opacity: 1;
    transform: translateX(0);
}

.contact-list li {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #a0a5b1;
    font-size: 0.95rem;
    margin-bottom: 20px !important;
}

.contact-icon {
    font-size: 1.2rem;
    background: rgba(255,63,108,0.1);
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: #ff3f6c;
}

.newsletter-column {
    flex: 1.5;
    min-width: 320px;
}

.newsletter-column p {
    color: #a0a5b1;
    font-size: 0.95rem;
    margin-bottom: 20px;
    line-height: 1.6;
}

.newsletter-form {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    padding: 5px;
    transition: all 0.3s ease;
    width: 100%;
}

.newsletter-form:focus-within {
    border-color: rgba(255, 63, 108, 0.5);
    box-shadow: 0 0 15px rgba(255, 63, 108, 0.15);
    background: rgba(255, 255, 255, 0.08);
}

.newsletter-form input {
    flex: 1 1 0%;
    min-width: 0;
    padding: 12px 20px;
    border: none;
    background: transparent;
    color: white;
    font-size: 0.95rem;
    outline: none;
    font-family: inherit;
}

.newsletter-form input::placeholder {
    color: #6c7280;
}

.newsletter-form button {
    padding: 10px 20px;
    background: linear-gradient(45deg, #ff3f6c, #ffb88c);
    border: none;
    border-radius: 25px;
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    transition: all 0.4s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(255, 63, 108, 0.3);
    flex-shrink: 0;
}

.newsletter-form button:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(255,63,108,0.4);
}

.footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    padding-top: 30px;
    margin-top: 60px;
    border-top: 1px solid rgba(255,255,255,0.08);
    position: relative;
    z-index: 1;
}

.footer-bottom p {
    color: #8c92a0;
    font-size: 0.9rem;
}

.payment-methods {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    align-items: center;
}

.payment-pill {
    padding: 8px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    font-size: 0.85rem;
    color: #a0a5b1;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.payment-pill:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
    transform: translateY(-2px);
}

@media (max-width: 992px) {
    .footer-container { gap: 40px; }
    .footer-links-group { flex: 100%; }
    .newsletter-column { flex: 100%; max-width: 400px; }
}

@media (max-width: 768px) {
    .global-footer-wrapper { padding: 60px 5% 20px; margin-top: 50px; }
    .footer-column { min-width: 45%; }
    .footer-bottom { flex-direction: column; text-align: center; justify-content: center; }
}

@media (max-width: 480px) {
    .footer-column { min-width: 100%; }
}
</style>

<footer id="global-footer" class="global-footer-wrapper">
    <div class="glow-circle top-left"></div>
    <div class="glow-circle bottom-right"></div>
    
    <div class="footer-container">
        <div class="footer-brand">
            <a href="index.html" style="text-decoration: none;">
                <div class="footer-logo-wrapper">SOPERA</div>
            </a>
            <p class="footer-desc">Redefining modern fashion. Shop the latest trends with premium quality clothing for men, women, and kids. Experience elegance in every stitch.</p>
            <div class="social-links">
                <a href="#" class="social-icon">📘</a>
                <a href="#" class="social-icon">📸</a>
                <a href="#" class="social-icon">🐦</a>
                <a href="#" class="social-icon">📺</a>
            </div>
        </div>
        
        <div class="footer-links-group">
            <div class="footer-column">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="mood.html">Mood Shop</a></li>
                    <li><a href="reels.html">Sopera Reels</a></li>
                    <li><a href="spin.html">Spin & Win</a></li>
                    <li><a href="search.html">Explore Catalog</a></li>
                </ul>
            </div>
            
            <div class="footer-column">
                <h4>Account</h4>
                <ul>
                    <li><a href="login.html">Login / Register</a></li>
                    <li><a href="cart.html">Shopping Bag</a></li>
                    <li><a href="wishlist.html">My Wishlist</a></li>
                    <li><a href="orders.html">Order History</a></li>
                    <li><a href="profile.html">Profile Settings</a></li>
                </ul>
            </div>
            
            <div class="footer-column">
                <h4>Help & Contact</h4>
                <ul class="contact-list">
                    <li><span class="contact-icon">📞</span> +91 98765 43210</li>
                    <li><span class="contact-icon">✉️</span> support@sopera.com</li>
                    <li><span class="contact-icon">📍</span> Mumbai, Maharashtra</li>
                    <li><a href="support.html" style="color: #ff3f6c; margin-top: 10px; font-weight: 600;">Visit Help Center →</a></li>
                </ul>
            </div>
        </div>
        
        <div class="newsletter-column">
            <h4>Stay Updated</h4>
            <p>Join our newsletter for exclusive early access to drops, insider updates, and special promotions.</p>
            <form class="newsletter-form" id="globalNewsletterForm">
                <input type="email" placeholder="Enter your email address" required>
                <button type="submit">Subscribe</button>
            </form>
        </div>
    </div>
    
    <div class="footer-bottom">
        <p>© 2026 SOPERA Technologies • All Rights Reserved</p>
        <div class="payment-methods">
            <div class="payment-pill">💳 Visa</div>
            <div class="payment-pill">💳 MasterCard</div>
            <div class="payment-pill">🏦 UPI</div>
            <div class="payment-pill">📱 RuPay</div>
        </div>
    </div>
</footer>`;

    document.body.insertAdjacentHTML('beforeend', footerHTML);

    const newsletterForm = document.getElementById('globalNewsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = e.target.querySelector('input').value;
            // Provide a rich toast or alert
            if (typeof window.showToast === 'function') {
                window.showToast('Thank you for subscribing! Updates sent to ' + email, 'success');
            } else {
                alert('Thank you for subscribing! Updates will be sent to ' + email);
            }
            e.target.reset();
        });
    }
});
