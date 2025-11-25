// ============================================
// PROFILE UI HANDLER
// Login, Register, and User Profile Display
// ============================================

const ProfileUI = {
    
    init() {
        // Check if user is logged in and render appropriate UI
        this.render();
        
        // Listen for page navigation to profile
        const profilePage = document.getElementById('profile-page');
        if (profilePage) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.target.classList.contains('active')) {
                        this.render();
                    }
                });
            });
            
            observer.observe(profilePage, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
        
        console.log('✅ Profile UI initialized');
    },
    
    render() {
        const container = document.getElementById('profile-content');
        if (!container) return;
        
        if (window.AuthService?.isAuthenticated()) {
            this.renderUserProfile();
        } else {
            this.renderLoginForm();
        }
    },
    
    renderLoginForm() {
        const container = document.getElementById('profile-content');
        container.innerHTML = `
            <div style="max-width: 500px; margin: 40px auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <h1 style="font-size: 32px; margin-bottom: 8px;">
                        <i class="fas fa-user-circle" style="color: #10b981;"></i> Welcome Back
                    </h1>
                    <p style="color: #6b7280;">Sign in to access your sports analytics dashboard</p>
                </div>
                
                <!-- Login/Register Toggle -->
                <div style="display: flex; gap: 8px; margin-bottom: 24px; background: #f3f4f6; padding: 4px; border-radius: 12px;">
                    <button id="login-tab" class="auth-tab active" style="
                        flex: 1;
                        padding: 12px;
                        border: none;
                        background: white;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">Login</button>
                    <button id="register-tab" class="auth-tab" style="
                        flex: 1;
                        padding: 12px;
                        border: none;
                        background: transparent;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">Register</button>
                </div>
                
                <!-- Login Form -->
                <div id="login-form" class="auth-form">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Email</label>
                        <input type="email" id="login-email" placeholder="your@email.com" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 14px;
                            box-sizing: border-box;
                        ">
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Password</label>
                        <input type="password" id="login-password" placeholder="••••••••" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 14px;
                            box-sizing: border-box;
                        ">
                    </div>
                    
                    <div id="login-error" style="
                        display: none;
                        padding: 12px;
                        background: #fee2e2;
                        border: 1px solid #fecaca;
                        border-radius: 8px;
                        color: #991b1b;
                        margin-bottom: 16px;
                        font-size: 14px;
                    "></div>
                    
                    <button id="login-btn" style="
                        width: 100%;
                        padding: 14px;
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-weight: 700;
                        font-size: 16px;
                        cursor: pointer;
                        transition: transform 0.2s;
                    " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        Sign In
                    </button>
                    
                    <p style="text-align: center; margin-top: 16px; font-size: 14px; color: #6b7280;">
                        Test Account: <strong>test@example.com</strong> / <strong>password123</strong>
                    </p>
                </div>
                
                <!-- Register Form -->
                <div id="register-form" class="auth-form" style="display: none;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Username</label>
                        <input type="text" id="register-username" placeholder="johndoe" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 14px;
                            box-sizing: border-box;
                        ">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Email</label>
                        <input type="email" id="register-email" placeholder="your@email.com" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 14px;
                            box-sizing: border-box;
                        ">
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Password</label>
                        <input type="password" id="register-password" placeholder="••••••••" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 14px;
                            box-sizing: border-box;
                        ">
                        <p style="font-size: 12px; color: #6b7280; margin-top: 4px;">Minimum 8 characters</p>
                    </div>
                    
                    <div id="register-error" style="
                        display: none;
                        padding: 12px;
                        background: #fee2e2;
                        border: 1px solid #fecaca;
                        border-radius: 8px;
                        color: #991b1b;
                        margin-bottom: 16px;
                        font-size: 14px;
                    "></div>
                    
                    <button id="register-btn" style="
                        width: 100%;
                        padding: 14px;
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-weight: 700;
                        font-size: 16px;
                        cursor: pointer;
                        transition: transform 0.2s;
                    " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        Create Account
                    </button>
                </div>
            </div>
        `;
        
        // Setup event listeners
        this.setupLoginForm();
    },
    
    setupLoginForm() {
        // Tab switching
        document.getElementById('login-tab')?.addEventListener('click', () => {
            document.getElementById('login-tab').style.background = 'white';
            document.getElementById('register-tab').style.background = 'transparent';
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('register-form').style.display = 'none';
        });
        
        document.getElementById('register-tab')?.addEventListener('click', () => {
            document.getElementById('register-tab').style.background = 'white';
            document.getElementById('login-tab').style.background = 'transparent';
            document.getElementById('register-form').style.display = 'block';
            document.getElementById('login-form').style.display = 'none';
        });
        
        // Login button
        document.getElementById('login-btn')?.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorEl = document.getElementById('login-error');
            const btn = document.getElementById('login-btn');
            
            if (!email || !password) {
                errorEl.textContent = 'Please fill in all fields';
                errorEl.style.display = 'block';
                return;
            }
            
            btn.textContent = 'Signing in...';
            btn.disabled = true;
            errorEl.style.display = 'none';
            
            try {
                await window.AuthService.login(email, password);
                this.renderUserProfile();
                
                // Update drawer UI
                if (window.initializeApp) {
                    window.initializeApp();
                }
            } catch (error) {
                errorEl.textContent = error.message || 'Login failed. Please try again.';
                errorEl.style.display = 'block';
                btn.textContent = 'Sign In';
                btn.disabled = false;
            }
        });
        
        // Register button
        document.getElementById('register-btn')?.addEventListener('click', async () => {
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const errorEl = document.getElementById('register-error');
            const btn = document.getElementById('register-btn');
            
            if (!username || !email || !password) {
                errorEl.textContent = 'Please fill in all fields';
                errorEl.style.display = 'block';
                return;
            }
            
            if (password.length < 8) {
                errorEl.textContent = 'Password must be at least 8 characters';
                errorEl.style.display = 'block';
                return;
            }
            
            btn.textContent = 'Creating account...';
            btn.disabled = true;
            errorEl.style.display = 'none';
            
            try {
                await window.AuthService.register(username, email, password);
                this.renderUserProfile();
                
                // Update drawer UI
                if (window.initializeApp) {
                    window.initializeApp();
                }
            } catch (error) {
                errorEl.textContent = error.message || 'Registration failed. Please try again.';
                errorEl.style.display = 'block';
                btn.textContent = 'Create Account';
                btn.disabled = false;
            }
        });
        
        // Enter key support
        ['login-email', 'login-password'].forEach(id => {
            document.getElementById(id)?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    document.getElementById('login-btn').click();
                }
            });
        });
    },
    
    renderUserProfile() {
        const user = window.AuthService?.getUser();
        if (!user) {
            this.renderLoginForm();
            return;
        }
        
        const container = document.getElementById('profile-content');
        container.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 16px;
                    padding: 40px;
                    color: white;
                    text-align: center;
                    margin-bottom: 24px;
                ">
                    <div style="font-size: 64px; margin-bottom: 16px;">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <h1 style="font-size: 32px; margin-bottom: 8px;">${user.username}</h1>
                    <p style="opacity: 0.9; margin-bottom: 16px;">${user.email}</p>
                    <div style="
                        display: inline-block;
                        background: rgba(255,255,255,0.2);
                        padding: 8px 20px;
                        border-radius: 20px;
                        font-weight: 700;
                        font-size: 14px;
                    ">
                        ${user.subscription_tier || 'FREE'} TIER
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="font-size: 32px; font-weight: 800; color: #10b981; margin-bottom: 4px;">
                            ${user.level || 1}
                        </div>
                        <div style="color: #6b7280; font-size: 14px;">Level</div>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="font-size: 32px; font-weight: 800; color: #f59e0b; margin-bottom: 4px;">
                            ${user.coins || 0}
                        </div>
                        <div style="color: #6b7280; font-size: 14px;">Coins</div>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="font-size: 32px; font-weight: 800; color: #3b82f6; margin-bottom: 4px;">
                            ${user.xp || 0}
                        </div>
                        <div style="color: #6b7280; font-size: 14px;">XP</div>
                    </div>
                </div>
                
                <button id="logout-btn" style="
                    width: 100%;
                    padding: 14px;
                    background: #ef4444;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 16px;
                    cursor: pointer;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        `;
        
        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            window.AuthService.logout();
            this.renderLoginForm();
            
            // Update drawer UI
            if (window.initializeApp) {
                window.initializeApp();
            }
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProfileUI.init());
} else {
    ProfileUI.init();
}

console.log('📦 Profile UI loaded');
