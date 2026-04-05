// Virtual Try-On Logic
const vtoStyles = `
/* Virtual Try-On Button Details */
.try-on-btn {
    flex: 1; min-width: 140px; padding: 12px 24px;
    background: linear-gradient(45deg, #a855f7, #c084fc);
    border: none; border-radius: 10px; color: white;
    font-size: 15px; font-weight: 600; cursor: pointer;
    transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
}
.try-on-btn:hover { background: linear-gradient(45deg, #9333ea, #a855f7); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(168, 85, 247, 0.5); }
.vto-modal {
    display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8); z-index: 10000; justify-content: center; align-items: center; backdrop-filter: blur(5px);
}
.vto-content {
    background: white; width: 90%; max-width: 900px; border-radius: 20px; padding: 30px;
    position: relative; box-shadow: 0 25px 50px rgba(0,0,0,0.3);
}
.vto-close { position: absolute; top: 15px; right: 20px; font-size: 30px; color: #666; cursor: pointer; }
.vto-layout { display: flex; gap: 30px; margin-top: 20px; }
.vto-controls-panel { width: 300px; display: flex; flex-direction: column; gap: 20px; }
.vto-upload-btn, .vto-control-btn {
    background: #ff3f6c; color: white; padding: 15px; border-radius: 10px;
    text-align: center; cursor: pointer; font-weight: 600; border: none; transition: background 0.3s;
}
.vto-upload-btn:hover, .vto-control-btn:hover { background: #e6365a; }
.vto-canvas-container {
    flex: 1; background: #f0f0f5; border-radius: 15px; position: relative;
    overflow: hidden; min-height: 500px; display: flex; align-items: center; justify-content: center; border: 2px dashed #ccc;
}
.vto-user-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 1; }
.vto-product-img {
    position: absolute; width: 250px; z-index: 2; cursor: grab; mix-blend-mode: multiply; transform-origin: center;
}
.vto-product-img:active { cursor: grabbing; }
.vto-slider-group { background: #f9f9fa; padding: 15px; border-radius: 10px; }
.vto-slider-group label { display: block; font-weight: 600; margin-bottom: 5px; color: #333; }
.vto-slider-group input { width: 100%; cursor: pointer; }
.vto-instructions { color: #888; font-weight: 500; z-index: 0; text-align: center; padding: 20px; }
@media (max-width: 768px) {
    .vto-layout { flex-direction: column; }
    .vto-controls-panel { width: 100%; }
    .vto-canvas-container { min-height: 400px; }
}
`;

const vtoHTML = `
<!-- Virtual Try-On Modal -->
<div id="vtoModal" class="vto-modal">
    <div class="vto-content">
        <span class="vto-close" onclick="closeVirtualTryOn()">&times;</span>
        <h2 style="font-size:1.8rem; color:#1a1a2e">🪄 Virtual Try-On Room</h2>
        <div class="vto-layout">
            <div class="vto-controls-panel">
                <p style="color:#666; font-size:0.95rem; line-height:1.5;">See how this product looks on you! Upload a photo where you are facing forward.</p>
                <label class="vto-upload-btn">
                    📸 Upload Your Photo
                    <input type="file" id="vtoPhotoUpload" accept="image/*" style="display:none;" onchange="handleVTOUpload(event)">
                </label>
                <div style="height:1px; background:#eaeaec; margin:10px 0;"></div>
                <div class="vto-slider-group">
                    <label>Scale / Size</label>
                    <input type="range" id="vtoScale" min="0.3" max="3" step="0.05" value="1" oninput="updateVTOTransform()">
                </div>
                <div class="vto-slider-group">
                    <label>Rotation</label>
                    <input type="range" id="vtoRotate" min="-180" max="180" step="1" value="0" oninput="updateVTOTransform()">
                </div>
                <button class="vto-control-btn" style="background:#282c3f;" onclick="resetVTO()">🔄 Reset Position</button>
            </div>
            <div class="vto-canvas-container" id="vtoCanvasContainer">
                <div id="vtoInstructions" class="vto-instructions">Your photo will appear here</div>
                <img id="vtoUserBg" class="vto-user-bg" style="display:none;">
                <img id="vtoProductImg" class="vto-product-img" style="display:none;">
            </div>
        </div>
    </div>
</div>
`;

// Inject into DOM
document.addEventListener("DOMContentLoaded", () => {
    // Inject Styles
    const styleEl = document.createElement("style");
    styleEl.innerHTML = vtoStyles;
    document.head.appendChild(styleEl);

    // Inject HTML
    document.body.insertAdjacentHTML('beforeend', vtoHTML);

    // Setup Drag Events
    setupVTODrag();
});

