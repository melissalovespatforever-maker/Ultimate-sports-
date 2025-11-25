// ============================================
// LIVE ODDS UI - Real-time odds from 30+ sportsbooks
// Connects to The Odds API via Railway backend
// ============================================

const LiveOddsUI = {
    currentSport: 'basketball_nba',
    refreshInterval: null,
    
    init() {
        console.log('📊 Live Odds UI initialized');
        this.setupAutoRender();
    },
    
    setupAutoRender() {
        const oddsPage = document.getElementById('odds-comparison-page');
        if (!oddsPage) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    this.render();
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });
        });
        
        observer.observe(oddsPage, {
            attributes: true,
            attributeFilter: ['class']
        });
    },
    
    async render() {
        const container = document.getElementById('odds-comparison-page');
        if (!container) return;
        
        // Show loading state
        container.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-exchange-alt"></i> Live Odds Comparison</h1>
                <p class="page-subtitle">Real-time odds from 30+ sportsbooks</p>
            </div>
            <div style="padding: 20px; text-align: center;">
                <div style="font-size: 48px; color: #10b981; margin-bottom: 16px;">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <p style="color: #6b7280;">Loading live odds...</p>
            </div>
        `;
        
        try {
            // Fetch odds from backend
            const response = await fetch(`${window.APP_CONFIG.API.BASE_URL}/api/odds/live?sport=${this.currentSport}`);
            const data = await response.json();
            
            if (data.odds && data.odds.length > 0) {
                this.renderOdds(data.odds);
            } else {
                this.renderNoData();
            }
        } catch (error) {
            console.error('❌ Error fetching odds:', error);
            this.renderError(error);
        }
    },
    
    renderOdds(games) {
        const container = document.getElementById('odds-comparison-page');
        
        const sportNames = {
            'basketball_nba': 'NBA',
            'americanfootball_nfl': 'NFL',
            'icehockey_nhl': 'NHL',
            'baseball_mlb': 'MLB'
        };
        
        const html = `
            <div class="page-header">
                <h1><i class="fas fa-exchange-alt"></i> Live Odds Comparison</h1>
                <p class="page-subtitle">Real-time odds from ${this.countSportsbooks(games)} sportsbooks</p>
            </div>
            
            <!-- Sport Filter -->
            <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${Object.entries(sportNames).map(([key, name]) => `
                        <button class="sport-filter-btn ${this.currentSport === key ? 'active' : ''}" 
                                data-sport="${key}"
                                style="
                                    padding: 8px 16px;
                                    border: 2px solid ${this.currentSport === key ? '#10b981' : '#e5e7eb'};
                                    background: ${this.currentSport === key ? '#10b981' : 'white'};
                                    color: ${this.currentSport === key ? 'white' : '#374151'};
                                    border-radius: 8px;
                                    font-weight: 600;
                                    cursor: pointer;
                                    transition: all 0.3s;
                                ">
                            ${name}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <!-- Games List -->
            <div style="padding: 20px;">
                ${games.slice(0, 10).map(game => this.renderGameCard(game)).join('')}
            </div>
            
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
                <p>
                    <i class="fas fa-sync-alt"></i> Auto-refreshing every 60 seconds
                    ${window.AuthService?.isAuthenticated() ? '' : '• <strong>Login for alerts</strong>'}
                </p>
            </div>
        `;
        
        container.innerHTML = html;
        this.setupFilters();
    },
    
    renderGameCard(game) {
        const gameTime = new Date(game.commence_time).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
        
        // Get best odds for each market
        const bestH2H = this.getBestOdds(game.bookmakers, 'h2h');
        const bestSpread = this.getBestOdds(game.bookmakers, 'spreads');
        const bestTotal = this.getBestOdds(game.bookmakers, 'totals');
        
        return `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            ">
                <!-- Game Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h3 style="font-size: 20px; font-weight: 700; margin: 0 0 4px 0;">
                            ${game.away_team} @ ${game.home_team}
                        </h3>
                        <p style="color: #6b7280; margin: 0; font-size: 14px;">
                            <i class="fas fa-clock"></i> ${gameTime}
                        </p>
                    </div>
                    <div style="
                        background: #10b981;
                        color: white;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 700;
                    ">
                        ${game.bookmakers.length} BOOKS
                    </div>
                </div>
                
                <!-- Odds Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                    <!-- Moneyline -->
                    ${bestH2H ? `
                        <div style="background: #f9fafb; padding: 16px; border-radius: 12px;">
                            <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; font-weight: 600;">
                                MONEYLINE
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 600;">${game.away_team}</span>
                                <span style="
                                    background: ${bestH2H.away.price > 0 ? '#10b981' : '#ef4444'};
                                    color: white;
                                    padding: 4px 12px;
                                    border-radius: 6px;
                                    font-weight: 700;
                                    font-size: 14px;
                                ">${bestH2H.away.price > 0 ? '+' : ''}${bestH2H.away.price}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 600;">${game.home_team}</span>
                                <span style="
                                    background: ${bestH2H.home.price > 0 ? '#10b981' : '#ef4444'};
                                    color: white;
                                    padding: 4px 12px;
                                    border-radius: 6px;
                                    font-weight: 700;
                                    font-size: 14px;
                                ">${bestH2H.home.price > 0 ? '+' : ''}${bestH2H.home.price}</span>
                            </div>
                            <div style="font-size: 11px; color: #6b7280; margin-top: 8px;">
                                Best: ${bestH2H.bookmaker}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Spread -->
                    ${bestSpread ? `
                        <div style="background: #f9fafb; padding: 16px; border-radius: 12px;">
                            <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; font-weight: 600;">
                                SPREAD
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 600;">${game.away_team} ${bestSpread.away.point > 0 ? '+' : ''}${bestSpread.away.point}</span>
                                <span style="
                                    background: #3b82f6;
                                    color: white;
                                    padding: 4px 12px;
                                    border-radius: 6px;
                                    font-weight: 700;
                                    font-size: 14px;
                                ">${bestSpread.away.price > 0 ? '+' : ''}${bestSpread.away.price}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 600;">${game.home_team} ${bestSpread.home.point > 0 ? '+' : ''}${bestSpread.home.point}</span>
                                <span style="
                                    background: #3b82f6;
                                    color: white;
                                    padding: 4px 12px;
                                    border-radius: 6px;
                                    font-weight: 700;
                                    font-size: 14px;
                                ">${bestSpread.home.price > 0 ? '+' : ''}${bestSpread.home.price}</span>
                            </div>
                            <div style="font-size: 11px; color: #6b7280; margin-top: 8px;">
                                Best: ${bestSpread.bookmaker}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Total -->
                    ${bestTotal ? `
                        <div style="background: #f9fafb; padding: 16px; border-radius: 12px;">
                            <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; font-weight: 600;">
                                TOTAL
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 600;">Over ${bestTotal.over.point}</span>
                                <span style="
                                    background: #f59e0b;
                                    color: white;
                                    padding: 4px 12px;
                                    border-radius: 6px;
                                    font-weight: 700;
                                    font-size: 14px;
                                ">${bestTotal.over.price > 0 ? '+' : ''}${bestTotal.over.price}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 600;">Under ${bestTotal.under.point}</span>
                                <span style="
                                    background: #f59e0b;
                                    color: white;
                                    padding: 4px 12px;
                                    border-radius: 6px;
                                    font-weight: 700;
                                    font-size: 14px;
                                ">${bestTotal.under.price > 0 ? '+' : ''}${bestTotal.under.price}</span>
                            </div>
                            <div style="font-size: 11px; color: #6b7280; margin-top: 8px;">
                                Best: ${bestTotal.bookmaker}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    getBestOdds(bookmakers, marketKey) {
        if (!bookmakers || bookmakers.length === 0) return null;
        
        let bestOdds = null;
        
        for (const book of bookmakers) {
            const market = book.markets?.find(m => m.key === marketKey);
            if (!market) continue;
            
            if (marketKey === 'h2h') {
                const away = market.outcomes.find(o => o.name === book.away_team);
                const home = market.outcomes.find(o => o.name === book.home_team);
                
                if (!bestOdds || (away.price + home.price) > (bestOdds.away.price + bestOdds.home.price)) {
                    bestOdds = {
                        bookmaker: book.title,
                        away: { price: away.price },
                        home: { price: home.price }
                    };
                }
            } else if (marketKey === 'spreads') {
                const away = market.outcomes.find(o => o.name === book.away_team);
                const home = market.outcomes.find(o => o.name === book.home_team);
                
                if (!bestOdds || away.price > bestOdds.away.price) {
                    bestOdds = {
                        bookmaker: book.title,
                        away: { price: away.price, point: away.point },
                        home: { price: home.price, point: home.point }
                    };
                }
            } else if (marketKey === 'totals') {
                const over = market.outcomes.find(o => o.name === 'Over');
                const under = market.outcomes.find(o => o.name === 'Under');
                
                if (!bestOdds || over.price > bestOdds.over.price) {
                    bestOdds = {
                        bookmaker: book.title,
                        over: { price: over.price, point: over.point },
                        under: { price: under.price, point: under.point }
                    };
                }
            }
        }
        
        return bestOdds;
    },
    
    countSportsbooks(games) {
        const uniqueBooks = new Set();
        games.forEach(game => {
            game.bookmakers?.forEach(book => uniqueBooks.add(book.title));
        });
        return uniqueBooks.size;
    },
    
    setupFilters() {
        document.querySelectorAll('.sport-filter-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                this.currentSport = btn.dataset.sport;
                await this.render();
            });
        });
    },
    
    renderNoData() {
        const container = document.getElementById('odds-comparison-page');
        container.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-exchange-alt"></i> Live Odds Comparison</h1>
                <p class="page-subtitle">Real-time odds from 30+ sportsbooks</p>
            </div>
            <div style="padding: 60px 20px; text-align: center;">
                <div style="font-size: 64px; color: #d1d5db; margin-bottom: 16px;">
                    <i class="fas fa-calendar-times"></i>
                </div>
                <h3 style="color: #6b7280; margin-bottom: 8px;">No games available</h3>
                <p style="color: #9ca3af;">Check back later for upcoming games</p>
            </div>
        `;
    },
    
    renderError(error) {
        const container = document.getElementById('odds-comparison-page');
        container.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-exchange-alt"></i> Live Odds Comparison</h1>
                <p class="page-subtitle">Real-time odds from 30+ sportsbooks</p>
            </div>
            <div style="padding: 60px 20px; text-align: center;">
                <div style="font-size: 64px; color: #ef4444; margin-bottom: 16px;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 style="color: #ef4444; margin-bottom: 8px;">Error loading odds</h3>
                <p style="color: #6b7280; margin-bottom: 16px;">${error.message}</p>
                <button onclick="window.LiveOddsUI.render()" style="
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
    },
    
    startAutoRefresh() {
        this.stopAutoRefresh();
        this.refreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing odds...');
            this.render();
        }, 60000); // 60 seconds
    },
    
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
};

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LiveOddsUI.init());
} else {
    LiveOddsUI.init();
}

// Export globally
window.LiveOddsUI = LiveOddsUI;

console.log('📦 Live Odds UI loaded');
