# Razorpay Integration Plan

## Information Gathered:
- **Project**: Shopera - E-commerce web application
- **Backend**: Express.js (server.js already exists)
- **Frontend**: HTML/CSS/JS files exist (index.html, cart.html, etc.)
- **Current Dependencies**: body-parser, cors, express
- **Missing Dependencies**: razorpay, dotenv

## Plan:

### Step 1: Install NPM Packages
Install required packages:
```bash
npm install razorpay dotenv crypto
```

### Step 2: Create .env File (c:/Users/Lenovo/Desktop/shopera-project/.env)
Create environment variables file:
```
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
PORT=3000
```

### Step 3: Update server.js (Backend)
Add Razorpay integration routes:
- POST /api/create-order - Creates Razorpay order using razorpay.orders.create()
- POST /api/verify-payment - Verifies payment signature using Node.js crypto module

### Step 4: Create Frontend Payment Page (payment.html + js/payment.js)
Create simple HTML page with 'Pay Now' button that opens Razorpay Checkout modal using RAZORPAY_KEY_ID from frontend config.

---

## Key Requirements Met:
✅ razrppy.orders.create() in backend (Node.js)  
✅ crypto module for signature verification  
✅ data-key = RAZORPAY_KEY_ID on frontend  
✅ Secret key kept on server-side only  

---

## Status Checklist:
[x] Install npm packages  
[x] Create .env file  
[x] Update server.js with payment routes  
[x] Create payment.html frontend page  
[x] Add payment method selection UI  
[x] Add demo mode for testing
