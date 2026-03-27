const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const imagesDir = path.join(rootDir, 'images');
const reelsDir = path.join(rootDir, 'reels');

// Helpers to get all files recursively
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

const allImageFiles = getAllFiles(imagesDir).map(f => f.slice(rootDir.length).replace(/\\/g, '/')).filter(f => !f.endsWith('.md'));
const allVideoFiles = getAllFiles(reelsDir).map(f => f.slice(rootDir.length).replace(/\\/g, '/')).filter(f => !f.endsWith('.md'));

console.log(`Found ${allImageFiles.length} images and ${allVideoFiles.length} videos locally.`);

// We only want to process HTML, JS, JSON files
function getSourceFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (file === 'node_modules' || file === '.git' || file === 'images' || file === 'reels' || file === 'css') {
      return;
    }
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getSourceFiles(fullPath, arrayOfFiles);
    } else {
      if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.css')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

const sourceFiles = getSourceFiles(rootDir);
console.log(`Found ${sourceFiles.length} source files to check.`);

const externalMediaRegex = /https?:\/\/(?:[a-zA-Z0-9.\-/_%?=]+?)(?:\.(?:jpg|jpeg|png|webp|gif|mp4|webm)|(?=[\s"'}]))/gi;
// Specifically targeting known external ones from search res.
const knownDomains = [
  'unsplash.com',
  'pexels.com',
  'googleapis.com/gtv-videos',
  'mixkit.co',
  'dummyimage.com',
  'placeholder.com'
];

let imagePointer = 0;
let videoPointer = 0;

function getRandomLocalImage() {
  const img = allImageFiles[imagePointer % allImageFiles.length];
  imagePointer++;
  return img;
}

function getRandomLocalVideo() {
  const vid = allVideoFiles[videoPointer % allVideoFiles.length];
  videoPointer++;
  return vid;
}

let modifiedFiles = 0;

sourceFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Find all URLs in the file
  const urlRegex = /https?:\/\/[a-zA-Z0-9.\-/_%?=&]+/g;
  
  content = content.replace(urlRegex, (match) => {
    // Check if it's an external media URL we want to replace
    const isKnownDomain = knownDomains.some(d => match.includes(d));
    const isImageExt = /\.(jpg|jpeg|png|webp|gif)/i.test(match) || match.includes('photo-');
    const isVideoExt = /\.(mp4|webm)/i.test(match) || match.includes('videos/preview');
    
    if (isKnownDomain || isImageExt || isVideoExt) {
       // Ignore generic links like tailwindcss, fontawesome, etc.
       if (match.includes('cdnjs.cloudflare.com') || match.includes('cdn.tailwindcss.com') || match.includes('fonts.googleapis.com') || match.includes('wa.me') || match.includes('facebook.com') || match.includes('twitter.com') || match.includes('instagram.com') || match.includes('googletagmanager.com')) {
           return match;
       }

       if (isVideoExt || match.includes('mixkit.co') || match.includes('gtv-videos-bucket')) {
           const replacement = getRandomLocalVideo();
           console.log(`[${path.basename(file)}] Replaced video: ${match} -> ${replacement}`);
           return replacement;
       } else {
           const replacement = getRandomLocalImage();
           console.log(`[${path.basename(file)}] Replaced image: ${match} -> ${replacement}`);
           return replacement;
       }
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
  }
});

console.log(`Modified ${modifiedFiles} files.`);
