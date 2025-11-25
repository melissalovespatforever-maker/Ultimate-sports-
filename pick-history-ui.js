// ============================================
// PICK HISTORY UI
// Display user's past picks with filters
// ============================================

const PickHistoryUI = {
    picks: [],
    filter: 'all', // all, pending, won, lost
    
    init() {
        console.log('📜 Pick History UI initialized');
        this.setupAutoRender();
    },
    
    setupAutoRender() {
        const pickHistoryPage = document.getElementById('bet-history-page');
        if (!pickHistoryPage) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    this.render();
                }
            });
        });
        
        observer.observe(pickHistoryPage, {
            attributes: true,
            attributeFilter: ['class']
        });
    },
    
    async render() {
        const container = document.getElementById('bet-history-page');
        if (!container) return;
        
        // Check if user is authenticated
        if (!window.AuthService?.isAuthenticated()) {
            this.renderLoginRequired();
            return;
        }
        
        // Show loading
        container.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-history"></i> Pick History</h1>
                <p class="page-subtitle">Review your past predictions</p>
            </div>
            <div style="padding: 40px 20px; text-align: center;">
                <div style="font-size: 48px; color: #10b981;">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <p style="color: #6b7280; margin-top: 16px;">Loading your picks...</p>
            </div>
        `;
        
        try {
            await this.loadPicks();
            this.renderPicksList();
        } catch (error) {
            console.error('❌ Error loading picks:', error);
            this.renderError(error);
        }
    },
    
    async loadPicks() {
        const response = await fetch(`${window.APP_CONFIG.API.BASE_URL}/api/picks`, {
            headers: {
                'Authorization': `Bearer ${window.AuthService.getToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load picks');
        }
        
        const data = await response.json();
        this.picks = data.picks || [];
        console.log('✅ Loaded', this.picks.length, 'picks');
    },
    
    renderPicksList() {
        const container = document.getElementById('bet-history-page');
        
        // Filter picks
        const filteredPicks = this.filter === 'all' 
            ? this.picks 
            : this.picks.filter(p => p.status === this.filter);
        
        // Calculate stats
        const stats = {
            total: this.picks.length,
            pending: this.picks.filter(p => p.status === 'pending').length,
            won: this.picks.filter(p => p.status === 'won').length,
            lost: this.picks.filter(p => p.status === 'lost').length
        };
        
        const html = `
            <div class="page-header">
                <h1><i class="fas fa-history"></i> Pick History</h1>
                <p class="page-subtitle">${stats.total} total picks</p>
            </div>
            
            <div style="padding: 20px;">
                <!-- Stats Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px;">
                    <div style="
                        background: white;
                        border-radius: 12px;
                        padding: 16px;
                        text-align: center;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    ">
                        <div style="font-size: 32px; font-weight: 800; color: #3b82f6; margin-bottom: 4px;">
                            ${stats.total}
                        </div>
                        <div style="font-size: 12px; color: #6b7280; font-weight: 600;">
                            TOTAL PICKS
                        </div>
                    </div>
                    
                    <div style="
                        background: white;
                        border-radius: 12px;
                        padding: 16px;
                        text-align: center;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    ">
                        <div style="font-size: 32px; font-weight: 800; color: #10b981; margin-bottom: 4px;">
                            ${stats.won}
                        </div>
                        <div style="font-size: 12px; color: #6b7280; font-weight: 600;">
                            WON
                        </div>
                    </div>
                    
                    <div style="
                        background: white;
                        border-radius: 12px;
                        padding: 16px;
                        text-align: center;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    ">
                        <div style="font-size: 32px; font-weight: 800; color: #ef4444; margin-bottom: 4px;">
                            ${stats.lost}
                        </div>
                        <div style="font-size: 12px; color: #6b7280; font-weight: 600;">
                            LOST
                        </div>
                    </div>
                    
                    <div style="
                        background: white;
                        border-radius: 12px;
                        padding: 16px;
                        text-align: center;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    ">
                        <div style="font-size: 32px; font-weight: 800; color: #f59e0b; margin-bottom: 4px;">
                            ${stats.pending}
                        </div>
                        <div style="font-size: 12px; color: #6b7280; font-weight: 600;">
                            PENDING
                        </div>
                    </div>
                </div>
                
                <!-- Filter Buttons -->
                <div style="display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap;">
                    ${['all', 'pending', 'won', 'lost'].map(f => `
                        <button onclick="window.PickHistoryUI.setFilter('${f}')" style="
                            padding: 8px 16px;
                            border: 2px solid ${this.filter === f ? '#10b981' : '#e5e7eb'};
                            background: ${this.filter === f ? '#10b981' : 'white'};
                            color: ${this.filter === f ? 'white' : '#374151'};
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            text-transform: capitalize;
                            transition: all 0.3s;
                        ">
                            ${f}
                        </button>
                    `).join('')}
                </div>
                
                <!-- Picks List -->
                ${filteredPicks.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
                        <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">
                            <i class="fas fa-inbox"></i>
                        </div>
                        <h3 style="color: #6b7280; margin-bottom: 8px;">No ${this.filter} picks</h3>
                        <p style="color: #9ca3af;">
                            ${this.filter === 'all' ? 'Start placing picks to see them here!' : `No ${this.filter} picks found.`}
                        </p>
                        ${this.filter === 'all' ? `
                            <button onclick="window.AppNavigation?.navigateTo('odds-comparison')" style="
                                margin-top: 20px;
                                padding: 12px 24px;
                                background: #10b981;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                font-weight: 600;
                                cursor: pointer;
                            ">
                                View Live Odds
                            </button>
                        ` : ''}
                    </div>
                ` : filteredPicks.map(pick => this.renderPickCard(pick)).join('')}
            </div>
        `;
        
        container.innerHTML = html;
    },
    
    renderPickCard(pick) {
        const statusColors = {
            pending: { bg: '#f59e0b', text: 'Pending' },
            won: { bg: '#10b981', text: 'Won' },
            lost: { bg: '#ef4444', text: 'Lost' }
        };
        
        const status = statusColors[pick.status] || statusColors.pending;
        const createdDate = new Date(pick.created_at).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
        
        return `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                border-left: 4px solid ${status.bg};
            ">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                    <div>
                        <div style="
                            display: inline-block;
                            background: ${status.bg};
                            color: white;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: 700;
                            margin-bottom: 8px;
                        ">
                            ${status.text}
                        </div>
                        <div style="color: #6b7280; font-size: 12px;">
                            <i class="fas fa-clock"></i> ${createdDate}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                            ${pick.pick_type.toUpperCase()}
                        </div>
                        <div style="font-size: 20px; font-weight: 800; color: #111827;">
                            ${pick.total_odds > 0 ? '+' : ''}${pick.total_odds}
                        </div>
                    </div>
                </div>
                
                <!-- Legs -->
                ${pick.legs ? pick.legs.map(leg => `
                    <div style="
                        background: #f9fafb;
                        border-radius: 8px;
                        padding: 12px;
                        margin-bottom: 8px;
                    ">
                        <div style="font-weight: 600; margin-bottom: 4px;">
                            ${leg.away_team} @ ${leg.home_team}
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 14px;">
                            <span style="color: #6b7280;">
                                ${leg.bet_type}: ${leg.selection}
                            </span>
                            <span style="font-weight: 700;">
                                ${leg.odds > 0 ? '+' : ''}${leg.odds}
                            </span>
                        </div>
                    </div>
                `).join('') : ''}
                
                <!-- Wager & Payout -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                ">
                    <div>
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                            Wager
                        </div>
                        <div style="font-size: 18px; font-weight: 700;">
                            $${pick.wager.toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                            ${pick.status === 'won' ? 'Won' : 'Potential Payout'}
                        </div>
                        <div style="font-size: 18px; font-weight: 700; color: ${pick.status === 'won' ? '#10b981' : '#374151'};">
                            $${pick.potential_payout.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    setFilter(filter) {
        this.filter = filter;
        this.renderPicksList();
    },
    
    renderLoginRequired() {
        const container = document.getElementById('bet-history-page');
        container.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-history"></i> Pick History</h1>
                <p class="page-subtitle">Review your past predictions</p>
            </div>
            <div style="padding: 60px 20px; text-align: center; max-width: 500px; margin: 0 auto;">
                <div style="font-size: 80px; color: #d1d5db; margin-bottom: 24px;">
                    <i class="fas fa-lock"></i>
                </div>
                <h2 style="font-size: 24px; font-weight: 700; color: #374151; margin-bottom: 12px;">
                    Login Required
                </h2>
                <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.6;">
                    Sign in to view your pick history and track your performance.
                </p>
                <button onclick="window.AppNavigation?.navigateTo('profile')" style="
                    padding: 14px 28px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 16px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" 
                   onmouseout="this.style.transform='scale(1)'">
                    <i class="fas fa-sign-in-alt"></i> Login / Register
                </button>
            </div>
        `;
    },
    
    renderError(error) {
        const container = document.getElementById('bet-history-page');
        container.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-history"></i> Pick History</h1>
                <p class="page-subtitle">Review your past predictions</p>
            </div>
            <div style="padding: 60px 20px; text-align: center;">
                <div style="font-size: 64px; color: #ef4444; margin-bottom: 16px;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 style="color: #ef4444; margin-bottom: 8px;">Error loading picks</h3>
                <p style="color: #6b7280; margin-bottom: 16px;">${error.message}</p>
                <button onclick="window.PickHistoryUI.render()" style="
                    padding: 12px 24px;
                    background: #10b981;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    Try Again
                </button>
            </div>
        `;
    }
};

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PickHistoryUI.init());
} else {
    PickHistoryUI.init();
}

// Export globally
window.PickHistoryUI = PickHistoryUI;

console.log('📦 Pick History UI loaded');
