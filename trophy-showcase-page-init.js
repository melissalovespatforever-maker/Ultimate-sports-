/**
 * Trophy Showcase Page Initialization
 */

import trophyShowcase from './trophy-showcase-system.js';
import trophyShowcaseUI from './trophy-showcase-ui.js';

class TrophyShowcasePageInit {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize trophy showcase page
     */
    init() {
        if (this.initialized) return;

        console.log('Initializing Trophy Showcase Page...');

        // Initialize UI
        trophyShowcaseUI.init();

        // Render page
        this.renderPage();

        // Setup demo mode for testing
        this.setupDemoMode();

        // Check for auto-unlock on page load
        this.checkAutoUnlock();

        this.initialized = true;
        console.log('Trophy Showcase Page initialized successfully');
    }

    /**
     * Render the trophy showcase page
     */
    renderPage() {
        const container = document.getElementById('trophy-showcase-container');
        if (!container) {
            console.error('Trophy showcase container not found');
            return;
        }

        container.innerHTML = trophyShowcaseUI.renderShowcasePage();
    }

    /**
     * Setup demo mode for testing
     */
    setupDemoMode() {
        // Add demo button to page header if not exists
        if (window.location.hash.includes('trophy-showcase')) {
            const demoBtn = document.createElement('button');
            demoBtn.className = 'trophy-demo-btn';
            demoBtn.innerHTML = '<i class="fas fa-flask"></i> Demo Mode';
            demoBtn.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 10px 16px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 700;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;
            `;

            demoBtn.addEventListener('click', () => this.showDemoMenu());
            document.body.appendChild(demoBtn);
        }
    }

    /**
     * Show demo menu for testing
     */
    showDemoMenu() {
        const menu = document.createElement('div');
        menu.className = 'trophy-demo-menu';
        menu.innerHTML = `
            <div class="trophy-demo-content">
                <h3 style="margin: 0 0 16px 0; color: white; font-size: 18px;">
                    <i class="fas fa-flask"></i> Trophy Demo Mode
                </h3>
                <p style="color: #a8b3cf; font-size: 14px; margin: 0 0 20px 0;">
                    Test trophy unlock animations and showcase features
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button class="trophy-demo-action" data-action="unlock-common">
                        ⚪ Unlock Common Trophy
                    </button>
                    <button class="trophy-demo-action" data-action="unlock-rare">
                        🔵 Unlock Rare Trophy
                    </button>
                    <button class="trophy-demo-action" data-action="unlock-epic">
                        🟣 Unlock Epic Trophy
                    </button>
                    <button class="trophy-demo-action" data-action="unlock-legendary">
                        🟡 Unlock Legendary Trophy
                    </button>
                    <button class="trophy-demo-action" data-action="unlock-all">
                        🏆 Unlock All Trophies
                    </button>
                    <button class="trophy-demo-action" data-action="reset">
                        🔄 Reset All Progress
                    </button>
                    <button class="trophy-demo-action" data-action="close" style="background: rgba(239, 68, 68, 0.2); color: #ef4444;">
                        ✕ Close
                    </button>
                </div>
            </div>
        `;

        menu.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            backdrop-filter: blur(10px);
        `;

        const content = menu.querySelector('.trophy-demo-content');
        content.style.cssText = `
            background: linear-gradient(135deg, rgba(26, 30, 43, 0.98), rgba(20, 24, 35, 0.98));
            border: 2px solid rgba(16, 185, 129, 0.3);
            border-radius: 20px;
            padding: 32px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(16, 185, 129, 0.3);
        `;

        // Action buttons style
        menu.querySelectorAll('.trophy-demo-action').forEach(btn => {
            btn.style.cssText = `
                width: 100%;
                padding: 12px;
                background: rgba(16, 185, 129, 0.1);
                color: #10b981;
                border: 1px solid rgba(16, 185, 129, 0.3);
                border-radius: 10px;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
            `;

            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(16, 185, 129, 0.2)';
                btn.style.transform = 'translateY(-2px)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(16, 185, 129, 0.1)';
                btn.style.transform = 'translateY(0)';
            });
        });

        // Action handlers
        menu.addEventListener('click', (e) => {
            const btn = e.target.closest('.trophy-demo-action');
            if (!btn) return;

            const action = btn.dataset.action;

            switch (action) {
                case 'unlock-common':
                    this.unlockRandomTrophy('common');
                    break;
                case 'unlock-rare':
                    this.unlockRandomTrophy('rare');
                    break;
                case 'unlock-epic':
                    this.unlockRandomTrophy('epic');
                    break;
                case 'unlock-legendary':
                    this.unlockRandomTrophy('legendary');
                    break;
                case 'unlock-all':
                    this.unlockAllTrophies();
                    menu.remove();
                    break;
                case 'reset':
                    this.resetAllProgress();
                    menu.remove();
                    break;
                case 'close':
                    menu.remove();
                    break;
            }
        });

