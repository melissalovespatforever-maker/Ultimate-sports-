// ============================================
// AUTHENTICATION UI
// Login, Registration, and Profile Management UI
// ============================================

import { authSystem } from './auth-system.js';

export class AuthUI {
    constructor() {
        this.currentModal = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        // Add auth styles
        this.addStyles();

        // Set up auth event listeners
        this.setupAuthListeners();

        // Update UI based on auth state
        this.updateAuthUI();

        this.initialized = true;
        console.log('🎨 Auth UI initialized');
    }

    // ============================================
    // MODALS
    // ============================================

    showLoginModal() {
        const modal = this.createModal('login', `
            <div class="auth-modal-content">
                <div class="auth-modal-header">
                    <h2>Welcome Back!</h2>
                    <p>Sign in to continue your journey</p>
                </div>

                <!-- Admin Login Info -->
                <div class="admin-login-info">
                    <div class="admin-info-icon">👑</div>
                    <div class="admin-info-content">
                        <strong>Admin Login</strong>
                        <div class="admin-credentials">
                            <span>Email: <code>admin@sportsai.com</code></span>
                            <span>Password: <code>admin123</code></span>
                        </div>
                    </div>
                </div>

                <div class="auth-tabs">
                    <button class="auth-tab active" data-tab="signin">Sign In</button>
                    <button class="auth-tab" data-tab="signup">Sign Up</button>
                </div>

                <div class="auth-tab-content" id="signin-tab">
                    <form id="signin-form" class="auth-form">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" placeholder="your@email.com" required>
                        </div>

                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" name="password" placeholder="••••••••" required>
                        </div>

                        <div class="form-options">
                            <label class="checkbox-label">
                                <input type="checkbox" name="rememberMe">
                                <span>Remember me</span>
                            </label>
                            <a href="#" class="text-link" id="forgot-password-link">Forgot password?</a>
                        </div>

                        <button type="submit" class="auth-submit-btn">
                            Sign In
                        </button>

                        <div class="auth-error" id="signin-error" style="display: none;"></div>
                    </form>

                    <div class="auth-divider">
                        <span>or continue with</span>
                    </div>

                    <div class="social-auth-buttons">
                        <button class="social-btn google-btn" id="google-signin-btn">
                            <span class="social-icon">🔍</span>
                            <span>Google</span>
                        </button>
                        <button class="social-btn apple-btn" id="apple-signin-btn">
                            <span class="social-icon">🍎</span>
                            <span>Apple</span>
                        </button>
                    </div>

                    <div class="guest-option">
                        <button class="guest-btn" id="guest-signin-btn">
                            Continue as Guest
                        </button>
                    </div>
                </div>

                <div class="auth-tab-content" id="signup-tab" style="display: none;">
                    <form id="signup-form" class="auth-form">
                        <div class="form-group">
                            <label>Username</label>
                            <input type="text" name="username" placeholder="Choose a username" required minlength="3">
                        </div>

                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" placeholder="your@email.com" required>
                        </div>

                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" name="password" placeholder="••••••••" required minlength="8">
                            <small class="form-hint">At least 8 characters with uppercase, lowercase, and number</small>
                        </div>

                        <div class="form-group">
                            <label>Confirm Password</label>
                            <input type="password" name="confirmPassword" placeholder="••••••••" required>
                        </div>

                        <div class="form-options">
                            <label class="checkbox-label">
                                <input type="checkbox" name="agreedToTerms" required>
                                <span>I agree to the <a href="#" class="text-link">Terms</a> and <a href="#" class="text-link">Privacy Policy</a></span>
                            </label>
                        </div>

                        <button type="submit" class="auth-submit-btn">
                            Create Account
                        </button>

                        <div class="auth-error" id="signup-error" style="display: none;"></div>
                    </form>

                    <div class="auth-divider">
                        <span>or sign up with</span>
                    </div>

                    <div class="social-auth-buttons">
                        <button class="social-btn google-btn" id="google-signup-btn">
                            <span class="social-icon">🔍</span>
                            <span>Google</span>
                        </button>
                        <button class="social-btn apple-btn" id="apple-signup-btn">
                            <span class="social-icon">🍎</span>
                            <span>Apple</span>
                        </button>
                    </div>
                </div>
            </div>
        `);

        this.setupModalHandlers(modal);
        this.currentModal = modal;
    }