let vtoX = 0;
let vtoY = 0;
let vtoScale = 1;
let vtoRotate = 0;
let isDragging = false;
let startX, startY;

function openVirtualTryOn() {
    if (!product || !product.image) {
        showToast("Please wait for product to load.");
        return;
    }
    
    document.getElementById('vtoModal').style.display = 'flex';
    
    // Process product image to remove white background
    document.getElementById('vtoInstructions').textContent = "Processing product image...";
    removeWhiteBackground(product.image, (transparentImageSrc) => {
        document.getElementById('vtoProductImg').src = transparentImageSrc;
        document.getElementById('vtoProductImg').style.mixBlendMode = 'normal'; // Use normal blending now!
        
        // Hide until photo uploaded
        document.getElementById('vtoProductImg').style.display = 'none'; 
        document.getElementById('vtoInstructions').textContent = "Upload a photo to begin your try-on session!";
        
        // Check if user previously uploaded a photo in session
        const cachedPhoto = sessionStorage.getItem('vtoUserPhoto');
        if (cachedPhoto) {
            document.getElementById('vtoUserBg').src = cachedPhoto;
            document.getElementById('vtoUserBg').style.display = 'block';
            document.getElementById('vtoProductImg').style.display = 'block';
            document.getElementById('vtoInstructions').style.display = 'none';
        }
        
        resetVTO();
    });
}

function removeWhiteBackground(imageSrc, callback) {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Prevent canvas tainting if external
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Sample the top-left pixel as the background color
            const bgR = data[0];
            const bgG = data[1];
            const bgB = data[2];
            const tolerance = 35; // Tolerance for slight background gradients
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];
                
                // If pixel is very close to the background color
                if (Math.abs(r - bgR) < tolerance && 
                    Math.abs(g - bgG) < tolerance && 
                    Math.abs(b - bgB) < tolerance) {
                    
                    data[i+3] = 0; // Make transparent
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            callback(canvas.toDataURL('image/png'));
        } catch (e) {
            console.error("Canvas error, returning original", e);
            callback(imageSrc);
        }
    };
    img.onerror = () => callback(imageSrc);
    img.src = imageSrc;
}

function closeVirtualTryOn() {
    document.getElementById('vtoModal').style.display = 'none';
}

function handleVTOUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('vtoUserBg').src = e.target.result;
            document.getElementById('vtoUserBg').style.display = 'block';
            document.getElementById('vtoProductImg').style.display = 'block';
            document.getElementById('vtoInstructions').style.display = 'none';
            
            // Cache to session storage (might fail if image is huge, but we can try)
            try {
                sessionStorage.setItem('vtoUserPhoto', e.target.result);
            } catch (err) {
                console.warn("Storage full", err);
            }

            resetVTO();
        };
        reader.readAsDataURL(file);
    }
}

function resetVTO() {
    vtoX = 0;
    vtoY = 0;
    vtoScale = 1.5; // Default bit bigger
    vtoRotate = 0;
    
    document.getElementById('vtoScale').value = vtoScale;
    document.getElementById('vtoRotate').value = vtoRotate;
    
    updateVTOTransform();
}

function updateVTOTransform() {
    vtoScale = parseFloat(document.getElementById('vtoScale').value);
    vtoRotate = parseInt(document.getElementById('vtoRotate').value);
    
    const img = document.getElementById('vtoProductImg');
    img.style.transform = `translate(calc(-50% + ${vtoX}px), calc(-50% + ${vtoY}px)) scale(${vtoScale}) rotate(${vtoRotate}deg)`;
    
    // We center the image absolutely, then apply translates
    img.style.left = '50%';
    img.style.top = '50%';
}

function setupVTODrag() {
    const img = document.getElementById('vtoProductImg');
    const container = document.getElementById('vtoCanvasContainer');

    const startDrag = (e) => {
        isDragging = true;
        // Handle touch or mouse
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        
        startX = clientX - vtoX;
        startY = clientY - vtoY;
        e.preventDefault(); // Prevent default dragging
    };

    const onDrag = (e) => {
        if (!isDragging) return;
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        
        vtoX = clientX - startX;
        vtoY = clientY - startY;
        updateVTOTransform();
    };

    const endDrag = () => {
        isDragging = false;
    };

    img.addEventListener('mousedown', startDrag);
    img.addEventListener('touchstart', startDrag, {passive: false});

    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag, {passive: false});

    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
}
