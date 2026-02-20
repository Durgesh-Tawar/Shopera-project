const productGrid = document.getElementById("productGrid");
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const searchBar = document.getElementById("searchBar");
const tabBtns = document.querySelectorAll(".tab-btn");

products.forEach(p=>{
    const div = document.createElement("div");
    div.classList.add("product-card");
    div.innerHTML = `<img src="${p.image}" alt="${p.name}">
                     <h3>${p.name}</h3>
                     <p>₹${p.price}</p>
                     <button onclick="addToCart(${p.id})">Add to Cart</button>`;
    productGrid.appendChild(div);
});

function addToCart(id){
    const product = products.find(p => p.id===id);
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
}



// Render products function
function renderProducts(filter="all", search=""){
    productGrid.innerHTML = "";
    let filtered = products.filter(p => {
        let catMatch = (filter==="all") ? true : p.category === filter;
        let searchMatch = p.name.toLowerCase().includes(search.toLowerCase());
        return catMatch && searchMatch;
    });

    filtered.forEach(p=>{
        const div = document.createElement("div");
        div.classList.add("product-card");
        div.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>₹${p.price}</p>
            <button onclick="addToCart(${p.id})">Add to Cart</button>
        `;
        productGrid.appendChild(div);
    });
}

// Add to Cart
function addToCart(id){
    const product = products.find(p => p.id === id);
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
}

// Category Tabs click
tabBtns.forEach(btn=>{
    btn.addEventListener("click", ()=>{
        tabBtns.forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        renderProducts(btn.dataset.category, searchBar.value);
    });
});

// Search input
searchBar.addEventListener("input", ()=>{
    let activeCat = document.querySelector(".tab-btn.active").dataset.category;
    renderProducts(activeCat, searchBar.value);
});

// Initial render
renderProducts();
