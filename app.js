// ============================================
// ULTIMATE SPORTS AI - CLEAN APP
// Production-ready frontend connecting to Railway backend
// ============================================

console.log('🚀 Ultimate Sports AI v4.0 - Clean Build');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    API_BASE_URL: 'https://ultimate-sports-ai-production.up.railway.app',
    WS_URL: 'wss://ultimate-sports-ai-production.up.railway.app',
    PAYPAL_CLIENT_ID: 'YOUR_PAYPAL_CLIENT_ID', // Set in Railway env
    VERSION: '4.0.0'
};

// ============================================
// STATE MANAGEMENT
// ============================================

class AppState {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.currentPage = 'home';
        this.listeners = [];
    }

    setUser(user) {
        this.user = user;
        this.isAuthenticated = !!user;
        this.notify();
    }

    clearUser() {
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('auth_token');
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this));
    }
}

const appState = new AppState();

// ============================================
// API SERVICE
// ============================================

class APIService {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = localStorage.getItem('auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: this.getHeaders(),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async signup(email, password, username) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, username })
        });
    }

    async login(email, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async getCurrentUser() {
        return this.request('/api/auth/me');
    }

    async logout() {
        return this.request('/api/auth/logout', {
            method: 'POST'
        });
    }

    // OAuth endpoints
    getOAuthURL(provider) {
        return `${this.baseURL}/api/auth/${provider}`;
    }

    // Live scores
    async getLiveScores() {
        return this.request('/api/scores/live');
    }

    // AI Coaches
    async getAIPredictions(gameId) {
        return this.request(`/api/ai/predictions/${gameId}`);
    }

    // User analytics
    async getUserAnalytics() {
        return this.request('/api/analytics/user');
    }

    // Subscription
    async createSubscription(tier) {
        return this.request('/api/payments/subscribe', {
            method: 'POST',
            body: JSON.stringify({ tier })
        });
    }

    async cancelSubscription() {
        return this.request('/api/payments/cancel', {
            method: 'POST'
        });
    }
}

const api = new APIService();

// ============================================
// AUTH MANAGER
// ============================================

class AuthManager {
    constructor() {
        this.init();
    }

    async init() {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const user = await api.getCurrentUser();
                appState.setUser(user);
                console.log('✅ User authenticated:', user.email);
            } catch (error) {
                console.error('⚠️ Backend unavailable or auth check failed:', error);
                // Don't logout - just stay as guest
                console.log('ℹ️ Starting as guest user - backend may be offline');
            }
        } else {
            console.log('ℹ️ No auth token found - starting as guest');
        }
    }

    async signup(email, password, name) {
        try {
            const response = await api.signup(email, password, name);
            localStorage.setItem('auth_token', response.token);
            appState.setUser(response.user);
            showToast('Account created successfully!', 'success');
            return true;
        } catch (error) {
            showToast(error.message || 'Signup failed', 'error');
            return false;
        }
    }

    async login(email, password) {
        try {
            const response = await api.login(email, password);
            localStorage.setItem('auth_token', response.token);
            appState.setUser(response.user);
            showToast('Welcome back!', 'success');
            return true;
        } catch (error) {
            showToast(error.message || 'Login failed', 'error');
            return false;
        }
    }

    logout() {
        appState.clearUser();
        showToast('Logged out successfully', 'success');
        navigation.navigateTo('home');
    }

    async handleOAuthCallback() {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        
        if (token) {
            localStorage.setItem('auth_token', token);
            window.history.replaceState({}, '', window.location.pathname);
            await this.init();
            showToast('Logged in successfully!', 'success');
        }
    }
}

const authManager = new AuthManager();

// ============================================
// NAVIGATION
// ============================================

class Navigation {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        // Drawer toggle
        const menuBtn = document.getElementById('menu-btn');
        const drawer = document.getElementById('drawer-nav');
        const overlay = document.getElementById('drawer-overlay');

        menuBtn?.addEventListener('click', () => {
            drawer.classList.toggle('active');
            overlay.classList.toggle('active');
        });

        overlay?.addEventListener('click', () => {
            drawer.classList.remove('active');
            overlay.classList.remove('active');
        });