        document.body.appendChild(menu);
    }

    /**
     * Unlock random trophy by rarity
     */
    unlockRandomTrophy(rarity) {
        const availableTrophies = trophyShowcase.trophies.filter(t => 
            t.rarity === rarity && !trophyShowcase.unlockedTrophies.has(t.id)
        );

        if (availableTrophies.length === 0) {
            alert(`All ${rarity} trophies are already unlocked!`);
            return;
        }

        const trophy = availableTrophies[Math.floor(Math.random() * availableTrophies.length)];
        trophyShowcase.unlockTrophy(trophy.id);
        
        // Refresh UI after animation
        setTimeout(() => {
            this.renderPage();
        }, 1000);
    }

    /**
     * Unlock all trophies
     */
    unlockAllTrophies() {
        trophyShowcase.trophies.forEach(trophy => {
            if (!trophyShowcase.unlockedTrophies.has(trophy.id)) {
                trophyShowcase.unlockedTrophies.add(trophy.id);
            }
        });
        trophyShowcase.saveProgress();
        this.renderPage();
        
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'trophy-toast show';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>All trophies unlocked!</span>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    /**
     * Reset all progress
     */
    resetAllProgress() {
        if (confirm('Are you sure you want to reset all trophy progress?')) {
            localStorage.removeItem('ultimate_sports_trophies');
            trophyShowcase.unlockedTrophies.clear();
            trophyShowcase.showcaseTrophies = [];
            this.renderPage();
            
            // Show success message
            const toast = document.createElement('div');
            toast.className = 'trophy-toast show';
            toast.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Trophy progress reset!</span>
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    }

    /**
     * Check for auto-unlock based on user stats
     */
    checkAutoUnlock() {
        // Get user stats from localStorage or other sources
        const userStats = this.getUserStats();
        
        if (userStats) {
            trophyShowcase.checkTrophyUnlock(userStats);
        }
    }

    /**
     * Get user statistics for trophy checking
     */
    getUserStats() {
        try {
            // Try to get stats from various sources
            const pickHistory = JSON.parse(localStorage.getItem('pick_history') || '[]');
            const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
            
            // Calculate stats
            const wins = pickHistory.filter(p => p.result === 'win').length;
            const total = pickHistory.length;
            const winRate = total > 0 ? (wins / total) * 100 : 0;
            
            // Calculate sport wins
            const sportWins = {};
            pickHistory.forEach(pick => {
                if (pick.result === 'win' && pick.sport) {
                    sportWins[pick.sport] = (sportWins[pick.sport] || 0) + 1;
                }
            });

            return {
                totalWins: wins,
                totalPicks: total,
                winRate: winRate,
                currentStreak: this.calculateStreak(pickHistory),
                sportWins: sportWins,
                maxParlayLegs: this.getMaxParlayLegs(pickHistory),
                unitsProfit: userProfile.unitsProfit || 0,
                leaderboardRank: userProfile.leaderboardRank || 999,
                subscriptionTier: userProfile.tier || 'FREE'
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            return null;
        }
    }

    /**
     * Calculate current win streak
     */
    calculateStreak(pickHistory) {
        let streak = 0;
        for (let i = pickHistory.length - 1; i >= 0; i--) {
            if (pickHistory[i].result === 'win') {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    /**
     * Get maximum parlay legs hit
     */
    getMaxParlayLegs(pickHistory) {
        let max = 0;
        pickHistory.forEach(pick => {
            if (pick.result === 'win' && pick.parlayLegs) {
                max = Math.max(max, pick.parlayLegs);
            }
        });
        return max;
    }

    /**
     * Cleanup when leaving page
     */
    cleanup() {
        // Remove demo button if exists
        const demoBtn = document.querySelector('.trophy-demo-btn');
        if (demoBtn) {
            demoBtn.remove();
        }
    }
}

// Create instance
const trophyShowcasePageInit = new TrophyShowcasePageInit();

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.hash.includes('trophy-showcase')) {
            trophyShowcasePageInit.init();
        }
    });
} else {
    if (window.location.hash.includes('trophy-showcase')) {
        trophyShowcasePageInit.init();
    }
}

// Export
export default trophyShowcasePageInit;
