// HERO SLIDER
let slides = document.querySelectorAll(".slide");
let index = 0;

setInterval(()=>{
  slides[index].classList.remove("active");
  index = (index + 1) % slides.length;
  slides[index].classList.add("active");
},1000);

// DARK MODE
const toggle = document.getElementById("darkToggle");
toggle.addEventListener("click",()=>{
  document.body.classList.toggle("dark");
});

// CART COUNT
function updateCartCount(){
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  document.getElementById("cartCount").innerText = cart.length;
}
updateCartCount();

// PRODUCTS DATA
const products = [
  {
    id:1,
    name:"Black T-Shirt",
    price:499,
    image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
  },
  {
    id:2,
    name:"Blue Jeans",
    price:999,
    image:"https://images.unsplash.com/photo-1541099649105-f69ad21f3246"
  },
  {
    id:3,
    name:"Jacket",
    price:1999,
    image:"https://images.unsplash.com/photo-1520975922203-bb36c4b7c10a"
  },
  {
    id:4,
    name:"Hoodie",
    price:1299,
    image:"https://images.unsplash.com/photo-1544441893-675973e31985"
  }
];

const homeContainer = document.getElementById("homeProducts");

if(homeContainer){
  products.forEach(p=>{
    homeContainer.innerHTML += `
      <div class="card">
        <img src="${p.image}">
        <h4>${p.name}</h4>
        <p>₹${p.price}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    `;
  });
}

// ADD TO CART
function addToCart(id){
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let item = products.find(p=>p.id===id);

  let existing = cart.find(p=>p.id===id);
  if(existing){
    existing.qty += 1;
  }else{
    cart.push({...item, qty:1});
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert("Added to Cart");
}