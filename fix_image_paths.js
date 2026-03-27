const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const imagesDir = path.join(rootDir, 'images');

const filePaths = {
    server: path.join(rootDir, 'server.js'),
    data: path.join(rootDir, 'js', 'data.js'),
    orders: path.join(rootDir, 'orders.json')
};

// Logical mapping mapping keywords to local image directories
function getRelevantImageInfo(category, name) {
    const lName = name.toLowerCase();
    
    if (category === 'men') {
        if (lName.includes('shirt') && !lName.includes('t-shirt') && !lName.includes('tee')) return 'images/men/shirt/shirt1.jpg';
        if (lName.includes('t-shirt') || lName.includes('tee')) return 'images/men/t-shirt/t-shirt1.jpg';
        if (lName.includes('jeans')) return 'images/men/jeans/jeans1.jpg';
        if (lName.includes('blazer') || lName.includes('jacket') || lName.includes('coat')) return 'images/men/jacket/jacket1.jpg';
        if (lName.includes('belt') || lName.includes('accessory')) return 'images/men/accessories/1.jpg'; // We'll fallback to something if not exist
        if (lName.includes('trouser')) return 'images/men/jeans/jeans2.jpg';
        return 'images/men/shirt/shirt2.jpg';
    } 
    else if (category === 'women') {
        if (lName.includes('dress') || lName.includes('gown')) return 'images/women/kurti/kurti1.jpg';
        if (lName.includes('jeans')) return 'images/women/jeans/jeans1.jpg';
        if (lName.includes('saree')) return 'images/women/saree/saree1.jpg';
        if (lName.includes('top') || lName.includes('blouse')) return 'images/women/tops/top1.jpg';
        if (lName.includes('skirt')) return 'images/women/jeans/jeans2.jpg';
        if (lName.includes('sweater')) return 'images/women/tops/top2.jpg';
        if (lName.includes('bag') || lName.includes('handbag')) return 'images/women/tops/top3.jpg';
        return 'images/women/kurti/kurti2.jpg';
    }
    else if (category === 'kids') {
        if (lName.includes('frock') || lName.includes('girl') || lName.includes('dress')) return 'images/kids/girl/girl1.jpg';
        if (lName.includes('set') || lName.includes('suit')) return 'images/kids/boy/boy1.jpg';
        if (lName.includes('t-shirt') || lName.includes('top')) return 'images/kids/boy/boy2.jpg';
        if (lName.includes('shoe')) return 'images/kids/boy/boy3.jpg';
        if (lName.includes('jacket')) return 'images/kids/boy/boy4.jpg';
        if (lName.includes('kurti')) return 'images/kids/girl/girl2.jpg';
        return 'images/kids/baby/baby1.jpg'; // fallback
    }
    
    // Default fallback
    return 'images/men/shirt/shirt1.jpg';
}

function processFileContent(content) {
    // We want to reliably replace `image: "/images/..."` or `image: "images/..."` with correct mapped one
    // We can do this safely by parsing line by line, or using regex for the object definition.
    // It's safer to use a regex because the format is pretty standard in data.js and server.js.
    
    const productRegex = /{id:(\d+),\s*name:"([^"]+)",\s*price:\d+,\s*image:"([^"]+)",\s*category:"([^"]+)"/g;
    
    let newContent = content.replace(productRegex, (match, id, name, oldImg, category) => {
        let newImg = getRelevantImageInfo(category, name);
        // reconstruct the match up to the image part
        const startToImg = match.substring(0, match.indexOf(`image:"${oldImg}"`));
        const afterImg = match.substring(match.indexOf(`image:"${oldImg}"`) + `image:"${oldImg}"`.length);
        
        return `${startToImg}image:"${newImg}"${afterImg}`;
    });
    
    return newContent;
}

function updateJsonContent(jsonStr) {
    let data;
    try {
        data = JSON.parse(jsonStr);
    } catch(e) {
        return jsonStr;
    }
    
    // orders.json is an array of orders.
    // Each order has an 'items' array. Each item has category and name.
    if (Array.isArray(data)) {
        data.forEach(order => {
            if (Array.isArray(order.items)) {
                order.items.forEach(item => {
                    if (item.name && item.category) {
                        item.image = getRelevantImageInfo(item.category, item.name);
                    }
                });
            }
        });
    }
    return JSON.stringify(data, null, 2);
}

// 1. Process server.js
if (fs.existsSync(filePaths.server)) {
    let content = fs.readFileSync(filePaths.server, 'utf8');
    let newContent = processFileContent(content);
    fs.writeFileSync(filePaths.server, newContent, 'utf8');
    console.log("Updated server.js");
}

// 2. Process js/data.js
if (fs.existsSync(filePaths.data)) {
    let content = fs.readFileSync(filePaths.data, 'utf8');
    let newContent = processFileContent(content);
    fs.writeFileSync(filePaths.data, newContent, 'utf8');
    console.log("Updated data.js");
}

// 3. Process orders.json
if (fs.existsSync(filePaths.orders)) {
    let content = fs.readFileSync(filePaths.orders, 'utf8');
    let newContent = updateJsonContent(content);
    fs.writeFileSync(filePaths.orders, newContent, 'utf8');
    console.log("Updated orders.json");
}

console.log("Image mapping complete! All paths should now intelligently point to local images without leading slashes.");
