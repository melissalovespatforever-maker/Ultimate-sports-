/**
 * Complete Auth Integration
 * Wires up all login/signup/profile buttons and functionality
 * Makes the entire auth system work end-to-end
 */

import { unifiedAuth } from './unified-auth-system.js';
import { unifiedAuthUI } from './unified-auth-ui.js';
import { unifiedProfilePage } from './unified-profile-page.js';

console.log('🔌 Loading Complete Auth Integration...');

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Complete Auth System...');
    
    try {
        // 1. Initialize UI
        unifiedAuthUI.init();
        unifiedProfilePage.init();
        
        // 2. Wire up all buttons
        wireUpButtons();
        
        // 3. Setup global functions
        setupGlobalFunctions();
        
        // 4. Handle page navigation
        setupPageNavigation();
        
        // 5. Update UI based on auth state
        updateUIForAuthState();
        
        console.log('✅ Complete Auth System Ready!');
        
    } catch (error) {
        console.error('❌ Auth integration error:', error);
    }
});

// ============================================
// BUTTON WIRING
// ============================================

function wireUpButtons() {
    console.log('🔘 Wiring up auth buttons...');
    
    // Profile Button (Header)
    const profileBtns = document.querySelectorAll('.profile-btn, [data-page="profile"], #profile-btn');
    profileBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (unifiedAuth.isAuthenticated()) {
                // User is logged in - show profile
                navigateToProfile();
            } else {
                // User not logged in - show login modal
                unifiedAuthUI.showLoginModal();
            }
        });
    });
    
    // Login buttons (anywhere on page)
    const loginBtns = document.querySelectorAll('.login-btn, [data-action="login"]');
    loginBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            unifiedAuthUI.showLoginModal();
        });
    });
    
    // Signup buttons
    const signupBtns = document.querySelectorAll('.signup-btn, [data-action="signup"]');
    signupBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            unifiedAuthUI.showSignupModal();
        });
    });
    
    // Logout buttons
    const logoutBtns = document.querySelectorAll('.logout-btn, [data-action="logout"]');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    });
    
    console.log(`✅ Wired ${profileBtns.length} profile, ${loginBtns.length} login, ${signupBtns.length} signup buttons`);
}

// ============================================
// NAVIGATION
// ============================================

function navigateToProfile() {
    console.log('📱 Navigating to profile...');
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show profile page
    const profilePage = document.querySelector('.page[data-page="profile"]') || 
                       document.getElementById('profile-page-container');
    
    if (profilePage) {
        profilePage.classList.add('active');
        
        // Render profile content
        let container = profilePage.querySelector('#profile-page');
        if (!container) {
            container = document.createElement('div');
            container.id = 'profile-page';
            profilePage.innerHTML = '';
            profilePage.appendChild(container);
        }
        
        unifiedProfilePage.render('profile-page');
        
        // Update URL
        window.location.hash = '#profile';
        
        // Update bottom nav
        updateBottomNav('profile');
    } else {
        console.error('❌ Profile page not found');
    }
}

