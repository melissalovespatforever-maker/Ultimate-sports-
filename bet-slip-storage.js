// ============================================
// BET SLIP PERSISTENCE
// Save and restore bet slip across page reloads
// ============================================

export class BetSlipStorage {
    constructor() {
        this.storageKey = 'sports_ai_bet_slip';
        this.wagerKey = 'sports_ai_wager_amount';
    }

    // ============================================
    // SAVE BET SLIP
    // ============================================

    saveBetSlip(picks) {
        try {
            const data = {
                picks: picks,
                timestamp: Date.now(),
                version: '1.0'
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            console.log('💾 Bet slip saved:', picks.length, 'picks');
        } catch (error) {
            console.error('Failed to save bet slip:', error);
        }
    }

    saveWagerAmount(amount) {
        try {
            localStorage.setItem(this.wagerKey, amount.toString());
        } catch (error) {
            console.error('Failed to save wager amount:', error);
        }
    }

    // ============================================
    // LOAD BET SLIP
    // ============================================

    loadBetSlip() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) return null;

            const data = JSON.parse(stored);
            
            // Check if data is too old (expire after 24 hours)
            const age = Date.now() - data.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (age > maxAge) {
                console.log('🗑️ Bet slip expired, clearing...');
                this.clearBetSlip();
                return null;
            }

            console.log('📂 Bet slip loaded:', data.picks.length, 'picks');
            return data.picks;
        } catch (error) {
            console.error('Failed to load bet slip:', error);
            return null;
        }
    }

    loadWagerAmount() {
        try {
            const amount = localStorage.getItem(this.wagerKey);
            return amount ? parseFloat(amount) : 0;
        } catch (error) {
            console.error('Failed to load wager amount:', error);
            return 0;
        }
    }

    // ============================================
    // CLEAR BET SLIP
    // ============================================

    clearBetSlip() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.wagerKey);
            console.log('🗑️ Bet slip cleared from storage');
        } catch (error) {
            console.error('Failed to clear bet slip:', error);
        }
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    hasSavedBetSlip() {
        const stored = localStorage.getItem(this.storageKey);
        if (!stored) return false;

        try {
            const data = JSON.parse(stored);
            const age = Date.now() - data.timestamp;
            const maxAge = 24 * 60 * 60 * 1000;
            return age <= maxAge && data.picks.length > 0;
        } catch {
            return false;
        }
    }

    getBetSlipSummary() {
        const picks = this.loadBetSlip();
        const wager = this.loadWagerAmount();
        
        if (!picks || picks.length === 0) {
            return null;
        }

        return {
            pickCount: picks.length,
            wagerAmount: wager,
            hasWager: wager > 0
        };
    }
}

// Create singleton instance
export const betSlipStorage = new BetSlipStorage();

// Make available globally for testing
if (typeof window !== 'undefined') {
    window.betSlipStorage = betSlipStorage;
}
