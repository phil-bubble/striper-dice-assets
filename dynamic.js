import DiceBox from "/dice-box.es.min.js";

// Base URL for all assets
const BASE_URL = "/";

// Test container for asset loading verification
console.log('[Main] Testing asset loading...');
const testContainer = document.createElement('div');
testContainer.style.position = 'fixed';
testContainer.style.top = '10px';
testContainer.style.right = '10px';
testContainer.style.padding = '10px';
testContainer.style.background = 'white';
testContainer.style.border = '1px solid #ccc';
testContainer.innerHTML = `
  <p>Asset Test:</p>
  <div style="display: flex; flex-direction: column; gap: 10px;">
    <img src="${BASE_URL}assets/themes/default/normal.png" 
         alt="Test Asset" 
         style="width: 100px; height: 100px; object-fit: contain;"
         onerror="this.style.border='2px solid red'; console.error('Failed to load normal.png')"
         onload="this.style.border='2px solid green'; console.log('Successfully loaded normal.png')"
    >
  </div>
`;
document.body.appendChild(testContainer);

// Create a data URL for the worker with the correct base URL
const workerCode = `
self.BASE_URL = "${BASE_URL}";
importScripts("${BASE_URL}world.offscreen.fixed.js");
`;
const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(workerBlob);

// Create configuration object
const config = {
  container: "#dice-box",
  theme: "default",
  scale: 6,
  gravity: 1,
  mass: 1,
  throwForce: 6,
  inertia: 1,
  linearDamping: 0.5,
  angularDamping: 0.5,
  segments: 40,
  
  // Asset configuration
  assetPath: "/assets/",
  
  // Worker configuration with data URL
  worker: {
    enabled: true,
    path: workerUrl,
    wasmPath: "/assets/ammo/ammo.wasm.wasm"
  }
};

// Initialize the dice box
console.log('[Main] Creating DiceBox...');
const diceBoxContainer = document.querySelector("#dice-box");
const box = new DiceBox({
  ...config,
  width: diceBoxContainer.clientWidth,
  height: diceBoxContainer.clientHeight
});

// Initialize the renderer
console.log('[Main] Initializing DiceBox...');
box.init().then(() => {
  console.log("[Main] DiceBox initialized successfully!");
  
  // Add event listener for the roll button
  document.getElementById('roll-button')?.addEventListener('click', () => {
    const notation = document.getElementById('dice-notation')?.value || '2d6';
    box.roll(notation);
  });
  
  // Perform initial roll
  box.roll('2d6');
}).catch(error => {
  console.error('[Main] Error initializing DiceBox:', error);
});

// Handle theme changes
document.getElementById("theme-selector")?.addEventListener("change", async () => {
  const selectedTheme = document.getElementById("theme-selector").value;
  console.log("Changing to theme:", selectedTheme);
  
  try {
    // Clean up old canvas
    const diceBox = document.querySelector("#dice-box");
    const oldCanvas = diceBox.querySelector("canvas");
    if (oldCanvas) oldCanvas.remove();

    // Create new box with updated theme
    const newBox = new DiceBox({
      ...config,
      theme: selectedTheme,
      width: diceBox.clientWidth,
      height: diceBox.clientHeight
    });

    await newBox.init();
    newBox.roll('2d6');
  } catch (error) {
    console.error("Error changing theme:", error);
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  const container = document.querySelector("#dice-box");
  box.updateConfig({
    width: container.clientWidth,
    height: container.clientHeight
  });
});

// Clean up worker URL when page unloads
window.addEventListener('unload', () => {
  URL.revokeObjectURL(workerUrl);
});
