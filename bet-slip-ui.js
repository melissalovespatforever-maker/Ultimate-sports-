// ============================================
// BET SLIP UI - Pick Creation & Tracking
// Users can add picks and submit to backend
// ============================================

const BetSlipUI = {
    picks: [],
    isOpen: false,
    
    init() {
        console.log('🎯 Bet Slip UI initialized');
        this.createBetSlipContainer();
        this.loadFromStorage();
    },
    
    createBetSlipContainer() {
        // Create floating bet slip button
        const button = document.createElement('button');
        button.id = 'bet-slip-toggle';
        button.innerHTML = `
            <i class="fas fa-ticket-alt"></i>
            <span class="bet-slip-count">0</span>
        `;
        button.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            cursor: pointer;
            z-index: 999;
            font-size: 24px;
            transition: all 0.3s;
        `;
        
        button.addEventListener('click', () => this.toggle());
        document.body.appendChild(button);
        
        // Create bet slip panel
        const panel = document.createElement('div');
        panel.id = 'bet-slip-panel';
        panel.style.cssText = `
            position: fixed;
            right: -400px;
            top: 0;
            width: 380px;
            height: 100vh;
            background: white;
            box-shadow: -4px 0 12px rgba(0,0,0,0.2);
            z-index: 1000;
            transition: right 0.3s ease;
            display: flex;
            flex-direction: column;
        `;
        
        document.body.appendChild(panel);
        this.renderBetSlip();
    },
    
    toggle() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('bet-slip-panel');
        panel.style.right = this.isOpen ? '0' : '-400px';
    },
    
    addPick(pick) {
        // Check if pick already exists
        const exists = this.picks.find(p => 
            p.gameId === pick.gameId && 
            p.betType === pick.betType && 
            p.selection === pick.selection
        );
        
        if (exists) {
            this.showNotification('Pick already in bet slip!', 'warning');
            return;
        }
        
        this.picks.push({
            id: Date.now(),
            ...pick,
            wager: 10 // Default wager
        });
        
        this.saveToStorage();
        this.renderBetSlip();
        this.updateBadge();
        this.showNotification('Pick added to bet slip!', 'success');
        
        // Auto-open bet slip
        if (!this.isOpen) {
            this.toggle();
        }
    },
    
    removePick(pickId) {
        this.picks = this.picks.filter(p => p.id !== pickId);
        this.saveToStorage();
        this.renderBetSlip();
        this.updateBadge();
    },
    
    updateWager(pickId, wager) {
        const pick = this.picks.find(p => p.id === pickId);
        if (pick) {
            pick.wager = parseFloat(wager) || 0;
            this.saveToStorage();
            this.renderBetSlip();
        }
    },
    
    renderBetSlip() {
        const panel = document.getElementById('bet-slip-panel');
        if (!panel) return;
        
        const totalWager = this.picks.reduce((sum, p) => sum + (p.wager || 0), 0);
        const totalPayout = this.picks.reduce((sum, p) => {
            const americanOdds = p.odds;
            const wager = p.wager || 0;
            let payout = wager;
            
            if (americanOdds > 0) {
                payout = wager * (americanOdds / 100);
            } else {
                payout = wager * (100 / Math.abs(americanOdds));
            }
            
            return sum + payout;
        }, 0);
        
        panel.innerHTML = `
            <!-- Header -->
            <div style="
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div>
                    <h2 style="margin: 0; font-size: 20px; font-weight: 700;">
                        <i class="fas fa-ticket-alt"></i> Bet Slip
                    </h2>
                    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">
                        ${this.picks.length} pick${this.picks.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button onclick="window.BetSlipUI.toggle()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                ">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- Picks List -->
            <div style="flex: 1; overflow-y: auto; padding: 16px;">
                ${this.picks.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
                        <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">
                            <i class="fas fa-ticket-alt"></i>
                        </div>
                        <p style="font-size: 16px; margin: 0;">No picks yet</p>
                        <p style="font-size: 14px; margin: 8px 0 0 0;">
                            Click odds to add picks
                        </p>
                    </div>
                ` : this.picks.map(pick => `
                    <div style="
                        background: #f9fafb;
                        border-radius: 12px;
                        padding: 16px;
                        margin-bottom: 12px;
                        border: 2px solid #e5e7eb;
                    ">
                        <!-- Pick Header -->
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                            <div style="flex: 1;">
                                <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">
                                    ${pick.game}
                                </div>
                                <div style="color: #6b7280; font-size: 12px;">
                                    ${pick.sport} • ${pick.betType}
                                </div>
                            </div>
                            <button onclick="window.BetSlipUI.removePick(${pick.id})" style="
                                background: none;
                                border: none;
                                color: #ef4444;
                                cursor: pointer;
                                font-size: 18px;
                                padding: 0;
                                width: 24px;
                                height: 24px;
                            ">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        
                        <!-- Selection -->
                        <div style="
                            background: white;
                            padding: 12px;
                            border-radius: 8px;
                            margin-bottom: 12px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        ">
                            <div style="font-weight: 600; font-size: 15px;">
                                ${pick.selection}
                            </div>
                            <div style="
                                background: ${pick.odds > 0 ? '#10b981' : '#3b82f6'};
                                color: white;
                                padding: 6px 12px;
                                border-radius: 6px;
                                font-weight: 700;
                                font-size: 14px;
                            ">
                                ${pick.odds > 0 ? '+' : ''}${pick.odds}
                            </div>
                        </div>
                        
                        <!-- Wager Input -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <label style="font-size: 12px; color: #6b7280; font-weight: 600;">
                                Wager:
                            </label>
                            <div style="position: relative; flex: 1;">
                                <span style="
                                    position: absolute;
                                    left: 12px;
                                    top: 50%;
                                    transform: translateY(-50%);
                                    color: #6b7280;
                                    font-weight: 600;
                                ">$</span>
                                <input 
                                    type="number" 
                                    value="${pick.wager || 10}"
                                    onchange="window.BetSlipUI.updateWager(${pick.id}, this.value)"
                                    style="
                                        width: 100%;
                                        padding: 8px 12px 8px 28px;
                                        border: 2px solid #e5e7eb;
                                        border-radius: 8px;
                                        font-size: 14px;
                                        font-weight: 600;
                                        box-sizing: border-box;
                                    "
                                    min="1"
                                    step="1"
                                >
                            </div>
                            <div style="
                                font-size: 12px;
                                color: #6b7280;
                                white-space: nowrap;
                            ">
                                To win: <strong style="color: #10b981;">$${this.calculatePayout(pick).toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Footer -->
            ${this.picks.length > 0 ? `
                <div style="
                    border-top: 2px solid #e5e7eb;
                    padding: 20px;
                    background: white;
                ">
                    <!-- Totals -->
                    <div style="margin-bottom: 16px;">
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 8px;
                            font-size: 14px;
                            color: #6b7280;
                        ">
                            <span>Total Wager:</span>
                            <span style="font-weight: 600;">$${totalWager.toFixed(2)}</span>
                        </div>
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            font-size: 16px;
                            font-weight: 700;
                            color: #10b981;
                        ">
                            <span>Potential Payout:</span>
                            <span>$${(totalWager + totalPayout).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <!-- Submit Button -->
                    <button onclick="window.BetSlipUI.submitPicks()" style="
                        width: 100%;
                        padding: 16px;
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        font-weight: 700;
                        font-size: 16px;
                        cursor: pointer;
                        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                        transition: transform 0.2s;
                    " onmouseover="this.style.transform='scale(1.02)'" 
                       onmouseout="this.style.transform='scale(1)'">
                        <i class="fas fa-check-circle"></i> Place ${this.picks.length} Pick${this.picks.length !== 1 ? 's' : ''}
                    </button>
                    
                    <button onclick="window.BetSlipUI.clearAll()" style="
                        width: 100%;
                        padding: 12px;
                        background: transparent;
                        color: #6b7280;
                        border: none;
                        font-size: 14px;
                        cursor: pointer;
                        margin-top: 8px;
                    ">
                        Clear All
                    </button>
                </div>
            ` : ''}
        `;
    },
    
    calculatePayout(pick) {
        const americanOdds = pick.odds;
        const wager = pick.wager || 0;
        
        if (americanOdds > 0) {
            return wager * (americanOdds / 100);
        } else {
            return wager * (100 / Math.abs(americanOdds));
        }
    },
    
    async submitPicks() {
        if (this.picks.length === 0) return;
        
        // Check if user is logged in
        if (!window.AuthService?.isAuthenticated()) {
            this.showNotification('Please login to place picks', 'error');
            window.AppNavigation?.navigateTo('profile');
            return;
        }
        
        const button = event.target;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing picks...';
        
        try {
            // Submit each pick to backend
            const results = await Promise.all(
                this.picks.map(pick => this.submitSinglePick(pick))
            );
            
            console.log('✅ Picks submitted:', results);
            
            // Clear bet slip
            this.picks = [];
            this.saveToStorage();
            this.renderBetSlip();
            this.updateBadge();
            
            // Show success
            this.showNotification(`${results.length} pick${results.length !== 1 ? 's' : ''} placed successfully!`, 'success');
            
            // Navigate to bet history
            setTimeout(() => {
                this.toggle();
                window.AppNavigation?.navigateTo('bet-history');
            }, 1500);
            
        } catch (error) {
            console.error('❌ Error submitting picks:', error);
            this.showNotification(error.message || 'Failed to place picks', 'error');
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-check-circle"></i> Place Picks';
        }
    },
    
    async submitSinglePick(pick) {
        const pickData = {
            pick_type: this.picks.length > 1 ? 'parlay' : 'single',
            sport: pick.sport,
            total_odds: pick.odds,
            wager: pick.wager,
            legs: [{
                game_id: pick.gameId,
                sport: pick.sport,
                home_team: pick.homeTeam,
                away_team: pick.awayTeam,
                game_time: pick.gameTime,
                bet_type: pick.betType,
                selection: pick.selection,
                odds: pick.odds,
                line: pick.line || null
            }]
        };
        
        const response = await fetch(`${window.APP_CONFIG.API.BASE_URL}/api/picks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.AuthService.getToken()}`
            },
            body: JSON.stringify(pickData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit pick');
        }
        
        return await response.json();
    },
    
    clearAll() {
        if (confirm('Clear all picks from bet slip?')) {
            this.picks = [];
            this.saveToStorage();
            this.renderBetSlip();
            this.updateBadge();
        }
    },
    
    updateBadge() {
        const badge = document.querySelector('#bet-slip-toggle .bet-slip-count');
        if (badge) {
            badge.textContent = this.picks.length;
            badge.style.display = this.picks.length > 0 ? 'flex' : 'none';
        }
    },
    
    saveToStorage() {
        localStorage.setItem('bet_slip_picks', JSON.stringify(this.picks));
    },
    
    loadFromStorage() {
        const saved = localStorage.getItem('bet_slip_picks');
        if (saved) {
            try {
                this.picks = JSON.parse(saved);
                this.updateBadge();
            } catch (error) {
                console.error('Error loading bet slip:', error);
            }
        }
    },
    
    showNotification(message, type = 'info') {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Add notification animations
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
    
    #bet-slip-toggle .bet-slip-count {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ef4444;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        display: none;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BetSlipUI.init());
} else {
    BetSlipUI.init();
}

// Export globally
window.BetSlipUI = BetSlipUI;

console.log('📦 Bet Slip UI loaded');
