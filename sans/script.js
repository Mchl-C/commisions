// --- 1. CONFIGURATION (Global) ---
const ZONE_NAMES = {
    '1': 'Blue Sea (Area I)',
    '2': 'Alabasta (Area II)',
    '3': 'Dressrosa (Area III)',
    '4': 'Water 7 (Area IV)',
    '5': 'Sabaody Archipelago (Area V)',
    '6': 'Marineford (Area VI)',
    '7': 'Punk Hazard (Area VII)',
    '8': 'Wano Country (Area VIII)',
    '9': 'Laugh Tale (Area IX)'
};

// --- 2. DOM ELEMENTS ---
const mapLayer = document.getElementById('mapLayer');
const oceanLayer = document.getElementById('oceanLayer');
const mapContainer = document.querySelector('.map-container');
const ship = document.getElementById('playerShip');
const bottleGrid = document.getElementById('bottleGrid');
const addBtn = document.getElementById('addBtn');

// --- 3. WORLD MAP LOGIC ---

function initWorldMap() {
    const existingSpots = mapContainer.querySelectorAll('.map-spot');
    existingSpots.forEach(spot => spot.remove());

    const zones = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
    const placedSpots = [];
    
    // 1. Get exact container dimensions
    const rect = mapContainer.getBoundingClientRect();
    const mapW = rect.width;
    const mapH = rect.height;

    // 2. Dynamic Ship Center
    ship.style.left = (mapW / 2 - 30) + 'px'; 
    ship.style.top = (mapH / 2 - 30) + 'px';

    zones.forEach((roman, index) => {
        const zoneId = (index + 1).toString();
        const spot = document.createElement('div');
        spot.className = 'map-spot';
        spot.innerText = roman;
        
        let x, y, overlapping, inDeadZone;
        let attempts = 0;
        const padding = 50; 
        
        do {
            overlapping = false;
            inDeadZone = false;

            // Generate random coordinates based on CURRENT screen size
            x = Math.random() * (mapW - padding * 2) + padding; 
            y = Math.random() * (mapH - padding * 2) + padding;
            
            // --- DEAD ZONE LOGIC ---
            // If Y is in the top 20% of the container, it's in the "Title Area"
            // We also check if X is in the middle 40% (where the text usually sits)
            if (y < (mapH * 0.25)) { 
                if (x > (mapW * 0.35) && x < (mapW * 0.65)) {
                    inDeadZone = true;
                }
            }

            // --- COLLISION LOGIC ---
            for (let p of placedSpots) {
                const dist = Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2));
                const minSpace = mapW < 600 ? 70 : 110; // Tighter spacing for mobile
                if (dist < minSpace) overlapping = true; 
            }
            
            attempts++;
        } while ((overlapping || inDeadZone) && attempts < 150);
        
        placedSpots.push({x, y});
        
        spot.style.left = (x - 30) + 'px';
        spot.style.top = (y - 30) + 'px';
        
        spot.onclick = () => {
            sailTo(x, y, zoneId); 
            // Focus effect handled by CSS
        };
        
        mapContainer.appendChild(spot);
    });
}

function sailTo(targetX, targetY, zoneId) {
    const startX = ship.offsetLeft + (ship.offsetWidth / 2);
    const startY = ship.offsetTop + (ship.offsetHeight / 2);
    const dx = targetX - startX;
    const dy = targetY - startY;
    
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    ship.style.transform = `rotate(${angle}deg)`;
    ship.style.left = (targetX - (ship.offsetWidth / 2)) + 'px';
    ship.style.top = (targetY - (ship.offsetHeight / 2)) + 'px';
    
    setTimeout(() => enterOcean(zoneId), 2000);
}

function enterOcean(zoneId) {
    localStorage.setItem('currentZone', zoneId);
    
    // Efficiently use the global constant
    const subTitle = document.getElementById('oceanSubtitle');
    if(subTitle) subTitle.innerText = ZONE_NAMES[zoneId] || `Ocean Area ${zoneId}`;

    mapLayer.style.opacity = '0';
    setTimeout(() => {
        mapLayer.style.display = 'none';
        oceanLayer.style.display = 'flex';
        oceanLayer.offsetWidth; 
        oceanLayer.style.opacity = '1';
        fetchMessages(zoneId); 
    }, 1000);
}

