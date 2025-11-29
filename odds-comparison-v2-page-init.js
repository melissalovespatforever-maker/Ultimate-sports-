// ============================================
// ODDS COMPARISON V2 - PAGE INITIALIZATION
// Auto-initialize when odds comparison page is viewed
// ============================================

(function() {
    console.log('📊 Odds Comparison V2 Page Init loaded');
    
    let initialized = false;
    
    // Function to initialize odds comparison
    async function initOddsComparison() {
        if (initialized) {
            console.log('⚠️ Odds Comparison already initialized');
            return;
        }
        
        console.log('🎨 Initializing Odds Comparison V2...');
        
        try {
            // Wait for modules to be available
            if (typeof window.oddsUIV2 === 'undefined') {
                console.log('⏳ Waiting for odds UI module...');
                await new Promise(resolve => {
                    const checkInterval = setInterval(() => {
                        if (window.oddsUIV2) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                });
            }
            
            // Initialize the UI
            await window.oddsUIV2.init('odds-comparison-page');
            initialized = true;
            console.log('✅ Odds Comparison V2 initialized successfully!');
            
        } catch (error) {
            console.error('❌ Failed to initialize Odds Comparison:', error);
        }
    }
    
    // Check if we're on the odds comparison page
    function checkAndInit() {
        const oddsPage = document.getElementById('odds-comparison-page');
        if (oddsPage && oddsPage.classList.contains('active')) {
            initOddsComparison();
        }
    }
    
    // Watch for page changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const oddsPage = document.getElementById('odds-comparison-page');
                if (oddsPage && oddsPage.classList.contains('active') && !initialized) {
                    console.log('🔍 Odds Comparison page became active');
                    initOddsComparison();
                }
            }
        });
    });
    
    // Start observing when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const oddsPage = document.getElementById('odds-comparison-page');
            if (oddsPage) {
                observer.observe(oddsPage, { attributes: true });
                checkAndInit(); // Check immediately
            }
        });
    } else {
        const oddsPage = document.getElementById('odds-comparison-page');
        if (oddsPage) {
            observer.observe(oddsPage, { attributes: true });
            checkAndInit(); // Check immediately
        }
    }
    
    console.log('✅ Odds Comparison V2 page init ready');
})();