    showProfileModal() {
        const user = authSystem.getUser();
        if (!user) return;

        const modal = this.createModal('profile', `
            <div class="auth-modal-content profile-modal">
                <div class="auth-modal-header">
                    <h2>My Profile</h2>
                    <p>Manage your account settings</p>
                </div>

                <div class="profile-section">
                    <div class="profile-avatar-section">
                        <div class="profile-avatar-large">${user.avatar}</div>
                        <div class="profile-basic-info">
                            <h3>${user.username}</h3>
                            <p class="profile-email">${user.email || 'Guest Account'}</p>
                            <div class="profile-badges">
                                <span class="badge level-badge">Level ${user.level}</span>
                                <span class="badge membership-badge ${user.membership}">${user.membership}</span>
                            </div>
                        </div>
                    </div>

                    <div class="profile-stats-grid">
                        <div class="profile-stat">
                            <div class="stat-value">${user.balance?.toLocaleString() || 0}</div>
                            <div class="stat-label">Balance</div>
                        </div>
                        <div class="profile-stat">
                            <div class="stat-value">${user.points?.toLocaleString() || 0}</div>
                            <div class="stat-label">Points</div>
                        </div>
                        <div class="profile-stat">
                            <div class="stat-value">${Math.floor((user.xp / user.xpToNext) * 100) || 0}%</div>
                            <div class="stat-label">XP Progress</div>
                        </div>
                    </div>
                </div>

                ${user.isGuest ? `
                    <div class="guest-upgrade-section">
                        <div class="upgrade-message">
                            <h4>🎁 Upgrade Your Account</h4>
                            <p>Create a full account to save your progress and unlock premium features!</p>
                        </div>
                        <button class="auth-submit-btn" id="convert-guest-btn">
                            Create Account
                        </button>
                    </div>
                ` : `
                    <div class="profile-tabs">
                        <button class="profile-tab active" data-tab="info">Account Info</button>
                        <button class="profile-tab" data-tab="security">Security</button>
                        <button class="profile-tab" data-tab="preferences">Preferences</button>
                    </div>

                    <div class="profile-tab-content" id="info-tab">
                        <form id="update-profile-form" class="auth-form">
                            <div class="form-group">
                                <label>Username</label>
                                <input type="text" name="username" value="${user.username}" required>
                            </div>

                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value="${user.email || ''}" required>
                            </div>

                            <div class="form-group">
                                <label>Avatar</label>
                                <div class="avatar-picker">
                                    ${['👤', '😀', '😎', '🎮', '⚽', '🏀', '🎯', '🔥', '⭐', '💎'].map(emoji => 
                                        `<button type="button" class="avatar-option ${emoji === user.avatar ? 'selected' : ''}" data-avatar="${emoji}">${emoji}</button>`
                                    ).join('')}
                                </div>
                            </div>

                            <button type="submit" class="auth-submit-btn">
                                Save Changes
                            </button>
                        </form>
                    </div>

                    <div class="profile-tab-content" id="security-tab" style="display: none;">
                        <form id="change-password-form" class="auth-form">
                            <div class="form-group">
                                <label>Current Password</label>
                                <input type="password" name="currentPassword" required>
                            </div>

                            <div class="form-group">
                                <label>New Password</label>
                                <input type="password" name="newPassword" required minlength="8">
                            </div>

                            <div class="form-group">
                                <label>Confirm New Password</label>
                                <input type="password" name="confirmPassword" required>
                            </div>

                            <button type="submit" class="auth-submit-btn">
                                Change Password
                            </button>
                        </form>

                        <div class="danger-zone">
                            <h4>Danger Zone</h4>
                            <p>Once you delete your account, there is no going back.</p>
                            <button class="danger-btn" id="delete-account-btn">
                                Delete Account
                            </button>
                        </div>
                    </div>

                    <div class="profile-tab-content" id="preferences-tab" style="display: none;">
                        <div class="preferences-list">
                            <div class="preference-item">
                                <div>
                                    <h4>Notifications</h4>
                                    <p>Receive updates about your bets and predictions</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="preference-item">
                                <div>
                                    <h4>Sound Effects</h4>
                                    <p>Play sounds for wins and achievements</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="preference-item">
                                <div>
                                    <h4>Dark Mode</h4>
                                    <p>Use dark theme throughout the app</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                `}

                <div class="profile-actions">
                    <button class="secondary-btn" id="close-profile-btn">Close</button>
                    <button class="danger-btn-outline" id="logout-btn">Logout</button>
                </div>
            </div>
        `);

        this.setupProfileHandlers(modal);
        this.currentModal = modal;
    }