window.backToMap = function() {
    window.history.pushState({}, document.title, window.location.pathname);
    oceanLayer.style.opacity = '0';
    setTimeout(() => {
        oceanLayer.style.display = 'none';
        mapLayer.style.display = 'flex';
        mapLayer.style.opacity = '1';
    }, 500);
};

// --- 4. BOTTLE OCEAN LOGIC ---

function checkReturnMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'ocean') {
        mapLayer.style.display = 'none'; 
        oceanLayer.style.display = 'flex';
        oceanLayer.style.opacity = '1';

        const lastZone = localStorage.getItem('currentZone') || '1';
        
        // Efficiently use the global constant again
        const subTitle = document.getElementById('oceanSubtitle');
        if(subTitle) subTitle.innerText = ZONE_NAMES[lastZone] || `Ocean Area ${lastZone}`;

        fetchMessages(lastZone);
    }
}

function fetchMessages(zoneId = 1) {
    const storageKey = `bottlePositions_zone_${zoneId}`;
    
    // Clear storage on manual refresh
    if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
        sessionStorage.removeItem(storageKey);
    }

    console.log(`Zone id: ${zoneId}`);
    fetch(`process.php?zone=${zoneId}`) 
        .then(response => response.json())
        .then(data => {
            bottleGrid.innerHTML = '';
            const savedPositions = JSON.parse(sessionStorage.getItem(storageKey));
            const containerW = bottleGrid.clientWidth;
            const containerH = bottleGrid.clientHeight;
            const bottlePositions = [];

            // Inside fetchMessages()...
            data.forEach((msg, index) => {
                const bottleDiv = document.createElement('div');
                bottleDiv.className = 'bottle';
                console.log(msg, index);

                let x, y, rotation;
                let overlapping = false;
                let attempts = 0;

                // --- 1. COLLISION & RANDOMIZATION LOGIC ---
                // If we have a saved position, use it. Otherwise, find a new empty spot.
                if (savedPositions && savedPositions[index]) {
                    x = savedPositions[index].x;
                    y = savedPositions[index].y;
                    flip = savedPositions[index].flip;
                } else {
                    do {
                        overlapping = false;
                        // Your randomization boundaries
                        x = Math.random() * (containerW - 150);
                        y = Math.random() * (containerH - 250);
                        
                        // Check distance against ALL previously placed bottles
                        for (let other of bottlePositions) {
                            const distance = Math.sqrt(Math.pow(x - other.x, 2) + Math.pow(y - other.y, 2));
                            if (distance < 100) { // Ensure at least 80px gap between bottles
                                overlapping = true;
                                break;
                            }
                        }
                        attempts++;
                    } while (overlapping && attempts < 100); // Prevent infinite loop if screen is full
                    
                    flip = Math.random() < 0.5 ? 1 : -1;
                }

                // Save this position for the next bottle to check against
                bottlePositions.push({ x, y, rotation });

                bottleDiv.style.left = `${x}px`;
                bottleDiv.style.top = `${y}px`;
                // Add a random animation delay so they don't move in sync
                const delay = (Math.random() * 3).toFixed(2);
                bottleDiv.innerHTML = `
                    <div style="transform: scaleX(${flip})">
                        <img src="assets/bottle.png?v=2" class="bottle-img" style="animation-delay: ${delay}s">
                    </div>`;

                // --- 2. FIXING THE "WRONG ZONE" BUG ---
                // DO NOT use 'index'. Use 'msg.original_id' which comes from your process.php
                bottleDiv.onclick = () => { 
                    window.location.href = `view.php?id=${msg.original_id}`; 
                };

                bottleGrid.appendChild(bottleDiv);
            });
            sessionStorage.setItem(storageKey, JSON.stringify(bottlePositions));
        });
}
// --- 5. EXECUTION ---
document.addEventListener('DOMContentLoaded', () => {
    initWorldMap();
    checkReturnMode();
});

// Re-draw the map when the window is resized to keep everything in view
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Only re-init if the map layer is actually visible
        if (mapLayer.style.display !== 'none') {
            initWorldMap();
        }
    }, 250); // Debounce to prevent lag
});

// Add this to your script.js to make the button work
if (addBtn) {
    addBtn.onclick = () => {
        window.location.href = 'compose.html';
    };
}