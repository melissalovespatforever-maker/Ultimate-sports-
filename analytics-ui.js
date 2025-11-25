// ============================================
// ANALYTICS DASHBOARD UI
// User performance stats and visualizations
// ============================================

const AnalyticsUI = {
    
    init() {
        console.log('📊 Analytics UI initialized');
        this.setupAutoRender();
    },
    
    setupAutoRender() {
        const analyticsPage = document.getElementById('analytics-page');
        if (!analyticsPage) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    this.render();
                }
            });
        });
        
        observer.observe(analyticsPage, {
            attributes: true,
            attributeFilter: ['class']
        });
    },
    
    async render() {
        const container = document.getElementById('analytics-page');
        if (!container) return;
        
        // Check if user is authenticated
        if (!window.AuthService?.isAuthenticated()) {
            this.renderLoginRequired();
            return;
        }
        
        // Show loading
        container.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-chart-line"></i> Analytics Dashboard</h1>
                <p class="page-subtitle">Track your performance metrics</p>
            </div>
            <div style="padding: 40px 20px; text-align: center;">
                <div style="font-size: 48px; color: #10b981;">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <p style="color: #6b7280; margin-top: 16px;">Loading your analytics...</p>
            </div>
        `;
        
        try {
            // Fetch user analytics from backend
            const analytics = await window.BackendAPI?.getUserAnalytics();
            
            if (analytics) {
                this.renderDashboard(analytics);
            } else {
                this.renderNoData();
            }
        } catch (error) {
            console.error('❌ Error loading analytics:', error);
            this.renderError(error);
        }
    },
    
    renderDashboard(analytics) {
        const container = document.getElementById('analytics-page');
        
        // Calculate win rate
        const totalPicks = parseInt(analytics.total_picks) || 0;
        const wins = parseInt(analytics.wins) || 0;
        const losses = parseInt(analytics.losses) || 0;
        const winRate = totalPicks > 0 ? ((wins / totalPicks) * 100).toFixed(1) : 0;
        const netProfit = parseFloat(analytics.net_profit) || 0;
        const avgOdds = parseFloat(analytics.avg_odds) || 0;
        
        const html = `
            <div class="page-header">
                <h1><i class="fas fa-chart-line"></i> Analytics Dashboard</h1>
                <p class="page-subtitle">Your performance at a glance</p>
            </div>
            
            <div style="padding: 20px;">
                <!-- Key Metrics -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
                    <!-- Total Picks -->
                    <div style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 16px;
                        padding: 24px;
                        color: white;
                        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                    ">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px; font-weight: 600;">
                            TOTAL PICKS
                        </div>
                        <div style="font-size: 48px; font-weight: 800; margin-bottom: 4px;">
                            ${totalPicks}
                        </div>
                        <div style="font-size: 12px; opacity: 0.8;">
                            ${wins}W - ${losses}L
                        </div>
                    </div>
                    
                    <!-- Win Rate -->
                    <div style="
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        border-radius: 16px;
                        padding: 24px;
                        color: white;
                        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                    ">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px; font-weight: 600;">
                            WIN RATE
                        </div>
                        <div style="font-size: 48px; font-weight: 800; margin-bottom: 4px;">
                            ${winRate}%
                        </div>
                        <div style="font-size: 12px; opacity: 0.8;">
                            ${wins} wins out of ${totalPicks}
                        </div>
                    </div>
                    
                    <!-- Net Profit -->
                    <div style="
                        background: linear-gradient(135deg, ${netProfit >= 0 ? '#10b981' : '#ef4444'} 0%, ${netProfit >= 0 ? '#059669' : '#dc2626'} 100%);
                        border-radius: 16px;
                        padding: 24px;
                        color: white;
                        box-shadow: 0 4px 12px ${netProfit >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
                    ">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px; font-weight: 600;">
                            NET PROFIT
                        </div>
                        <div style="font-size: 48px; font-weight: 800; margin-bottom: 4px;">
                            ${netProfit >= 0 ? '+' : ''}$${netProfit.toFixed(2)}
                        </div>
                        <div style="font-size: 12px; opacity: 0.8;">
                            ${netProfit >= 0 ? 'In the green' : 'In the red'}
                        </div>
                    </div>
                    
                    <!-- Avg Odds -->
                    <div style="
                        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                        border-radius: 16px;
                        padding: 24px;
                        color: white;
                        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                    ">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px; font-weight: 600;">
                            AVG ODDS
                        </div>
                        <div style="font-size: 48px; font-weight: 800; margin-bottom: 4px;">
                            ${avgOdds > 0 ? '+' : ''}${avgOdds.toFixed(0)}
                        </div>
                        <div style="font-size: 12px; opacity: 0.8;">
                            Average per pick
                        </div>
                    </div>
                </div>
                
                <!-- Performance Breakdown -->
                <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 24px;">
                    <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 20px;">
                        <i class="fas fa-chart-pie"></i> Performance Breakdown
                    </h2>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px;">
                        <!-- Win/Loss Chart -->
                        <div>
                            <div style="font-size: 14px; color: #6b7280; margin-bottom: 12px; font-weight: 600;">
                                WIN/LOSS RATIO
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="flex: 1; height: 32px; background: #f3f4f6; border-radius: 16px; overflow: hidden; display: flex;">
                                    <div style="
                                        width: ${totalPicks > 0 ? (wins / totalPicks * 100) : 0}%;
                                        background: linear-gradient(90deg, #10b981, #059669);
                                        transition: width 0.5s ease;
                                    "></div>
                                    <div style="
                                        width: ${totalPicks > 0 ? (losses / totalPicks * 100) : 0}%;
                                        background: linear-gradient(90deg, #ef4444, #dc2626);
                                        transition: width 0.5s ease;
                                    "></div>
                                </div>
                                <div style="font-weight: 700; color: #374151; min-width: 60px;">
                                    ${wins}/${losses}
                                </div>
                            </div>
                        </div>
                        
                        <!-- ROI -->
                        <div>
                            <div style="font-size: 14px; color: #6b7280; margin-bottom: 12px; font-weight: 600;">
                                RETURN ON INVESTMENT
                            </div>
                            <div style="
                                font-size: 32px;
                                font-weight: 800;
                                color: ${netProfit >= 0 ? '#10b981' : '#ef4444'};
                            ">
                                ${netProfit >= 0 ? '+' : ''}${((netProfit / (totalPicks * 100 || 1)) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    <button onclick="window.AppNavigation?.navigateTo('bet-history')" style="
                        background: white;
                        border: 2px solid #e5e7eb;
                        border-radius: 12px;
                        padding: 20px;
                        cursor: pointer;
                        transition: all 0.3s;
                        text-align: left;
                    " onmouseover="this.style.borderColor='#10b981'; this.style.transform='translateY(-2px)'" 
                       onmouseout="this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'">
                        <div style="font-size: 32px; color: #10b981; margin-bottom: 8px;">
                            <i class="fas fa-history"></i>
                        </div>
                        <div style="font-weight: 700; margin-bottom: 4px;">Pick History</div>
                        <div style="font-size: 12px; color: #6b7280;">View all your past picks</div>
                    </button>
                    
                    <button onclick="window.AppNavigation?.navigateTo('coaching')" style="
                        background: white;
                        border: 2px solid #e5e7eb;
                        border-radius: 12px;
                        padding: 20px;
                        cursor: pointer;
                        transition: all 0.3s;
                        text-align: left;
                    " onmouseover="this.style.borderColor='#667eea'; this.style.transform='translateY(-2px)'" 
                       onmouseout="this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'">
                        <div style="font-size: 32px; color: #667eea; margin-bottom: 8px;">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div style="font-weight: 700; margin-bottom: 4px;">AI Coaches</div>
                        <div style="font-size: 12px; color: #6b7280;">Get AI predictions</div>
                    </button>
                    
                    <button onclick="window.AppNavigation?.navigateTo('odds-comparison')" style="
                        background: white;
                        border: 2px solid #e5e7eb;
                        border-radius: 12px;
                        padding: 20px;
                        cursor: pointer;
                        transition: all 0.3s;
                        text-align: left;
                    " onmouseover="this.style.borderColor='#f59e0b'; this.style.transform='translateY(-2px)'" 
                       onmouseout="this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'">
                        <div style="font-size: 32px; color: #f59e0b; margin-bottom: 8px;">
                            <i class="fas fa-exchange-alt"></i>
                        </div>
                        <div style="font-weight: 700; margin-bottom: 4px;">Live Odds</div>
                        <div style="font-size: 12px; color: #6b7280;">Compare 30+ books</div>
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    },
    
    renderNoData() {
        const container = document.getElementById('analytics-page');
        container.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-chart-line"></i> Analytics Dashboard</h1>
                <p class="page-subtitle">Track your performance metrics</p>
            </div>
            <div style="padding: 60px 20px; text-align: center; max-width: 500px; margin: 0 auto;">
                <div style="font-size: 80px; color: #d1d5db; margin-bottom: 24px;">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <h2 style="font-size: 24px; font-weight: 700; color: #374151; margin-bottom: 12px;">
                    No picks yet!
                </h2>
                <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.6;">
                    Start tracking your sports picks to see detailed analytics and performance metrics.
                </p>
                <button onclick="window.AppNavigation?.navigateTo('coaching')" style="
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
                    <i class="fas fa-robot"></i> Get AI Picks
                </button>
            </div>
        `;
    },
    
    renderLoginRequired() {
        const container = document.getElementById('analytics-page');
        container.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-chart-line"></i> Analytics Dashboard</h1>
                <p class="page-subtitle">Track your performance metrics</p>
            </div>
            <div style="padding: 60px 20px; text-align: center; max-width: 500px; margin: 0 auto;">
                <div style="font-size: 80px; color: #d1d5db; margin-bottom: 24px;">
                    <i class="fas fa-lock"></i>
                </div>
                <h2 style="font-size: 24px; font-weight: 700; color: #374151; margin-bottom: 12px;">
                    Login Required
                </h2>
                <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.6;">
                    Sign in to view your analytics dashboard and track your performance.
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
        const container = document.getElementById('analytics-page');
        container.innerHTML = `
            <div class="page-header">
                <h1><i class="fas fa-chart-line"></i> Analytics Dashboard</h1>
                <p class="page-subtitle">Track your performance metrics</p>
            </div>
            <div style="padding: 60px 20px; text-align: center;">
                <div style="font-size: 64px; color: #ef4444; margin-bottom: 16px;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 style="color: #ef4444; margin-bottom: 8px;">Error loading analytics</h3>
                <p style="color: #6b7280; margin-bottom: 16px;">${error.message}</p>
                <button onclick="window.AnalyticsUI.render()" style="
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
    document.addEventListener('DOMContentLoaded', () => AnalyticsUI.init());
} else {
    AnalyticsUI.init();
}

// Export globally
window.AnalyticsUI = AnalyticsUI;

console.log('📦 Analytics UI loaded');
