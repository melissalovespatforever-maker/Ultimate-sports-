// ============================================
// PARLAY OPTIMIZER AI - PAGE INITIALIZATION
// Auto-initialize when parlay builder page is viewed
// ============================================

(function() {
    console.log('🤖 Parlay Optimizer AI Page Init loaded');
    
    let initialized = false;
    
    // Function to initialize parlay optimizer
    async function initParlayOptimizer() {
        if (initialized) {
            console.log('⚠️ Parlay Optimizer already initialized');
            return;
        }
        
        console.log('🎨 Initializing Parlay Optimizer AI...');
        
        try {
            // Wait for modules to be available
            if (typeof window.parlayAIUI === 'undefined') {
                console.log('⏳ Waiting for parlay AI UI module...');
                await new Promise(resolve => {
                    const checkInterval = setInterval(() => {
                        if (window.parlayAIUI) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                    
                    // Timeout after 10 seconds
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        console.error('❌ Timeout waiting for parlay AI UI');
                        resolve();
                    }, 10000);
                });
            }
            
            // Initialize the UI
            if (window.parlayAIUI) {
                await window.parlayAIUI.init('parlay-builder-page');
                initialized = true;
                console.log('✅ Parlay Optimizer AI initialized successfully!');
            } else {
                console.error('❌ Parlay AI UI not available');
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize Parlay Optimizer:', error);
        }
    }
    
    // Check if we're on the parlay builder page
    function checkAndInit() {
        const parlayPage = document.getElementById('parlay-builder-page');
        if (parlayPage && parlayPage.classList.contains('active')) {
            initParlayOptimizer();
        }
    }
    
    // Watch for page changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const parlayPage = document.getElementById('parlay-builder-page');
                if (parlayPage && parlayPage.classList.contains('active') && !initialized) {
                    console.log('🔍 Parlay Builder page became active');
                    initParlayOptimizer();
                }
            }
        });
    });
    
    // Start observing when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const parlayPage = document.getElementById('parlay-builder-page');
            if (parlayPage) {
                observer.observe(parlayPage, { attributes: true });
                checkAndInit(); // Check immediately
            }
        });
    } else {
        const parlayPage = document.getElementById('parlay-builder-page');
        if (parlayPage) {
            observer.observe(parlayPage, { attributes: true });
            checkAndInit(); // Check immediately
        }
    }
    
    console.log('✅ Parlay Optimizer AI page init ready');
})();
