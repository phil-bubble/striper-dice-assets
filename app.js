import DiceBox from "/striper-dice-assets/dice-box.es.min.js";

// Default configuration for the dice box
const defaultConfig = {
  assetPath: "/striper-dice-assets/assets/",
  theme: "default",
  offscreen: true,
  scale: 6,
  radius: 0.3,
  startingHeight: 8,
  throwForce: 6,
  gravity: 1,
  // Add worker configuration
  worker: {
    path: "/striper-dice-assets/world.offscreen.fixed.js",
    wasmPath: "/striper-dice-assets/assets/ammo/ammo.wasm.wasm"
  }
};

// Initialize DiceBox with container dimensions
let Box = new DiceBox("#dice-box", {
  ...defaultConfig,
  containerWidth: document.querySelector("#dice-box").clientWidth,
  containerHeight: document.querySelector("#dice-box").clientHeight
});

// Initialize the box and perform initial roll
Box.init().then(() => {
  console.log("Dice Box initialized successfully");
  Box.roll(["2d20"]);
});

// Handle theme changes
const themeSelector = document.getElementById("theme-selector");
themeSelector.addEventListener("change", async () => {
  const selectedTheme = themeSelector.value;
  console.log("Changing to theme:", selectedTheme);
  
  try {
    // Clean up old canvas
    const diceBox = document.querySelector("#dice-box");
    const oldCanvas = diceBox.querySelector("canvas");
    if (oldCanvas) oldCanvas.remove();

    // Create new box with updated theme
    const newBox = new DiceBox("#dice-box", {
      ...defaultConfig,
      theme: selectedTheme,
      meshName: selectedTheme === "rock" ? "smoothDice" : undefined,
      themeColor: document.getElementById("theme-color").value,
      containerWidth: diceBox.clientWidth,
      containerHeight: diceBox.clientHeight
    });

    await newBox.init();
    Box = newBox;
    console.log("Theme changed successfully to:", selectedTheme);
  } catch (error) {
    console.error("Error updating theme:", error);
  }
});

// Handle window resizing
window.addEventListener('resize', () => {
  const container = document.querySelector("#dice-box");
  Box.updateConfig({
    containerWidth: container.clientWidth,
    containerHeight: container.clientHeight
  });
});

// Handle dice rolling
const rollButton = document.getElementById("roll-dice");
const diceNotationInput = document.getElementById("dice-notation");
const themeColorInput = document.getElementById("theme-color");

rollButton.addEventListener("click", () => {
  const notation = diceNotationInput.value.trim();
  if (!notation) return;
  
  Box.roll([notation], {
    themeColor: themeColorInput.value
  });
});

// Handle theme color changes
themeColorInput.addEventListener("change", () => {
  Box.updateConfig({
    themeColor: themeColorInput.value
  });
});
