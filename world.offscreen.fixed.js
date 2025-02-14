// Original worker code with URL fix
self.onmessage = function(e) {
    const { wasmPath, ...config } = e.data;
    
    // Use the wasmPath directly without concatenating location.origin
    fetch(wasmPath)
        .then(response => response.arrayBuffer())
        .then(buffer => {
            // Initialize Ammo.js with the WebAssembly binary
            return new Promise((resolve) => {
                self.Ammo = new Function(new TextDecoder('utf-8').decode(buffer))();
                self.Ammo().then(() => resolve());
            });
        })
        .then(() => {
            // Send success message back to main thread
            self.postMessage({ type: 'init_complete' });
        })
        .catch(error => {
            console.error('Error loading WebAssembly:', error);
            self.postMessage({ type: 'init_error', error: error.message });
        });
};
