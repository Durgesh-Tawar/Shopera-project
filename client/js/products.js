const products = [
  {id:1,name:"Black T-Shirt",price:499,image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"},
  {id:2,name:"Blue Jeans",price:999,image:"https://images.unsplash.com/photo-1541099649105-f69ad21f3246"},
  {id:3,name:"Jacket",price:1999,image:"https://images.unsplash.com/photo-1520975922203-bb36c4b7c10a"},
  {id:4,name:"Hoodie",price:1299,image:"https://images.unsplash.com/photo-1544441893-675973e31985"}
];

const container = document.getElementById("productContainer");

function displayProducts(data){
  container.innerHTML="";
  data.forEach(p=>{
    container.innerHTML+=`
      <div class="card">
        <img src="${p.image}">
        <h4>${p.name}</h4>
        <p>₹${p.price}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
        <button onclick="addToWishlist(${p.id})">❤️ Wishlist</button>
      </div>
    `;
  });
}

displayProducts(products);

document.getElementById("sort").addEventListener("change",function(){
  let sorted=[...products];
  if(this.value==="low"){
    sorted.sort((a,b)=>a.price-b.price);
  }
  if(this.value==="high"){
    sorted.sort((a,b)=>b.price-a.price);
  }
  displayProducts(sorted);
});

function applyFilter(){
  let min=document.getElementById("minPrice").value || 0;
  let max=document.getElementById("maxPrice").value || 10000;

  let filtered=products.filter(p=>p.price>=min && p.price<=max);
  displayProducts(filtered);
}

function addToCart(id){
  let cart=JSON.parse(localStorage.getItem("cart"))||[];
  let item=products.find(p=>p.id===id);
  cart.push({...item,qty:1});
  localStorage.setItem("cart",JSON.stringify(cart));
  alert("Added to Cart");
}

function addToWishlist(id){
  let wishlist=JSON.parse(localStorage.getItem("wishlist"))||[];
  let item=products.find(p=>p.id===id);
  wishlist.push(item);
  localStorage.setItem("wishlist",JSON.stringify(wishlist));
  alert("Added to Wishlist");
}