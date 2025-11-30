/**
 * Unified Authentication UI
 * Beautiful login/signup/profile interface
 * Phase 27: Complete Auth UI
 */

import { unifiedAuth } from './unified-auth-system.js';

class UnifiedAuthUI {
    constructor() {
        this.initialized = false;
        this.currentModal = null;
    }

    init() {
        if (this.initialized) return;

        // Listen for auth events
        unifiedAuth.on('login', (user) => this.onLogin(user));
        unifiedAuth.on('signup', (user) => this.onSignup(user));
        unifiedAuth.on('logout', () => this.onLogout());
        unifiedAuth.on('sessionRestored', (user) => this.onSessionRestored(user));
        unifiedAuth.on('guestMode', () => this.onGuestMode());

        // Update UI for current state
        this.updateAuthButtons();

        this.initialized = true;
        console.log('🎨 Unified Auth UI initialized');
    }

    // ============================================
    // AUTH MODALS
    // ============================================

    showLoginModal() {
        this.closeCurrentModal();

        const modal = document.createElement('div');
        modal.className = 'unified-auth-modal-overlay';
        modal.id = 'auth-modal';
        modal.innerHTML = `
            <div class="unified-auth-modal">
                <button class="auth-close-btn" onclick="document.getElementById('auth-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>

                <div class="auth-modal-header">
                    <h2>Welcome Back!</h2>
                    <p>Sign in to access your Ultimate Sports AI account</p>
                </div>

                <form id="unified-login-form" class="auth-form">
                    <div class="form-group">
                        <label><i class="fas fa-envelope"></i> Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="your@email.com" 
                            required 
                            autocomplete="email"
                        >
                    </div>

                    <div class="form-group">
                        <label><i class="fas fa-lock"></i> Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Enter your password" 
                            required 
                            autocomplete="current-password"
                        >
                    </div>

                    <div class="form-options">
                        <label class="checkbox-label">
                            <input type="checkbox" name="rememberMe" checked>
                            <span>Remember me</span>
                        </label>
                        <button type="button" class="text-link" onclick="window.showForgotPasswordModal()">
                            Forgot password?
                        </button>
                    </div>

                    <div id="login-error" class="auth-error" style="display: none;"></div>

                    <button type="submit" class="auth-submit-btn">
                        <span class="btn-text">Sign In</span>
                        <span class="btn-loader" style="display: none;">
                            <i class="fas fa-spinner fa-spin"></i> Signing in...
                        </span>
                    </button>
                </form>

                <div class="auth-divider">
                    <span>or</span>
                </div>

                <div class="auth-social-buttons">
                    <button class="social-btn google-btn" onclick="window.loginWithGoogle()">
                        <i class="fab fa-google"></i> Continue with Google
                    </button>
                    <button class="social-btn apple-btn" onclick="window.loginWithApple()">
                        <i class="fab fa-apple"></i> Continue with Apple
                    </button>
                </div>

                <div class="auth-footer">
                    Don't have an account? 
                    <button class="text-link" onclick="window.unifiedAuthUI.showSignupModal()">
                        Sign up
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.currentModal = modal;

        // Attach form handler
        document.getElementById('unified-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e.target);
        });

        // Focus email input
        setTimeout(() => modal.querySelector('input[name="email"]').focus(), 100);
    }

    showSignupModal() {
        this.closeCurrentModal();

        const modal = document.createElement('div');
        modal.className = 'unified-auth-modal-overlay';
        modal.id = 'auth-modal';
        modal.innerHTML = `
            <div class="unified-auth-modal">
                <button class="auth-close-btn" onclick="document.getElementById('auth-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>

                <div class="auth-modal-header">
                    <h2>Create Account</h2>
                    <p>Join the Ultimate Sports AI community</p>
                </div>

                <form id="unified-signup-form" class="auth-form">
                    <div class="form-group">
                        <label><i class="fas fa-user"></i> Username</label>
                        <input 
                            type="text" 
                            name="username" 
                            placeholder="Choose a username" 
                            required 
                            autocomplete="username"
                            minlength="3"
                        >
                    </div>

                    <div class="form-group">
                        <label><i class="fas fa-envelope"></i> Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="your@email.com" 
                            required 
                            autocomplete="email"
                        >
                    </div>

                    <div class="form-group">
                        <label><i class="fas fa-lock"></i> Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="At least 8 characters" 
                            required 
                            autocomplete="new-password"
                            minlength="8"
                        >
                        <div class="password-strength" id="password-strength"></div>
                    </div>

                    <div class="form-group">
                        <label><i class="fas fa-lock"></i> Confirm Password</label>
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            placeholder="Re-enter your password" 
                            required 
                            autocomplete="new-password"
                            minlength="8"
                        >
                    </div>

                    <label class="checkbox-label terms-checkbox">
                        <input type="checkbox" name="agreeTerms" required>
                        <span>I agree to the <a href="/terms-of-service.html" target="_blank">Terms of Service</a> and <a href="/privacy-policy.html" target="_blank">Privacy Policy</a></span>
                    </label>

                    <div id="signup-error" class="auth-error" style="display: none;"></div>

                    <button type="submit" class="auth-submit-btn">
                        <span class="btn-text">Create Account</span>
                        <span class="btn-loader" style="display: none;">
                            <i class="fas fa-spinner fa-spin"></i> Creating account...
                        </span>
                    </button>
                </form>

                <div class="auth-divider">
                    <span>or</span>
                </div>

                <div class="auth-social-buttons">
                    <button class="social-btn google-btn" onclick="window.loginWithGoogle()">
                        <i class="fab fa-google"></i> Sign up with Google
                    </button>
                    <button class="social-btn apple-btn" onclick="window.loginWithApple()">
                        <i class="fab fa-apple"></i> Sign up with Apple
                    </button>
                </div>

                <div class="auth-footer">
                    Already have an account? 
                    <button class="text-link" onclick="window.unifiedAuthUI.showLoginModal()">
                        Sign in
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.currentModal = modal;

        // Attach form handler
        document.getElementById('unified-signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup(e.target);
        });

