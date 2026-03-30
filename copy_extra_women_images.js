const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\14ef91fc-510b-44e1-ada6-c69980890f51';
const destBaseDir = 'c:\\Users\\Lenovo\\Desktop\\shopera-project\\images\\women';

const filesToMove = [
  { sub: 'jeans', file: 'women_jeans_1_1774863773731.png' },
  { sub: 'kurti', file: 'women_kurti_1_1774863790316.png' },
  { sub: 'saree', file: 'women_saree_1_1774863807182.png' }
];

filesToMove.forEach(item => {
  const destDir = path.join(destBaseDir, item.sub);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const destPath = path.join(destDir, item.file);
  fs.copyFileSync(path.join(srcDir, item.file), destPath);
  console.log('Copied to ' + destPath);
});
