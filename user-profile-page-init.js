// ============================================
// USER PROFILE PAGE INITIALIZATION
// Initialize user profile pages when loaded
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Wait for systems to be ready
    if (window.userProfilePageSystem && window.userProfilePageUI) {
        initializeUserProfilePage();
    } else {
        // Retry after a short delay
        setTimeout(() => {
            if (window.userProfilePageSystem && window.userProfilePageUI) {
                initializeUserProfilePage();
            } else {
                console.error('❌ User Profile Page system not loaded');
            }
        }, 500);
    }
});

function initializeUserProfilePage() {
    console.log('🎉 Initializing User Profile Page...');
    
    // Check if we have a user ID in URL (for future deep linking)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    if (userId) {
        // Load specific user profile
        window.userProfilePageUI.render(userId, 'user-profile-container');
    } else {
        // Load current user's profile by default
        window.userProfilePageUI.render(
            window.userProfilePageSystem.currentUser.id,
            'user-profile-container'
        );
    }
    
    // Set up page-specific event listeners
    setupPageEventListeners();
    
    console.log('✅ User Profile Page initialized');
}

function setupPageEventListeners() {
    // Profile suggestions
    displayProfileSuggestions();
    
    // User search functionality
    setupUserSearch();
}

function displayProfileSuggestions() {
    const suggestionsContainer = document.getElementById('profile-suggestions-container');
    if (!suggestionsContainer) return;
    
    const suggestions = window.userProfilePageSystem.getSuggestedUsers(
        window.userProfilePageSystem.currentUser.id,
        5
    );
    
    if (suggestions.length === 0) {
        suggestionsContainer.innerHTML = '<p class="no-suggestions">No suggestions available</p>';
        return;
    }
    
    suggestionsContainer.innerHTML = `
        <div class="suggestions-section">
            <h3>Suggested Users</h3>
            <div class="suggestions-list">
                ${suggestions.map(user => `
                    <div class="suggestion-card" onclick="window.userProfilePageUI.render('${user.id}', 'user-profile-container')">
                        <div class="suggestion-avatar">${user.avatar}</div>
                        <div class="suggestion-info">
                            <div class="suggestion-name">
                                ${user.displayName}
                                ${user.verified ? '<i class="fas fa-check-circle verified-badge-small"></i>' : ''}
                            </div>
                            <div class="suggestion-username">@${user.username}</div>
                            ${user.mutualFollowers > 0 ? `
                                <div class="suggestion-mutual">
                                    <i class="fas fa-user-friends"></i>
                                    ${user.mutualFollowers} mutual
                                </div>
                            ` : ''}
                        </div>
                        <button class="btn-primary btn-sm" onclick="event.stopPropagation(); window.userProfilePageSystem.toggleFollow('${user.id}'); this.textContent = 'Following';">
                            Follow
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function setupUserSearch() {
    const searchInput = document.getElementById('user-search-input');
    if (!searchInput) return;
    
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            handleUserSearch(e.target.value);
        }, 300);
    });
}

function handleUserSearch(query) {
    const resultsContainer = document.getElementById('user-search-results');
    if (!resultsContainer) return;
    
    if (!query.trim()) {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
        return;
    }
    
    const results = window.userProfilePageSystem.searchUsers(query);
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No users found</p>';
        resultsContainer.style.display = 'block';
        return;
    }
    
    resultsContainer.innerHTML = `
        <div class="search-results-list">
            ${results.map(user => `
                <div class="search-result-item" onclick="window.userProfilePageUI.render('${user.id}', 'user-profile-container'); document.getElementById('user-search-results').style.display='none';">
                    <div class="search-result-avatar">${user.avatar}</div>
                    <div class="search-result-info">
                        <div class="search-result-name">
                            ${user.displayName}
                            ${user.verified ? '<i class="fas fa-check-circle verified-badge-small"></i>' : ''}
                        </div>
                        <div class="search-result-username">@${user.username}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    resultsContainer.style.display = 'block';
}

// Make function available globally for navigation
window.initializeUserProfilePage = initializeUserProfilePage;

// Helper function to view user from social feed
window.viewUserProfile = function(userId) {
    // Navigate to profile page
    if (window.AppNavigation) {
        window.AppNavigation.navigateTo('profile');
    }
    
    // Wait a moment for page to switch, then render profile
    setTimeout(() => {
        if (window.userProfilePageUI) {
            window.userProfilePageUI.render(userId, 'user-profile-container');
        }
    }, 100);
};

// Add click handlers to usernames in social feed posts
document.addEventListener('click', (e) => {
    // Check if clicked element is a username link
    if (e.target.classList.contains('user-profile-link')) {
        e.preventDefault();
        const userId = e.target.dataset.userId;
        if (userId) {
            window.viewUserProfile(userId);
        }
    }
});
