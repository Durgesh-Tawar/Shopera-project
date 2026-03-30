const fs = require('fs');

const dataContent = fs.readFileSync('js/data.js', 'utf8');
const jsonString = dataContent.replace('window.products = ', '').replace(/;\s*$/, '');
let products;
try {
    products = JSON.parse(jsonString);
} catch (e) {
    // If JSON parse fails because of unquoted keys or something, we can use eval
    products = eval(jsonString);
}

const menProducts = products.filter(p => p.category === 'men');
console.log(`Total Men's Products: ${menProducts.length}`);

let summary = {};
menProducts.forEach(p => {
    if (!summary[p.subcategory]) summary[p.subcategory] = [];
    summary[p.subcategory].push({ id: p.id, name: p.name, image: p.image });
});

for (const [subcat, items] of Object.entries(summary)) {
    console.log(`\n--- Subcategory: ${subcat} (${items.length} items) ---`);
    items.forEach(item => {
        console.log(`ID ${item.id} | ${item.name} | ${item.image}`);
    });
}
