let cart = JSON.parse(localStorage.getItem("cart")) || [];
const container = document.getElementById("cartItems");
const totalBox = document.getElementById("totalAmount");

function displayCart(){
  container.innerHTML="";
  let total=0;

  cart.forEach((item,index)=>{
    total += item.price * item.qty;

    container.innerHTML += `
      <div class="card">
        <h4>${item.name}</h4>
        <p>₹${item.price}</p>
        <p>Qty: ${item.qty}</p>
        <button onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  });

  totalBox.innerText = "Total: ₹" + total;
}

function removeItem(index){
  cart.splice(index,1);
  localStorage.setItem("cart",JSON.stringify(cart));
  displayCart();
}

displayCart();