        // Bottom nav buttons
        document.querySelectorAll('.bottom-nav-item[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                this.navigateTo(page);
                
                // Update active state
                document.querySelectorAll('.bottom-nav-item').forEach(b => 
                    b.classList.remove('active')
                );
                btn.classList.add('active');
            });
        });

        // Drawer menu buttons
        document.querySelectorAll('.menu-item[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                this.navigateTo(page);
                
                // Update active state
                document.querySelectorAll('.menu-item').forEach(b => 
                    b.classList.remove('active')
                );
                btn.classList.add('active');
                
                // Close drawer
                drawer?.classList.remove('active');
                overlay?.classList.remove('active');
            });
        });

        // Quick action cards
        document.querySelectorAll('.quick-action-card[data-page]').forEach(card => {
            card.addEventListener('click', () => {
                this.navigateTo(card.dataset.page);
            });
        });

        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            authManager.logout();
            drawer?.classList.remove('active');
            overlay?.classList.remove('active');
        });

        console.log('✅ Navigation initialized');
    }

    navigateTo(page) {
        console.log(`📍 Navigate to: ${page}`);

        // Check if user needs to be authenticated
        if (!appState.isAuthenticated && page !== 'home') {
            this.showAuthPage();
            return;
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => 
            p.classList.remove('active')
        );

        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
            window.scrollTo(0, 0);

            // Load page-specific data
            this.loadPageData(page);
        } else {
            console.error(`❌ Page not found: ${page}`);
        }
    }

    showAuthPage() {
        document.querySelectorAll('.page').forEach(p => 
            p.classList.remove('active')
        );
        document.getElementById('auth-page')?.classList.add('active');
    }

    async loadPageData(page) {
        switch(page) {
            case 'live-scores':
                await liveScoresModule.load();
                break;
            case 'ai-coaches':
                await aiCoachesModule.load();
                break;
            case 'analytics':
                await analyticsModule.load();
                break;
            case 'profile':
                await profileModule.load();
                break;
        }
    }
}

const navigation = new Navigation();

// ============================================
// AUTH UI
// ============================================

class AuthUI {
    constructor() {
        this.init();
    }

    init() {
        // Toggle between login and signup
        document.getElementById('show-signup')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('signup-form').style.display = 'block';
        });

        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('signup-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        });

        // Login form
        document.getElementById('login-form-element')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const success = await authManager.login(email, password);
            if (success) {
                navigation.navigateTo('home');
            }
        });

        // Signup form
        document.getElementById('signup-form-element')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            const success = await authManager.signup(email, password, name);
            if (success) {
                navigation.navigateTo('home');
            }
        });

        // OAuth buttons
        const setupOAuthButton = (buttonId, provider) => {
            document.getElementById(buttonId)?.addEventListener('click', () => {
                window.location.href = api.getOAuthURL(provider);
            });
        };

        setupOAuthButton('google-login-btn', 'google');
        setupOAuthButton('google-signup-btn', 'google');
        setupOAuthButton('apple-login-btn', 'apple');
        setupOAuthButton('apple-signup-btn', 'apple');

        console.log('✅ Auth UI initialized');
    }
}

const authUI = new AuthUI();

// ============================================
// LIVE SCORES MODULE
// ============================================

const liveScoresModule = {
    async load() {
        const container = document.getElementById('live-scores-container');
        if (!container) return;

        try {
            container.innerHTML = '<p class="loading-text">Loading live scores...</p>';
            const scores = await api.getLiveScores();
            this.render(scores, container);
        } catch (error) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <p style="color: var(--text-secondary);">Unable to load live scores</p>
                    <button class="btn btn-secondary" onclick="liveScoresModule.load()">Retry</button>
                </div>
            `;
        }
    },

    render(scores, container) {
        if (!scores || scores.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-calendar-times" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                    <p style="color: var(--text-secondary);">No live games right now</p>
                </div>
            `;
            return;
        }

        container.innerHTML = scores.map(game => `
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <span style="color: var(--text-secondary); font-size: 12px; font-weight: 600;">${game.league}</span>
                    <span class="badge badge-live">LIVE</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 4px;">${game.homeTeam}</div>
                        <div style="font-weight: 600; color: var(--text-secondary);">${game.awayTeam}</div>
                    </div>
                    <div style="text-align: center; padding: 0 24px;">
                        <div style="font-size: 24px; font-weight: 700;">${game.homeScore}</div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--text-secondary);">${game.awayScore}</div>
                    </div>
                </div>
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color); text-align: center; color: var(--text-secondary); font-size: 12px;">
                    ${game.status}
                </div>
            </div>
        `).join('');
    }
};

// ============================================
// AI COACHES MODULE
// ============================================

