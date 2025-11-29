// ============================================
// SOCIAL FEED PAGE INITIALIZATION
// Initialize the social feed when page loads
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Wait for systems to be ready
    if (window.socialFeedSystem && window.socialFeedUI) {
        initializeSocialFeed();
    } else {
        // Retry after a short delay
        setTimeout(() => {
            if (window.socialFeedSystem && window.socialFeedUI) {
                initializeSocialFeed();
            } else {
                console.error('❌ Social Feed system not loaded');
            }
        }, 500);
    }
});

function initializeSocialFeed() {
    console.log('🎉 Initializing Social Feed page...');
    
    // Render the feed
    window.socialFeedUI.render('social-feed-container');
    
    // Set up page-specific event listeners
    setupPageEventListeners();
    
    console.log('✅ Social Feed page initialized');
}

function setupPageEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-feed-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            window.socialFeedUI.render('social-feed-container');
            showRefreshToast();
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('feed-search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch(e.target.value);
            }, 300);
        });
    }
    
    // Trending tags
    displayTrendingTags();
}

function handleSearch(query) {
    if (!query.trim()) {
        window.socialFeedUI.render('social-feed-container');
        return;
    }
    
    const results = window.socialFeedSystem.searchPosts(query);
    displaySearchResults(results);
}

function displaySearchResults(results) {
    const container = document.getElementById('social-feed-container');
    if (!container) return;
    
    // Temporarily override the filtered posts
    const originalGetFilteredPosts = window.socialFeedSystem.getFilteredPosts.bind(window.socialFeedSystem);
    window.socialFeedSystem.getFilteredPosts = () => results;
    
    window.socialFeedUI.render('social-feed-container');
    
    // Restore original method
    window.socialFeedSystem.getFilteredPosts = originalGetFilteredPosts;
}

function displayTrendingTags() {
    const tagsContainer = document.getElementById('trending-tags-container');
    if (!tagsContainer) return;
    
    const trending = window.socialFeedSystem.getTrendingTags();
    
    if (trending.length === 0) {
        tagsContainer.innerHTML = '<p class="no-tags">No trending tags yet</p>';
        return;
    }
    
    tagsContainer.innerHTML = `
        <div class="trending-tags">
            ${trending.map((item, index) => `
                <button class="trending-tag" data-tag="${item.tag}">
                    <span class="tag-rank">#${index + 1}</span>
                    <span class="tag-name">#${item.tag}</span>
                    <span class="tag-count">${item.count} posts</span>
                </button>
            `).join('')}
        </div>
    `;
    
    // Add click handlers
    document.querySelectorAll('.trending-tag').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tag = e.currentTarget.dataset.tag;
            const posts = window.socialFeedSystem.getPostsByTag(tag);
            displaySearchResults(posts);
        });
    });
}

function showRefreshToast() {
    if (window.socialFeedUI) {
        window.socialFeedUI.showToast('Feed refreshed!', 'success');
    }
}

// Export for use in navigation
window.initializeSocialFeed = initializeSocialFeed;
