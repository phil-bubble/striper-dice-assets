// Original worker code with URL fix and logging
self.onmessage = function(e) {
    const { wasmPath, ...config } = e.data;
    
    console.log('[Worker] Attempting to load WebAssembly from:', wasmPath);
    
    // Use the wasmPath directly without concatenating location.origin
    fetch(wasmPath)
        .then(response => {
            console.log('[Worker] WebAssembly fetch response status:', response.status);
            return response.arrayBuffer();
        })
        .then(buffer => {
            console.log('[Worker] WebAssembly buffer loaded, size:', buffer.byteLength);
            // Initialize Ammo.js with the WebAssembly binary
            return new Promise((resolve) => {
                console.log('[Worker] Initializing Ammo.js...');
                self.Ammo = new Function(new TextDecoder('utf-8').decode(buffer))();
                self.Ammo().then(() => {
                    console.log('[Worker] Ammo.js initialized successfully!');
                    resolve();
                });
            });
        })
        .then(() => {
            // Send success message back to main thread
            console.log('[Worker] Sending init_complete message to main thread');
            self.postMessage({ type: 'init_complete' });
        })
        .catch(error => {
            console.error('[Worker] Error loading WebAssembly:', error);
            self.postMessage({ type: 'init_error', error: error.message });
        });
};