const aiCoachesModule = {
    async load() {
        const container = document.getElementById('ai-coaches-container');
        if (!container) return;

        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-robot" style="font-size: 64px; color: var(--primary); margin-bottom: 24px;"></i>
                <h2 style="margin-bottom: 16px;">AI Coaches Coming Soon</h2>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">
                    Get expert AI-powered predictions and insights from our advanced coaching system.
                </p>
                <button class="btn btn-primary" onclick="navigation.navigateTo('subscription')">
                    <i class="fas fa-crown"></i> Upgrade to Access
                </button>
            </div>
        `;
    }
};

// ============================================
// ANALYTICS MODULE
// ============================================

const analyticsModule = {
    async load() {
        const container = document.getElementById('analytics-container');
        if (!container) return;

        try {
            container.innerHTML = '<p class="loading-text">Loading analytics...</p>';
            const analytics = await api.getUserAnalytics();
            this.render(analytics, container);
        } catch (error) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <p style="color: var(--text-secondary);">Start making picks to see your analytics</p>
                </div>
            `;
        }
    },

    render(analytics, container) {
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-info">
                        <h4>${analytics.totalPicks || 0}</h4>
                        <p>Total Picks</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-percentage"></i></div>
                    <div class="stat-info">
                        <h4>${analytics.winRate || 0}%</h4>
                        <p>Win Rate</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-fire"></i></div>
                    <div class="stat-info">
                        <h4>${analytics.streak || 0}</h4>
                        <p>Current Streak</p>
                    </div>
                </div>
            </div>
        `;
    }
};

// ============================================
// PROFILE MODULE
// ============================================

const profileModule = {
    async load() {
        const container = document.getElementById('profile-container');
        if (!container) return;

        if (!appState.user) {
            container.innerHTML = '<p class="loading-text">Please log in to view your profile</p>';
            return;
        }

        container.innerHTML = `
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 32px; text-align: center; max-width: 500px; margin: 0 auto;">
                <div style="font-size: 64px; color: var(--primary); margin-bottom: 16px;">
                    <i class="fas fa-user-circle"></i>
                </div>
                <h2 style="margin-bottom: 8px;">${appState.user.name || 'User'}</h2>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">${appState.user.email}</p>
                <div style="padding: 16px; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 24px;">
                    <span style="font-weight: 600; color: var(--primary);">${appState.user.subscription_tier || 'FREE'} TIER</span>
                </div>
                <button class="btn btn-secondary btn-block" onclick="authManager.logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        `;
    }
};

// ============================================
// UI UPDATES
// ============================================

function updateUI() {
    const user = appState.user;
    const isAuthenticated = appState.isAuthenticated;

    // Update user display
    const displayName = document.getElementById('user-display-name');
    const tierBadge = document.getElementById('user-tier-badge');

    if (displayName) {
        displayName.textContent = user?.name || 'Guest User';
    }

    if (tierBadge) {
        tierBadge.textContent = user?.subscription_tier || 'FREE TIER';
    }

    // Update stats on home page
    if (user?.stats) {
        document.getElementById('total-picks').textContent = user.stats.totalPicks || 0;
        document.getElementById('win-rate').textContent = `${user.stats.winRate || 0}%`;
        document.getElementById('current-streak').textContent = user.stats.streak || 0;
    }
}

// Subscribe to state changes
appState.subscribe(updateUI);

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}" style="color: var(--${type === 'success' ? 'success' : 'danger'});"></i>
            <span>${message}</span>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Make showToast globally available
window.showToast = showToast;

// ============================================
// SUBSCRIPTION HANDLERS
// ============================================

document.getElementById('subscribe-pro-btn')?.addEventListener('click', async () => {
    if (!appState.isAuthenticated) {
        navigation.showAuthPage();
        showToast('Please log in to subscribe', 'error');
        return;
    }

    try {
        showToast('Redirecting to checkout...', 'info');
        const response = await api.createSubscription('PRO');
        if (response.checkoutUrl) {
            window.location.href = response.checkoutUrl;
        }
    } catch (error) {
        showToast('Failed to create subscription', 'error');
    }
});

document.getElementById('subscribe-vip-btn')?.addEventListener('click', async () => {
    if (!appState.isAuthenticated) {
        navigation.showAuthPage();
        showToast('Please log in to subscribe', 'error');
        return;
    }

    try {
        showToast('Redirecting to checkout...', 'info');
        const response = await api.createSubscription('VIP');
        if (response.checkoutUrl) {
            window.location.href = response.checkoutUrl;
        }
    } catch (error) {
        showToast('Failed to create subscription', 'error');
    }
});

// ============================================
// APP INITIALIZATION
// ============================================

async function initApp() {
    console.log('⚙️ Initializing Ultimate Sports AI...');

    try {
        // Check for OAuth callback
        await authManager.handleOAuthCallback();
    } catch (error) {
        console.error('OAuth callback error:', error);
    }

    // Hide loader after short delay - ALWAYS hide
    setTimeout(() => {
        const loader = document.getElementById('app-loader');
        if (loader) {
            console.log('✅ Removing loader');
            loader.classList.add('hidden');
            setTimeout(() => {
                if (loader && loader.parentElement) {
                    loader.remove();
                }
            }, 500);
        }
    }, 500); // Reduced from 800 to 500ms

    // Initial UI update
    updateUI();

    console.log('✅ App initialized successfully');
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export for debugging
window.app = {
    state: appState,
    api,
    auth: authManager,
    navigation,
    config: CONFIG
};

console.log('💚 Ultimate Sports AI ready! Access app state via window.app');
