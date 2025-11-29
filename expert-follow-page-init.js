// ============================================
// EXPERT FOLLOW PAGE INITIALIZATION
// Auto-loads expert follow UI when social page is active
// ============================================

(() => {
    console.log('🎯 Expert Follow Page Init loaded');
    
    let expertFollowUI = null;
    
    // Initialize expert follow system when page becomes active
    const initExpertFollow = async () => {
        console.log('🎯 Initializing Expert Follow UI...');
        
        const container = document.getElementById('social-page');
        if (!container) {
            console.warn('⚠️ Social page container not found');
            return;
        }
        
        // Clear existing content
        container.innerHTML = '<div id="expert-follow-container"></div>';
        
        // Wait for ExpertFollowUI to be available
        if (typeof window.ExpertFollowUI === 'undefined') {
            console.log('⏳ Waiting for ExpertFollowUI...');
            setTimeout(initExpertFollow, 500);
            return;
        }
        
        // Create UI instance
        try {
            expertFollowUI = new window.ExpertFollowUI({
                container: document.getElementById('expert-follow-container')
            });
            
            console.log('✅ Expert Follow UI initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Expert Follow UI:', error);
        }
    };
    
    // Watch for page activation
    const observePageActivation = () => {
        const socialPage = document.getElementById('social-page');
        if (!socialPage) {
            console.log('⏳ Waiting for social page element...');
            setTimeout(observePageActivation, 500);
            return;
        }
        
        // Initialize immediately if page is already active
        if (socialPage.classList.contains('active')) {
            initExpertFollow();
        }
        
        // Watch for class changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (socialPage.classList.contains('active') && !expertFollowUI) {
                        initExpertFollow();
                    }
                }
            });
        });
        
        observer.observe(socialPage, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        console.log('👀 Watching for social page activation');
    };
    
    // Start observing when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observePageActivation);
    } else {
        observePageActivation();
    }
})();
