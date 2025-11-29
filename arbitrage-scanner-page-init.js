// ============================================
// ARBITRAGE SCANNER PAGE INITIALIZATION
// Auto-initialize when page loads
// ============================================

(function() {
    console.log('🔍 Initializing Arbitrage Scanner Page...');
    
    // Wait for DOM and modules to be ready
    function initializeWhenReady() {
        // Check if page exists
        const arbitragePage = document.getElementById('arbitrage-page');
        if (!arbitragePage) {
            console.log('⏳ Arbitrage page not found, waiting...');
            setTimeout(initializeWhenReady, 100);
            return;
        }
        
        // Check if modules are loaded
        if (typeof ArbitrageScannerSystem === 'undefined' || typeof ArbitrageScannerUI === 'undefined') {
            console.log('⏳ Waiting for Arbitrage Scanner modules...');
            setTimeout(initializeWhenReady, 100);
            return;
        }
        
        // Check if scanner is already initialized
        if (arbitragePage.querySelector('.arbitrage-scanner')) {
            console.log('✅ Arbitrage Scanner already initialized');
            return;
        }
        
        console.log('🚀 Initializing Arbitrage Scanner...');
        
        // Clear placeholder content
        const placeholder = arbitragePage.querySelector('.content-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Create container
        const container = document.createElement('div');
        container.id = 'arbitrage-scanner-container';
        arbitragePage.appendChild(container);
        
        // Initialize system (use singleton)
        const scanner = window.arbitrageScanner;
        
        // Initialize UI
        const scannerUI = new ArbitrageScannerUI(scanner);
        scannerUI.initialize('arbitrage-scanner-container');
        
        // Store instances globally for debugging
        window.arbitrageScannerUI = scannerUI;
        
        console.log('✅ Arbitrage Scanner initialized successfully!');
        console.log('📊 Scanner System:', scanner);
        console.log('🎨 Scanner UI:', scannerUI);
        
        // Auto-start scanning if user visits the page (optional)
        // Uncomment to enable auto-start:
        // scanner.startScanning();
    }
    
    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWhenReady);
    } else {
        initializeWhenReady();
    }
})();
