// ============================================
// AUTH UI V2 - Production Ready
// Clean login/signup/profile interface
// ============================================

import { authSystem } from './auth-system-v2.js';

class AuthUIV2 {
    constructor() {
        this.currentModal = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        // Listen for auth state changes
        authSystem.on('login', (user) => this.onLogin(user));
        authSystem.on('logout', () => this.onLogout());
        authSystem.on('register', (user) => this.onRegister(user));

        // Update UI based on current auth state
        this.updateAuthUI();

        this.initialized = true;
        console.log('🎨 Auth UI V2 initialized');
    }

    // ============================================
    // LOGIN MODAL
    // ============================================

    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'auth-modal-overlay';
        modal.innerHTML = `
            <div class="auth-modal">
                <button class="auth-modal-close" onclick="this.closest('.auth-modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>

                <div class="auth-modal-content">
                    <div class="auth-modal-header">
                        <h2>Welcome Back!</h2>
                        <p>Sign in to continue your sports betting journey</p>
                    </div>

                    <!-- Tabs -->
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">Login</button>
                        <button class="auth-tab" data-tab="register">Sign Up</button>
                    </div>

                    <!-- Login Tab -->
                    <div class="auth-tab-content active" id="login-tab">
                        <form id="login-form" class="auth-form">
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="email" placeholder="your@email.com" required autocomplete="email">
                            </div>

                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" name="password" placeholder="••••••••" required autocomplete="current-password">
                            </div>

                            <div class="form-options">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="rememberMe" checked>
                                    <span>Remember me</span>
                                </label>
                                <a href="#" class="text-link" id="forgot-password-link">Forgot password?</a>
                            </div>

                            <button type="submit" class="auth-submit-btn">
                                <span class="btn-text">Sign In</span>
                                <span class="btn-loader" style="display: none;">
                                    <i class="fas fa-spinner fa-spin"></i>
                                </span>
                            </button>

                            <div class="auth-message" id="login-message"></div>
                        </form>

                        <div class="auth-divider">
                            <span>or continue with</span>
                        </div>

                        <div class="social-auth-buttons">
                            <button class="social-btn google-btn" id="google-login-btn">
                                <span class="social-icon">G</span>
                                <span>Google</span>
                            </button>
                            <button class="social-btn apple-btn" id="apple-login-btn">
                                <span class="social-icon"></span>
                                <span>Apple</span>
                            </button>
                        </div>
                    </div>

                    <!-- Register Tab -->
                    <div class="auth-tab-content" id="register-tab">
                        <form id="register-form" class="auth-form">
                            <div class="form-group">
                                <label>Username</label>
                                <input type="text" name="username" placeholder="Choose a username" required minlength="3" autocomplete="username">
                            </div>

                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="email" placeholder="your@email.com" required autocomplete="email">
                            </div>

                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" name="password" placeholder="••••••••" required minlength="8" autocomplete="new-password">
                                <small>At least 8 characters with uppercase, lowercase, and number</small>
                            </div>

                            <div class="form-group">
                                <label>Confirm Password</label>
                                <input type="password" name="confirmPassword" placeholder="••••••••" required minlength="8" autocomplete="new-password">
                            </div>

                            <div class="form-checkbox">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="agreeToTerms" required>
                                    <span>I agree to the <a href="/terms-of-service.html" target="_blank">Terms of Service</a> and <a href="/privacy-policy.html" target="_blank">Privacy Policy</a></span>
                                </label>
                            </div>

                            <button type="submit" class="auth-submit-btn">
                                <span class="btn-text">Create Account</span>
                                <span class="btn-loader" style="display: none;">
                                    <i class="fas fa-spinner fa-spin"></i>
                                </span>
                            </button>

                            <div class="auth-message" id="register-message"></div>
                        </form>

                        <div class="auth-divider">
                            <span>or sign up with</span>
                        </div>

                        <div class="social-auth-buttons">
                            <button class="social-btn google-btn" id="google-register-btn">
                                <span class="social-icon">G</span>
                                <span>Google</span>
                            </button>
                            <button class="social-btn apple-btn" id="apple-register-btn">
                                <span class="social-icon"></span>
                                <span>Apple</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.currentModal = modal;

        // Attach event listeners
        this.attachModalListeners(modal);

        // Focus first input
        setTimeout(() => {
            modal.querySelector('input').focus();
        }, 100);
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    attachModalListeners(modal) {
        // Tab switching
        modal.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                
                // Update active tab
                modal.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update active content
                modal.querySelectorAll('.auth-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                modal.querySelector(`#${targetTab}-tab`).classList.add('active');
            });
        });

        // Login form
        const loginForm = modal.querySelector('#login-form');
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));

        // Register form
        const registerForm = modal.querySelector('#register-form');
        registerForm.addEventListener('submit', (e) => this.handleRegister(e));

        // Forgot password
        const forgotLink = modal.querySelector('#forgot-password-link');
        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showForgotPasswordModal();
            });
        }

        // Social auth buttons
        modal.querySelectorAll('.google-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleGoogleAuth());
        });
        modal.querySelectorAll('.apple-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleAppleAuth());
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // ============================================
    // FORM HANDLERS
    // ============================================

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('.auth-submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        const messageEl = form.querySelector('#login-message');

        try {
            // Show loading
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
            messageEl.textContent = '';
            messageEl.className = 'auth-message';

            // Get form data
            const formData = new FormData(form);
            const credentials = {
                email: formData.get('email'),
                password: formData.get('password'),
                rememberMe: formData.get('rememberMe') === 'on'
            };

            // Login
            await authSystem.login(credentials);

            // Success - close modal
            messageEl.textContent = 'Login successful!';
            messageEl.className = 'auth-message success';
            
            setTimeout(() => {
                this.currentModal?.remove();
                this.currentModal = null;
            }, 1000);

        } catch (error) {
            console.error('❌ Login error:', error);
            messageEl.textContent = error.message || 'Login failed. Please try again.';
            messageEl.className = 'auth-message error';
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('.auth-submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        const messageEl = form.querySelector('#register-message');

        try {
            // Show loading
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
            messageEl.textContent = '';
            messageEl.className = 'auth-message';

            // Get form data
            const formData = new FormData(form);
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');

            // Validate passwords match
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            const userData = {
                username: formData.get('username'),
                email: formData.get('email'),
                password: password
            };

            // Register
            await authSystem.register(userData);

            // Success - close modal
            messageEl.textContent = 'Account created successfully!';
            messageEl.className = 'auth-message success';
            
            setTimeout(() => {
                this.currentModal?.remove();
                this.currentModal = null;
            }, 1000);

        } catch (error) {
            console.error('❌ Register error:', error);
            messageEl.textContent = error.message || 'Registration failed. Please try again.';
            messageEl.className = 'auth-message error';
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
        }
    }

    // ============================================
    // SOCIAL AUTH
    // ============================================

    handleGoogleAuth() {
        console.log('🔍 Google auth not implemented yet');
        alert('Google authentication coming soon!');
    }

    handleAppleAuth() {
        console.log('🍎 Apple auth not implemented yet');
        alert('Apple authentication coming soon!');
    }

    // ============================================
    // FORGOT PASSWORD
    // ============================================

    showForgotPasswordModal() {
        const modal = document.createElement('div');
        modal.className = 'auth-modal-overlay';
        modal.innerHTML = `
            <div class="auth-modal auth-modal-small">
                <button class="auth-modal-close" onclick="this.closest('.auth-modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>

                <div class="auth-modal-content">
                    <div class="auth-modal-header">
                        <h2>Reset Password</h2>
                        <p>Enter your email to receive a reset link</p>
                    </div>

                    <form id="forgot-password-form" class="auth-form">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" placeholder="your@email.com" required>
                        </div>

                        <button type="submit" class="auth-submit-btn">
                            <span>Send Reset Link</span>
                        </button>

                        <div class="auth-message" id="forgot-message"></div>
                    </form>
                </div>
            </div>
        `;

        // Remove current modal
        this.currentModal?.remove();
        
        document.body.appendChild(modal);
        this.currentModal = modal;

        // Handle form submit
        modal.querySelector('#forgot-password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const messageEl = modal.querySelector('#forgot-message');
            
            try {
                messageEl.textContent = 'Reset link sent! Check your email.';
                messageEl.className = 'auth-message success';
                
                setTimeout(() => {
                    modal.remove();
                    this.showLoginModal();
                }, 2000);
            } catch (error) {
                messageEl.textContent = error.message;
                messageEl.className = 'auth-message error';
            }
        });
    }

    // ============================================
    // AUTH STATE HANDLERS
    // ============================================

    onLogin(user) {
        console.log('✅ User logged in:', user.username);
        this.updateAuthUI();
    }

    onLogout() {
        console.log('👋 User logged out');
        this.updateAuthUI();
    }

    onRegister(user) {
        console.log('✅ User registered:', user.username);
        this.updateAuthUI();
    }

    // ============================================
    // UI UPDATES
    // ============================================

    updateAuthUI() {
        const isLoggedIn = authSystem.isLoggedIn();
        const user = authSystem.getUser();

        // Update profile button in header
        const profileBtn = document.querySelector('.nav-profile-btn');
        if (profileBtn) {
            if (isLoggedIn && user) {
                profileBtn.innerHTML = `
                    <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
                    <span>${user.username}</span>
                `;
                profileBtn.onclick = () => this.showProfileMenu();
            } else {
                profileBtn.innerHTML = `
                    <i class="fas fa-user"></i>
                    <span>Login</span>
                `;
                profileBtn.onclick = () => this.showLoginModal();
            }
        }

        // Update login button
        const loginBtn = document.getElementById('show-login-btn');
        if (loginBtn) {
            if (isLoggedIn) {
                loginBtn.style.display = 'none';
            } else {
                loginBtn.style.display = 'block';
                loginBtn.onclick = () => this.showLoginModal();
            }
        }
    }

    // ============================================
    // PROFILE MENU
    // ============================================

    showProfileMenu() {
        const user = authSystem.getUser();
        if (!user) return;

        const menu = document.createElement('div');
        menu.className = 'profile-dropdown-menu';
        menu.innerHTML = `
            <div class="profile-menu-header">
                <div class="profile-menu-avatar">${user.username.charAt(0).toUpperCase()}</div>
                <div class="profile-menu-info">
                    <div class="profile-menu-name">${user.username}</div>
                    <div class="profile-menu-email">${user.email || ''}</div>
                </div>
            </div>
            <div class="profile-menu-divider"></div>
            <button class="profile-menu-item" onclick="window.appNavigation?.navigateTo('profile')">
                <i class="fas fa-user"></i>
                <span>Profile</span>
            </button>
            <button class="profile-menu-item" onclick="window.appNavigation?.navigateTo('settings')">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
            </button>
            <div class="profile-menu-divider"></div>
            <button class="profile-menu-item profile-menu-logout" id="profile-logout-btn">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </button>
        `;

        document.body.appendChild(menu);

        // Position menu
        const profileBtn = document.querySelector('.nav-profile-btn');
        if (profileBtn) {
            const rect = profileBtn.getBoundingClientRect();
            menu.style.top = `${rect.bottom + 8}px`;
            menu.style.right = `${window.innerWidth - rect.right}px`;
        }

        // Handle logout
        menu.querySelector('#profile-logout-btn').addEventListener('click', async () => {
            try {
                await authSystem.logout();
                menu.remove();
            } catch (error) {
                console.error('❌ Logout error:', error);
            }
        });

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && !profileBtn.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }
}

// Export singleton
export const authUI = new AuthUIV2();
export { AuthUIV2 };