    showGuestConversionModal() {
        const modal = this.createModal('guest-conversion', `
            <div class="auth-modal-content">
                <div class="auth-modal-header">
                    <h2>🎁 Upgrade to Full Account</h2>
                    <p>Save your progress and unlock premium features!</p>
                </div>

                <div class="upgrade-benefits">
                    <div class="benefit-item">
                        <span class="benefit-icon">💾</span>
                        <div>
                            <h4>Save Your Progress</h4>
                            <p>Never lose your stats and achievements</p>
                        </div>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">🏆</span>
                        <div>
                            <h4>Compete on Leaderboards</h4>
                            <p>Show off your skills globally</p>
                        </div>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">🎁</span>
                        <div>
                            <h4>Earn Rewards</h4>
                            <p>Get daily bonuses and exclusive perks</p>
                        </div>
                    </div>
                </div>

                <form id="guest-conversion-form" class="auth-form">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" name="username" placeholder="Choose a username" required minlength="3">
                    </div>

                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" placeholder="your@email.com" required>
                    </div>

                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" name="password" placeholder="••••••••" required minlength="8">
                    </div>

                    <button type="submit" class="auth-submit-btn">
                        Create Account
                    </button>

                    <div class="auth-error" id="conversion-error" style="display: none;"></div>
                </form>
            </div>
        `);

        this.setupGuestConversionHandlers(modal);
        this.currentModal = modal;
    }

    // ============================================
    // MODAL CREATION
    // ============================================

