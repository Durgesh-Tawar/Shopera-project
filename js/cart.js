let cartItems = document.getElementById("cartItems");
let subtotalEl = document.getElementById("subtotal");
let discountText = document.getElementById("discountText");
let finalTotal = document.getElementById("finalTotal");
let loyaltyPointsEl = document.getElementById("loyaltyPoints");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let discount = parseInt(localStorage.getItem("discount")) || 0;
let subtotal = cart.reduce((sum,p)=>sum+p.price,0);
let total = subtotal - (subtotal*discount/100);
let loyalty = Math.floor(total/100);

cart.forEach(p=>{
    let div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<p>${p.name} - ₹${p.price}</p>`;
    cartItems.appendChild(div);
});

subtotalEl.innerText = subtotal;
discountText.innerText = discount+"%";
finalTotal.innerText = total;
loyaltyPointsEl.innerText = loyalty;

document.getElementById("placeOrderBtn").addEventListener("click", ()=>{
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push({items:cart,total:total,loyalty:loyalty,date:new Date().toLocaleString()});
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("cart", JSON.stringify([]));
    alert("Order placed successfully!");
    window.location.href = "orders.html";
});