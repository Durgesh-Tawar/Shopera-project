let ordersList = document.getElementById("ordersList");
let totalPointsEl = document.getElementById("totalPoints");

let orders = JSON.parse(localStorage.getItem("orders")) || [];
let totalPoints = 0;

orders.forEach(o=>{
    totalPoints += o.loyalty;
    let div = document.createElement("div");
    div.classList.add("order-card");
    div.innerHTML = `<p><strong>Date:</strong> ${o.date}</p>
                     <p><strong>Total:</strong> ₹${o.total}</p>
                     <p><strong>Loyalty Points:</strong> ${o.loyalty}</p>`;
    ordersList.appendChild(div);
});

totalPointsEl.innerText = totalPoints;