        // Password strength indicator
        modal.querySelector('input[name="password"]').addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });

        // Focus username input
        setTimeout(() => modal.querySelector('input[name="username"]').focus(), 100);
    }

    closeCurrentModal() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
        }

        // Also close any existing auth modals
        const existing = document.getElementById('auth-modal');
        if (existing) {
            existing.remove();
        }
    }

    // ============================================
    // FORM HANDLERS
    // ============================================

    async handleLogin(form) {
        const submitBtn = form.querySelector('.auth-submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        const errorDiv = document.getElementById('login-error');

        // Clear previous error
        errorDiv.style.display = 'none';

        // Show loading
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);
            const credentials = {
                email: formData.get('email'),
                password: formData.get('password'),
                rememberMe: formData.get('rememberMe') === 'on'
            };

            const result = await unifiedAuth.login(credentials);

            if (!result.success) {
                throw new Error(result.message || 'Login failed');
            }

            // Success - modal will be closed by event handler
            this.closeCurrentModal();

        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';

            // Reset button
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    async handleSignup(form) {
        const submitBtn = form.querySelector('.auth-submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        const errorDiv = document.getElementById('signup-error');

        // Clear previous error
        errorDiv.style.display = 'none';

        // Show loading
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);
            const userData = {
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };

            const result = await unifiedAuth.signup(userData);

            if (!result.success) {
                throw new Error(result.message || 'Signup failed');
            }

            // Success - modal will be closed by event handler
            this.closeCurrentModal();

        } catch (error) {
            console.error('Signup error:', error);
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';

            // Reset button
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    // ============================================
    // PASSWORD STRENGTH
    // ============================================

    updatePasswordStrength(password) {
        const strengthDiv = document.getElementById('password-strength');
        if (!strengthDiv) return;

        if (!password) {
            strengthDiv.innerHTML = '';
            return;
        }

        let strength = 0;
        let feedback = [];

        // Length check
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        
        // Complexity checks
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        const levels = [
            { label: 'Weak', color: '#ef4444', width: '20%' },
            { label: 'Fair', color: '#f59e0b', width: '40%' },
            { label: 'Good', color: '#3b82f6', width: '60%' },
            { label: 'Strong', color: '#10b981', width: '80%' },
            { label: 'Very Strong', color: '#059669', width: '100%' }
        ];

        const level = levels[Math.min(strength, 4)];

        strengthDiv.innerHTML = `
            <div class="strength-bar-container">
                <div class="strength-bar" style="width: ${level.width}; background: ${level.color};"></div>
            </div>
            <span class="strength-label" style="color: ${level.color};">${level.label}</span>
        `;
    }

    // ============================================
    // AUTH STATE HANDLERS
    // ============================================

    onLogin(user) {
        console.log('✅ User logged in:', user.username);
        this.updateAuthButtons();
        this.showWelcomeNotification(user);
    }

    onSignup(user) {
        console.log('✅ User signed up:', user.username);
        this.updateAuthButtons();
        this.showWelcomeNotification(user, true);
    }

    onLogout() {
        console.log('👋 User logged out');
        this.updateAuthButtons();
        
        // Show notification
        if (window.showNotification) {
            window.showNotification('Logged out successfully', 'info');
        }

        // Redirect to home if on protected page
        if (window.location.hash.includes('profile')) {
            window.location.hash = '#home';
        }
    }

    onSessionRestored(user) {
        console.log('✅ Session restored:', user.username);
        this.updateAuthButtons();
    }

    onGuestMode() {
        console.log('👤 Guest mode');
        this.updateAuthButtons();
    }

    // ============================================
    // UI UPDATES
    // ============================================

    updateAuthButtons() {
        const isAuthenticated = unifiedAuth.isAuthenticated();
        const user = unifiedAuth.getCurrentUser();

        // Update profile button in header
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            if (isAuthenticated && user) {
                profileBtn.innerHTML = `
                    <img 
                        src="${user.profile?.avatar || unifiedAuth.getDefaultAvatar()}" 
                        alt="${user.username}"
                        class="profile-avatar-small"
                    >
                `;
                profileBtn.onclick = () => this.showProfileMenu();
            } else {
                profileBtn.innerHTML = `<i class="fas fa-user"></i>`;
                profileBtn.onclick = () => this.showLoginModal();
            }
        }

        // Update bottom nav profile button
        const bottomProfileBtn = document.querySelector('[data-page="profile"]');
        if (bottomProfileBtn) {
            if (!isAuthenticated) {
                bottomProfileBtn.onclick = (e) => {
                    e.preventDefault();
                    this.showLoginModal();
                };
            } else {
                bottomProfileBtn.onclick = null; // Let normal navigation work
            }
        }
    }

    showProfileMenu() {
        const user = unifiedAuth.getCurrentUser();
        if (!user) return;

        // Remove existing menu
        const existing = document.getElementById('profile-dropdown-menu');
        if (existing) {
            existing.remove();
            return;
        }

        const menu = document.createElement('div');
        menu.id = 'profile-dropdown-menu';
        menu.className = 'profile-dropdown-menu';
        menu.innerHTML = `
            <div class="profile-menu-header">
                <img 
                    src="${user.profile?.avatar || unifiedAuth.getDefaultAvatar()}" 
                    alt="${user.username}"
                    class="profile-avatar-medium"
                >
                <div class="profile-menu-info">
                    <div class="profile-menu-name">${user.username}</div>
                    <div class="profile-menu-email">${user.email}</div>
                    <div class="profile-menu-tier">
                        <i class="fas fa-crown"></i> ${user.subscription?.tier || 'FREE'}
                    </div>
                </div>
            </div>
            <div class="profile-menu-divider"></div>
            <button class="profile-menu-item" onclick="window.navigateToPage('profile')">
                <i class="fas fa-user"></i> My Profile
            </button>
            <button class="profile-menu-item" onclick="window.navigateToPage('settings')">
                <i class="fas fa-cog"></i> Settings
            </button>
            <button class="profile-menu-item" onclick="window.navigateToPage('subscription')">
                <i class="fas fa-star"></i> Subscription
            </button>
            <div class="profile-menu-divider"></div>
            <button class="profile-menu-item danger" onclick="window.unifiedAuthUI.handleLogout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;

        document.body.appendChild(menu);

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && !document.getElementById('profile-btn').contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 10);
    }

    handleLogout() {
        // Close profile menu
        const menu = document.getElementById('profile-dropdown-menu');
        if (menu) menu.remove();

        // Confirm logout
        if (confirm('Are you sure you want to logout?')) {
            unifiedAuth.logout();
        }
    }

    showWelcomeNotification(user, isNewUser = false) {
        if (window.showNotification) {
            const message = isNewUser 
                ? `Welcome to Ultimate Sports AI, ${user.username}! 🎉`
                : `Welcome back, ${user.username}! 👋`;
            window.showNotification(message, 'success');
        }
    }
}

// Export singleton
export const unifiedAuthUI = new UnifiedAuthUI();

// Make available globally
if (typeof window !== 'undefined') {
    window.unifiedAuthUI = unifiedAuthUI;
    
    // Global helper functions
    window.showLoginModal = () => unifiedAuthUI.showLoginModal();
    window.showSignupModal = () => unifiedAuthUI.showSignupModal();
}
