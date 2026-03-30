const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const newImages = {
  'kurti1.jpg': 'women_kurti_1_1774863790316.png',
  'kurti2.jpg': 'women_kurti_1_1774863790316.png',
  'saree1.jpg': 'women_saree_1_1774863807182.png',
  'saree2.jpg': 'women_saree_1_1774863807182.png',
  'jeans1.jpg': 'women_jeans_1_1774863773731.png',
  'jeans2.jpg': 'women_jeans_1_1774863773731.png',
  'top1.jpg': 'women_top_1_1774862955784.png',
  'top2.jpg': 'women_top_2_1774862982437.png'
};

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  for (const [oldName, newName] of Object.entries(newImages)) {
    const kurtiReg = new RegExp(`images/women/kurti/${oldName}`, 'g');
    if (content.match(kurtiReg)) {
       content = content.replace(kurtiReg, `images/women/kurti/${newName}`);
       changed = true;
    }
    
    const sareeReg = new RegExp(`images/women/saree/${oldName}`, 'g');
    if (content.match(sareeReg)) {
       content = content.replace(sareeReg, `images/women/saree/${newName}`);
       changed = true;
    }

    const jeansReg = new RegExp(`images/women/jeans/${oldName}`, 'g');
    if (content.match(jeansReg)) {
       content = content.replace(jeansReg, `images/women/jeans/${newName}`);
       changed = true;
    }

    const topsReg = new RegExp(`images/women/tops/${oldName}`, 'g');
    if (content.match(topsReg)) {
       content = content.replace(topsReg, `images/women/tops/${newName}`);
       changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(f, content);
    console.log('Updated hardcoded images in ' + f);
  }
});