    createModal(type, content) {
        // Remove existing modal
        this.closeModal();

        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-overlay"></div>
            <div class="auth-modal-container">
                <button class="auth-modal-close">×</button>
                ${content}
            </div>
        `;

        document.body.appendChild(modal);

        // Close on overlay click
        modal.querySelector('.auth-modal-overlay').addEventListener('click', () => {
            this.closeModal();
        });

        // Close on close button
        modal.querySelector('.auth-modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });

        return modal;
    }

    closeModal() {
        if (this.currentModal) {
            this.currentModal.classList.remove('active');
            setTimeout(() => {
                this.currentModal.remove();
                this.currentModal = null;
            }, 300);
        }
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    setupModalHandlers(modal) {
        // Tab switching
        const tabs = modal.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show target content
                modal.querySelectorAll('.auth-tab-content').forEach(content => {
                    content.style.display = content.id === `${targetTab}-tab` ? 'block' : 'none';
                });
            });
        });

        // Sign in form
        const signinForm = modal.querySelector('#signin-form');
        if (signinForm) {
            signinForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignIn(signinForm);
            });
        }

        // Sign up form
        const signupForm = modal.querySelector('#signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignUp(signupForm);
            });
        }

        // Social auth buttons
        modal.querySelector('#google-signin-btn')?.addEventListener('click', () => {
            this.handleGoogleAuth();
        });

        modal.querySelector('#apple-signin-btn')?.addEventListener('click', () => {
            this.handleAppleAuth();
        });

        modal.querySelector('#google-signup-btn')?.addEventListener('click', () => {
            this.handleGoogleAuth();
        });

        modal.querySelector('#apple-signup-btn')?.addEventListener('click', () => {
            this.handleAppleAuth();
        });

        // Guest sign in
        modal.querySelector('#guest-signin-btn')?.addEventListener('click', () => {
            this.handleGuestAuth();
        });

        // Forgot password
        modal.querySelector('#forgot-password-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForgotPasswordDialog();
        });
    }

    setupProfileHandlers(modal) {
        // Profile tabs
        const tabs = modal.querySelectorAll('.profile-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                modal.querySelectorAll('.profile-tab-content').forEach(content => {
                    content.style.display = content.id === `${targetTab}-tab` ? 'block' : 'none';
                });
            });
        });

        // Avatar picker
        modal.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                modal.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        // Update profile form
        const updateForm = modal.querySelector('#update-profile-form');
        if (updateForm) {
            updateForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleUpdateProfile(updateForm);
            });
        }

        // Change password form
        const passwordForm = modal.querySelector('#change-password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleChangePassword(passwordForm);
            });
        }

        // Logout
        modal.querySelector('#logout-btn')?.addEventListener('click', () => {
            this.handleLogout();
        });

        // Close
        modal.querySelector('#close-profile-btn')?.addEventListener('click', () => {
            this.closeModal();
        });

        // Delete account
        modal.querySelector('#delete-account-btn')?.addEventListener('click', () => {
            this.handleDeleteAccount();
        });

        // Convert guest
        modal.querySelector('#convert-guest-btn')?.addEventListener('click', () => {
            this.closeModal();
            this.showGuestConversionModal();
        });
    }

    setupGuestConversionHandlers(modal) {
        const form = modal.querySelector('#guest-conversion-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleGuestConversion(form);
            });
        }
    }

    // ============================================
    // FORM HANDLERS
    // ============================================

    async handleSignIn(form) {
        const formData = new FormData(form);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
            rememberMe: formData.get('rememberMe') === 'on'
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        const errorDiv = form.querySelector('.auth-error');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
        errorDiv.style.display = 'none';

        const result = await authSystem.login(credentials);

        if (result.success) {
            this.closeModal();
            this.showToast('Welcome back!', 'success');
        } else {
            errorDiv.textContent = result.error;
            errorDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    }

    async handleSignUp(form) {
        const formData = new FormData(form);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        const errorDiv = form.querySelector('.auth-error');
        errorDiv.style.display = 'none';

        if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            errorDiv.style.display = 'block';
            return;
        }

        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: password,
            agreedToTerms: formData.get('agreedToTerms') === 'on'
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';

        const result = await authSystem.register(userData);

        if (result.success) {
            this.closeModal();
            this.showToast('Account created successfully!', 'success');
        } else {
            errorDiv.textContent = result.error;
            errorDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        }
    }

    async handleGoogleAuth() {
        const result = await authSystem.loginWithGoogle();
        
        if (result.success) {
            this.closeModal();
            this.showToast('Signed in with Google!', 'success');
        } else {
            this.showToast(result.error, 'error');
        }
    }

    async handleAppleAuth() {
        const result = await authSystem.loginWithApple();
        
        if (result.success) {
            this.closeModal();
            this.showToast('Signed in with Apple!', 'success');
        } else {
            this.showToast(result.error, 'error');
        }
    }

    async handleGuestAuth() {
        const result = await authSystem.loginAsGuest();
        
        if (result.success) {
            this.closeModal();
            this.showToast('Welcome, Guest!', 'success');
        } else {
            this.showToast(result.error, 'error');
        }
    }

    async handleUpdateProfile(form) {
        const formData = new FormData(form);
        const selectedAvatar = form.querySelector('.avatar-option.selected');
        
        const updates = {
            username: formData.get('username'),
            email: formData.get('email'),
            avatar: selectedAvatar?.dataset.avatar
        };

        const result = await authSystem.updateProfile(updates);
        
        if (result.success) {
            this.showToast('Profile updated!', 'success');
            this.updateAuthUI();
        } else {
            this.showToast(result.error, 'error');
        }
    }

    async handleChangePassword(form) {
        const formData = new FormData(form);
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (newPassword !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        const result = await authSystem.changePassword(
            formData.get('currentPassword'),
            newPassword
        );

        if (result.success) {
            this.showToast('Password changed!', 'success');
            form.reset();
        } else {
            this.showToast(result.error, 'error');
        }
    }

    async handleGuestConversion(form) {
        const formData = new FormData(form);
        const errorDiv = form.querySelector('.auth-error');
        errorDiv.style.display = 'none';

        const result = await authSystem.convertGuestAccount(
            formData.get('email'),
            formData.get('password'),
            formData.get('username')
        );

        if (result.success) {
            this.closeModal();
            this.showToast('Account upgraded!', 'success');
        } else {
            errorDiv.textContent = result.error;
            errorDiv.style.display = 'block';
        }
    }

    async handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            await authSystem.logout();
            this.closeModal();
            this.showToast('Logged out successfully', 'success');
        }
    }

    async handleDeleteAccount() {
        const password = prompt('Enter your password to confirm account deletion:');
        
        if (password) {
            if (confirm('This action cannot be undone. Are you absolutely sure?')) {
                const result = await authSystem.deleteAccount(password);
                
                if (result.success) {
                    this.closeModal();
                    this.showToast('Account deleted', 'success');
                } else {
                    this.showToast(result.error, 'error');
                }
            }
        }
    }

    showForgotPasswordDialog() {
        const email = prompt('Enter your email address:');
        
        if (email) {
            authSystem.resetPassword(email).then(result => {
                if (result.success) {
                    this.showToast('Password reset email sent!', 'success');
                } else {
                    this.showToast(result.error, 'error');
                }
            });
        }
    }

    // ============================================
    // UI UPDATES
    // ============================================

    setupAuthListeners() {
        authSystem.on('login', (user) => {
            this.updateAuthUI();
        });

        authSystem.on('logout', () => {
            this.updateAuthUI();
        });

        authSystem.on('profile_updated', () => {
            this.updateAuthUI();
        });

        authSystem.on('session_restored', () => {
            this.updateAuthUI();
        });
    }

    updateAuthUI() {
        const user = authSystem.getUser();
        const isLoggedIn = authSystem.isLoggedIn();

        // Update header
        const headerBalance = document.getElementById('header-balance');
        const headerLevel = document.getElementById('header-level');
        
        if (headerBalance && user) {
            headerBalance.textContent = `$${user.balance?.toLocaleString() || 0}`;
        }
        
        if (headerLevel && user) {
            headerLevel.textContent = `Level ${user.level || 1}`;
        }

        // Update user avatar/button
        this.updateUserButton(user, isLoggedIn);
    }

    updateUserButton(user, isLoggedIn) {
        let userBtn = document.getElementById('user-profile-btn');
        
        if (!userBtn) {
            // Create user button
            const headerRight = document.querySelector('.header-right');
            if (headerRight) {
                userBtn = document.createElement('button');
                userBtn.id = 'user-profile-btn';
                userBtn.className = 'user-profile-btn';
                headerRight.appendChild(userBtn);
                
                userBtn.addEventListener('click', () => {
                    if (isLoggedIn) {
                        this.showProfileModal();
                    } else {
                        this.showLoginModal();
                    }
                });
            }
        }

        if (userBtn) {
            if (isLoggedIn && user) {
                userBtn.innerHTML = `
                    <span class="user-avatar">${user.avatar || '👤'}</span>
                    <span class="user-name">${user.username}</span>
                `;
                userBtn.classList.add('logged-in');
            } else {
                userBtn.innerHTML = `
                    <span class="user-avatar">👤</span>
                    <span class="user-name">Sign In</span>
                `;
                userBtn.classList.remove('logged-in');
            }
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `auth-toast auth-toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.classList.add('active');
        });

        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ============================================
    // STYLES
    // ============================================

    addStyles() {
        if (document.getElementById('auth-ui-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'auth-ui-styles';
        styles.textContent = `
            /* Auth Modal Base */
            .auth-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .auth-modal.active {
                opacity: 1;
            }

            .auth-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
            }

            .auth-modal-container {
                position: relative;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                transform: translateY(20px);
                transition: transform 0.3s ease;
            }

            .auth-modal.active .auth-modal-container {
                transform: translateY(0);
            }

            .auth-modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                z-index: 1;
                transition: all 0.2s;
            }

            .auth-modal-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(90deg);
            }

            .auth-modal-content {
                padding: 40px;
                color: white;
            }

            .auth-modal-header {
                text-align: center;
                margin-bottom: 30px;
            }

            .auth-modal-header h2 {
                font-size: 28px;
                margin-bottom: 10px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .auth-modal-header p {
                opacity: 0.7;
                font-size: 14px;
            }

            /* Admin Login Info */
            .admin-login-info {
                margin: 20px 30px;
                padding: 16px;
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1));
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 12px;
                animation: pulse-glow 2s ease-in-out infinite;
            }

            .admin-info-icon {
                font-size: 32px;
                flex-shrink: 0;
            }

            .admin-info-content {
                flex: 1;
            }

            .admin-info-content strong {
                display: block;
                color: #ffd700;
                font-size: 14px;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .admin-credentials {
                display: flex;
                flex-direction: column;
                gap: 4px;
                font-size: 13px;
                color: var(--text-secondary);
            }

            .admin-credentials code {
                background: rgba(0, 0, 0, 0.3);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                color: #ffd700;
                font-weight: 600;
            }

            /* Auth Tabs */
            .auth-tabs {
                display: flex;
                gap: 10px;
                margin-bottom: 30px;
                background: rgba(0, 0, 0, 0.3);
                padding: 5px;
                border-radius: 12px;
            }

            .auth-tab {
                flex: 1;
                padding: 12px;
                border: none;
                background: transparent;
                color: white;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.2s;
            }

            .auth-tab.active {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            /* Auth Form */
            .auth-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .form-group label {
                font-size: 14px;
                font-weight: 600;
                opacity: 0.9;
            }

            .form-group input {
                padding: 14px 16px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                color: white;
                font-size: 15px;
                transition: all 0.2s;
            }

            .form-group input:focus {
                outline: none;
                border-color: #667eea;
                background: rgba(0, 0, 0, 0.4);
            }

            .form-hint {
                font-size: 12px;
                opacity: 0.6;
                margin-top: 4px;
            }

            .form-options {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 14px;
            }

            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
            }

            .checkbox-label input[type="checkbox"] {
                width: 18px;
                height: 18px;
                cursor: pointer;
            }

            .text-link {
                color: #667eea;
                text-decoration: none;
                transition: opacity 0.2s;
            }

            .text-link:hover {
                opacity: 0.8;
            }

            .auth-submit-btn {
                padding: 14px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 10px;
                color: white;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .auth-submit-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
            }

            .auth-submit-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .auth-error {
                padding: 12px;
                background: rgba(255, 71, 87, 0.2);
                border: 1px solid #ff4757;
                border-radius: 8px;
                color: #ff4757;
                font-size: 14px;
            }

            .auth-divider {
                display: flex;
                align-items: center;
                gap: 15px;
                margin: 25px 0;
                opacity: 0.5;
                font-size: 13px;
            }

            .auth-divider::before,
            .auth-divider::after {
                content: '';
                flex: 1;
                height: 1px;
                background: rgba(255, 255, 255, 0.2);
            }

            /* Social Auth */
            .social-auth-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }

            .social-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                color: white;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .social-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
            }

            .social-icon {
                font-size: 18px;
            }

            .guest-option {
                margin-top: 15px;
                text-align: center;
            }

            .guest-btn {
                padding: 12px 24px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                color: white;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .guest-btn:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            /* Profile Modal */
            .profile-modal {
                max-width: 600px;
            }

            .profile-avatar-section {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 30px;
            }

            .profile-avatar-large {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
            }

            .profile-basic-info h3 {
                font-size: 24px;
                margin-bottom: 5px;
            }

            .profile-email {
                opacity: 0.7;
                font-size: 14px;
                margin-bottom: 10px;
            }

            .profile-badges {
                display: flex;
                gap: 8px;
            }

            .badge {
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
            }

            .level-badge {
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                color: #000;
            }

            .membership-badge {
                background: rgba(255, 255, 255, 0.2);
            }

            .membership-badge.pro {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .membership-badge.vip {
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                color: #000;
            }

            .profile-stats-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-bottom: 30px;
            }

            .profile-stat {
                text-align: center;
                padding: 20px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 12px;
            }

            .profile-stat .stat-value {
                font-size: 24px;
                font-weight: 700;
                color: #00ff88;
                margin-bottom: 5px;
            }

            .profile-stat .stat-label {
                font-size: 12px;
                opacity: 0.7;
            }

            .profile-tabs {
                display: flex;
                gap: 10px;
                margin-bottom: 25px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .profile-tab {
                padding: 12px 20px;
                border: none;
                background: transparent;
                color: white;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                border-bottom: 3px solid transparent;
                transition: all 0.2s;
            }

            .profile-tab.active {
                border-bottom-color: #667eea;
            }

            .avatar-picker {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 10px;
            }

            .avatar-option {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: 2px solid transparent;
                background: rgba(0, 0, 0, 0.3);
                font-size: 24px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .avatar-option:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .avatar-option.selected {
                border-color: #667eea;
                background: rgba(102, 126, 234, 0.2);
            }

            .danger-zone {
                margin-top: 30px;
                padding: 20px;
                background: rgba(255, 71, 87, 0.1);
                border: 1px solid rgba(255, 71, 87, 0.3);
                border-radius: 12px;
            }

            .danger-zone h4 {
                margin-bottom: 10px;
                color: #ff4757;
            }

            .danger-zone p {
                opacity: 0.8;
                font-size: 14px;
                margin-bottom: 15px;
            }

            .danger-btn {
                padding: 10px 20px;
                background: #ff4757;
                border: none;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .danger-btn:hover {
                background: #ff3838;
            }

            .danger-btn-outline {
                padding: 10px 20px;
                background: transparent;
                border: 2px solid #ff4757;
                border-radius: 8px;
                color: #ff4757;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .danger-btn-outline:hover {
                background: rgba(255, 71, 87, 0.1);
            }

            .profile-actions {
                display: flex;
                gap: 10px;
                margin-top: 25px;
            }

            .secondary-btn {
                flex: 1;
                padding: 12px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 10px;
                color: white;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .secondary-btn:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            .preferences-list {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .preference-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 12px;
            }

            .preference-item h4 {
                margin-bottom: 5px;
                font-size: 16px;
            }

            .preference-item p {
                font-size: 13px;
                opacity: 0.7;
            }

            .toggle-switch {
                position: relative;
                width: 50px;
                height: 26px;
            }

            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 34px;
                transition: 0.3s;
            }

            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                border-radius: 50%;
                transition: 0.3s;
            }

            .toggle-switch input:checked + .toggle-slider {
                background: #667eea;
            }

            .toggle-switch input:checked + .toggle-slider:before {
                transform: translateX(24px);
            }

            /* Guest Conversion */
            .upgrade-benefits {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-bottom: 30px;
            }

            .benefit-item {
                display: flex;
                gap: 15px;
                align-items: start;
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 12px;
            }

            .benefit-icon {
                font-size: 28px;
            }

            .benefit-item h4 {
                margin-bottom: 5px;
                font-size: 16px;
            }

            .benefit-item p {
                font-size: 13px;
                opacity: 0.7;
            }

            .guest-upgrade-section {
                padding: 25px;
                background: rgba(102, 126, 234, 0.1);
                border: 1px solid rgba(102, 126, 234, 0.3);
                border-radius: 12px;
                margin-bottom: 20px;
            }

            .upgrade-message h4 {
                margin-bottom: 10px;
                font-size: 18px;
            }

            .upgrade-message p {
                opacity: 0.8;
                margin-bottom: 20px;
            }

            /* User Button */
            .user-profile-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 16px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 25px;
                color: white;
                cursor: pointer;
                transition: all 0.2s;
            }

            .user-profile-btn:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-2px);
            }

            .user-avatar {
                font-size: 20px;
            }

            .user-name {
                font-size: 14px;
                font-weight: 600;
            }

            /* Toast */
            .auth-toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 16px 24px;
                border-radius: 12px;
                color: white;
                font-weight: 600;
                z-index: 10001;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s ease;
            }

            .auth-toast.active {
                transform: translateY(0);
                opacity: 1;
            }

            .auth-toast-success {
                background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
                color: #000;
            }

            .auth-toast-error {
                background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
            }

            .auth-toast-info {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            /* Mobile Responsive */
            @media (max-width: 768px) {
                .auth-modal-content {
                    padding: 30px 20px;
                }

                .social-auth-buttons {
                    grid-template-columns: 1fr;
                }

                .profile-avatar-section {
                    flex-direction: column;
                    text-align: center;
                }

                .profile-stats-grid {
                    grid-template-columns: 1fr;
                }

                .avatar-picker {
                    grid-template-columns: repeat(5, 1fr);
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Export singleton instance
export const authUI = new AuthUI();