function updateBottomNav(page) {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`.bottom-nav-item[data-page="${page}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// ============================================
// PAGE NAVIGATION HANDLING
// ============================================

function setupPageNavigation() {
    // Handle hash changes
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        
        if (hash === 'profile') {
            if (unifiedAuth.isAuthenticated()) {
                navigateToProfile();
            } else {
                unifiedAuthUI.showLoginModal();
                window.location.hash = '#home';
            }
        }
    });
    
    // Check initial hash
    if (window.location.hash === '#profile') {
        if (unifiedAuth.isAuthenticated()) {
            navigateToProfile();
        } else {
            unifiedAuthUI.showLoginModal();
            window.location.hash = '#home';
        }
    }
}

// ============================================
// GLOBAL FUNCTIONS
// ============================================

function setupGlobalFunctions() {
    // Show login modal
    window.showLoginModal = () => {
        unifiedAuthUI.showLoginModal();
    };
    
    // Show signup modal
    window.showSignupModal = () => {
        unifiedAuthUI.showSignupModal();
    };
    
    // Show forgot password modal
    window.showForgotPasswordModal = () => {
        unifiedAuthUI.showForgotPasswordModal();
    };
    
    // Check if authenticated
    window.isAuthenticated = () => {
        return unifiedAuth.isAuthenticated();
    };
    
    // Get current user
    window.getCurrentUser = () => {
        return unifiedAuth.getCurrentUser();
    };
    
    // Require auth before action
    window.requireAuth = (callback) => {
        if (unifiedAuth.isAuthenticated()) {
            callback();
        } else {
            unifiedAuthUI.showLoginModal();
        }
    };
    
    // Logout
    window.logout = handleLogout;
    
    console.log('✅ Global auth functions registered');
}

// ============================================
// AUTH STATE HANDLING
// ============================================

function updateUIForAuthState() {
    const isAuth = unifiedAuth.isAuthenticated();
    const user = unifiedAuth.getCurrentUser();
    
    console.log(`🔐 Auth state: ${isAuth ? 'Logged in' : 'Guest'}`);
    
    if (isAuth && user) {
        // Update profile button to show user avatar/name
        updateProfileButton(user);
        
        // Show logout option
        showLogoutOption();
        
        // Hide login/signup buttons
        hideGuestButtons();
    } else {
        // Show default profile icon
        resetProfileButton();
        
        // Hide logout option
        hideLogoutOption();
        
        // Show login/signup buttons
        showGuestButtons();
    }
}

function updateProfileButton(user) {
    const profileBtns = document.querySelectorAll('.profile-btn');
    profileBtns.forEach(btn => {
        // Add user indicator
        if (user.profile && user.profile.avatar) {
            btn.innerHTML = `<img src="${user.profile.avatar}" class="profile-avatar" alt="${user.username}">`;
        } else {
            btn.innerHTML = `<i class="fas fa-user-circle"></i>`;
        }
        btn.classList.add('authenticated');
        btn.title = `${user.username} - View Profile`;
    });
}

function resetProfileButton() {
    const profileBtns = document.querySelectorAll('.profile-btn');
    profileBtns.forEach(btn => {
        btn.innerHTML = `<i class="fas fa-user"></i>`;
        btn.classList.remove('authenticated');
        btn.title = 'Login / Sign Up';
    });
}

function showLogoutOption() {
    document.querySelectorAll('.logout-option').forEach(el => {
        el.style.display = 'block';
    });
}

function hideLogoutOption() {
    document.querySelectorAll('.logout-option').forEach(el => {
        el.style.display = 'none';
    });
}

function showGuestButtons() {
    document.querySelectorAll('.guest-only').forEach(el => {
        el.style.display = '';
    });
}

function hideGuestButtons() {
    document.querySelectorAll('.guest-only').forEach(el => {
        el.style.display = 'none';
    });
}

// ============================================
// LOGOUT HANDLER
// ============================================

async function handleLogout() {
    const confirmed = confirm('Are you sure you want to log out?');
    if (!confirmed) return;
    
    console.log('👋 Logging out...');
    
    await unifiedAuth.logout();
    
    // Update UI
    updateUIForAuthState();
    
    // Redirect to home
    window.location.hash = '#home';
    
    // Show notification
    showNotification('Logged out successfully', 'success');
}

// ============================================
// AUTH EVENT LISTENERS
// ============================================

// Listen for login
unifiedAuth.on('login', (user) => {
    console.log('✅ User logged in:', user.username);
    updateUIForAuthState();
    showNotification(`Welcome back, ${user.username}!`, 'success');
    
    // Sync bet slip if available
    if (window.betSlipSyncIntegration) {
        window.betSlipSyncIntegration.setUserId(user.id);
    }
});

// Listen for signup
unifiedAuth.on('signup', (user) => {
    console.log('🎉 New user signed up:', user.username);
    updateUIForAuthState();
    showNotification(`Welcome to Ultimate Sports AI, ${user.username}!`, 'success');
    
    // Navigate to profile
    setTimeout(() => navigateToProfile(), 1000);
});

// Listen for logout
unifiedAuth.on('logout', () => {
    console.log('👋 User logged out');
    updateUIForAuthState();
});

// Listen for session restored
unifiedAuth.on('sessionRestored', (user) => {
    console.log('🔄 Session restored:', user.username);
    updateUIForAuthState();
});

// Listen for guest mode
unifiedAuth.on('guestMode', () => {
    console.log('👤 Guest mode active');
    updateUIForAuthState();
});

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
    // Check if notification system exists
    if (window.notificationSystem && typeof window.notificationSystem.show === 'function') {
        window.notificationSystem.show(message, type);
        return;
    }
    
    // Fallback: Simple toast notification
    const toast = document.createElement('div');
    toast.className = `auth-toast auth-toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// PROTECTED ACTIONS
// ============================================

// Make bet slip require auth
document.addEventListener('click', (e) => {
    const betButton = e.target.closest('[data-action="add-to-bet-slip"]');
    if (betButton) {
        if (!unifiedAuth.isAuthenticated()) {
            e.preventDefault();
            e.stopPropagation();
            showNotification('Please log in to add picks', 'info');
            unifiedAuthUI.showLoginModal();
        }
    }
});

// ============================================
// STYLES
// ============================================

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    
    .profile-btn.authenticated {
        position: relative;
    }
    
    .profile-btn.authenticated::after {
        content: '';
        position: absolute;
        top: 8px;
        right: 8px;
        width: 8px;
        height: 8px;
        background: #10b981;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
    }
    
    .profile-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #10b981;
    }
`;
document.head.appendChild(style);

console.log('✅ Complete Auth Integration Loaded');
