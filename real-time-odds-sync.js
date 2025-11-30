// ============================================
// REAL-TIME ODDS SYNC
// Syncs live odds from The Odds API with ESPN games
// Updates odds every 15-30 seconds based on market movement
// ============================================

class RealTimeOddsSync {
    constructor() {
        this.oddsCache = new Map();
        this.gameOdds = new Map();
        this.updateInterval = null;
        this.syncInterval = 30000; // 30 seconds default
        this.isActive = false;
        this.subscribers = new Map();
        this.lastUpdateTimestamp = new Map();
        this.oddsHistory = new Map(); // Track odds movements
        
        // Sport mappings: ESPN sport -> The Odds API sport codes
        this.sportMappings = {
            'basketball': 'basketball_nba',
            'football': 'americanfootball_nfl',
            'baseball': 'baseball_mlb',
            'hockey': 'icehockey_nhl',
            'soccer': 'soccer_mls'
        };
        
        // Bookmaker priority (best odds sources first)
        this.bookmakerPriority = [
            'fanduel',
            'draftkings', 
            'betmgm',
            'caesars',
            'betrivers',
            'pointsbet',
            'barstool',
            'espn',
            'wynn',
            'mybookie',
            'bovada',
            'ameristar'
        ];
        
        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        console.log('🔄 Real-Time Odds Sync initializing...');
        // Don't start syncing immediately - wait for explicit activation
        // setupUpdateInterval will be called when startSyncSport is invoked
        console.log('✅ Real-Time Odds Sync ready');
    }

    setupUpdateInterval() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        
        this.updateInterval = setInterval(async () => {
            if (this.isActive) {
                try {
                    await this.syncAllOdds();
                } catch (error) {
                    console.warn('⚠️ Background odds sync failed:', error.message);
                    // Don't stop syncing on errors, just log and continue
                }
            }
        }, this.syncInterval);
    }

    // ============================================
    // PUBLIC API
    // ============================================

    /**
     * Start syncing odds for a specific sport
     */
    async startSyncSport(sport) {
        console.log(`🚀 Starting odds sync for ${sport}...`);
        this.isActive = true;
        
        // Initial sync
        await this.syncOddsForSport(sport);
        
        // Then periodic updates
        this.setupUpdateInterval();
    }

    /**
     * Stop syncing odds
     */
    stopSync() {
        console.log('⏸️ Stopping odds sync');
        this.isActive = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    /**
     * Get current odds for a game
     */
    getGameOdds(gameId) {
        return this.gameOdds.get(gameId) || null;
    }

    /**
     * Get all odds for a sport
     */
    getOddsForSport(sport) {
        const oddsCode = this.sportMappings[sport];
        if (!oddsCode) return [];
        
        return Array.from(this.gameOdds.values())
            .filter(odd => odd.sport === sport);
    }

    /**
     * Subscribe to odds updates
     */
    onOddsUpdate(gameId, callback) {
        if (!this.subscribers.has(gameId)) {
            this.subscribers.set(gameId, []);
        }
        this.subscribers.get(gameId).push(callback);
        
        return () => {
            const callbacks = this.subscribers.get(gameId);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        };
    }

    /**
     * Get odds movement (up/down) for a game
     */
    getOddsMovement(gameId) {
        const history = this.oddsHistory.get(gameId);
        if (!history || history.length < 2) return 0;
        
        const latest = history[history.length - 1];
        const previous = history[history.length - 2];
        
        const latestAvg = (latest.homeML + latest.awayML) / 2;
        const previousAvg = (previous.homeML + previous.awayML) / 2;
        
        return latestAvg > previousAvg ? 1 : latestAvg < previousAvg ? -1 : 0;
    }

    // ============================================
    // ODDS SYNCING
    // ============================================

    /**
     * Sync all odds from The Odds API
     */
    async syncAllOdds() {
        const sports = Object.keys(this.sportMappings);
        
        try {
            for (const sport of sports) {
                await this.syncOddsForSport(sport);
            }
        } catch (error) {
            console.error('❌ Error syncing all odds:', error.message);
        }
    }

    /**
     * Sync odds for a specific sport
     */
    async syncOddsForSport(sport) {
        try {
            // Check if config is available
            if (!window.APP_CONFIG?.API?.BASE_URL) {
                console.warn(`⚠️ APP_CONFIG not yet available for ${sport}`);
                return;
            }

            const oddsCode = this.sportMappings[sport];
            if (!oddsCode) {
                console.warn(`⚠️ Unknown sport mapping: ${sport}`);
                return;
            }

            const timestamp = new Date().toISOString();
            console.log(`📡 Syncing odds for ${sport} (${timestamp})`);

            // Fetch from backend endpoint with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
            
            let result;
            try {
                const url = `${window.APP_CONFIG.API.BASE_URL}/api/odds/live?sport=${oddsCode}`;
                console.log(`  🔗 Fetching from: ${url.split('/').slice(-3).join('/')}`);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    console.warn(`⚠️ Odds API returned ${response.status}`);
                    return;
                }

                result = await response.json();
            } catch (fetchError) {
                clearTimeout(timeoutId);
                if (fetchError.name === 'AbortError') {
                    console.warn(`⚠️ Odds fetch timeout for ${sport}`);
                } else {
                    console.warn(`⚠️ Odds fetch failed for ${sport}:`, fetchError.message);
                }
                return;
            }
            
            if (!result.success || !result.odds) {
                console.warn('⚠️ Invalid odds response');
                return;
            }

            // Process each game's odds
            let processedCount = 0;
            for (const game of result.odds) {
                try {
                    const gameOdds = this.processGameOdds(game, sport);
                    if (gameOdds) {
                        const gameId = this.normalizeGameId(game.id);
                        
                        // Check if odds have changed
                        const oldOdds = this.gameOdds.get(gameId);
                        this.gameOdds.set(gameId, gameOdds);
                        
                        // Track history
                        if (!this.oddsHistory.has(gameId)) {
                            this.oddsHistory.set(gameId, []);
                        }
                        this.oddsHistory.get(gameId).push({
                            ...gameOdds,
                            timestamp
                        });
                        
                        // Trim history to last 10 updates
                        const history = this.oddsHistory.get(gameId);
                        if (history.length > 10) {
                            history.shift();
                        }

                        // Notify subscribers of change
                        if (oldOdds && this.hasOddsChanged(oldOdds, gameOdds)) {
                            this.notifySubscribers(gameId, gameOdds, oldOdds);
                        }

                        processedCount++;
                    }
                } catch (error) {
                    console.warn(`⚠️ Error processing game odds:`, error.message);
                }
            }

            console.log(`✅ Synced odds for ${processedCount} games in ${sport}`);

        } catch (error) {
            console.error(`❌ Error syncing odds for ${sport}:`, error.message);
        }
    }

    // ============================================
    // ODDS PROCESSING
    // ============================================

    /**
     * Process odds for a single game
     */
    processGameOdds(gameData, sport) {
        try {
            if (!gameData.bookmakers || gameData.bookmakers.length === 0) {
                return null;
            }

            // Get best odds from all bookmakers
            const bestOdds = this.getBestOdds(gameData.bookmakers);

            return {
                id: this.normalizeGameId(gameData.id),
                sport: sport,
                timestamp: new Date().toISOString(),
                
                // Moneyline odds (best from all books)
                homeML: bestOdds.h2h?.home || 0,
                awayML: bestOdds.h2h?.away || 0,
                drawML: bestOdds.h2h?.draw || null,
                
                // Spread odds (best from all books)
                homeSpread: bestOdds.spreads?.home?.point || 0,
                homeSpreadOdds: bestOdds.spreads?.home?.odds || 0,
                awaySpread: bestOdds.spreads?.away?.point || 0,
                awaySpreadOdds: bestOdds.spreads?.away?.odds || 0,
                
                // Totals (best from all books)
                total: bestOdds.totals?.over?.point || 0,
                overOdds: bestOdds.totals?.over?.odds || 0,
                underOdds: bestOdds.totals?.under?.odds || 0,
                
                // Bookmaker details
                bookmakers: this.getBestBookmakers(gameData.bookmakers),
                totalBookmakers: gameData.bookmakers.length,
                lastUpdate: new Date().toISOString()
            };
        } catch (error) {
            console.warn(`⚠️ Error processing game odds:`, error.message);
            return null;
        }
    }

    /**
     * Get best odds across all bookmakers
     */
    getBestOdds(bookmakers) {
        const bestOdds = {
            h2h: { home: null, away: null, draw: null },
            spreads: { home: null, away: null },
            totals: { over: null, under: null }
        };

        for (const bookmaker of bookmakers) {
            for (const market of bookmaker.markets || []) {
                try {
                    if (market.key === 'h2h') {
                        for (const outcome of market.outcomes) {
                            const price = outcome.price;
                            if (outcome.name === 'Home') {
                                if (!bestOdds.h2h.home || price > bestOdds.h2h.home) {
                                    bestOdds.h2h.home = price;
                                }
                            } else if (outcome.name === 'Away') {
                                if (!bestOdds.h2h.away || price > bestOdds.h2h.away) {
                                    bestOdds.h2h.away = price;
                                }
                            } else if (outcome.name === 'Draw') {
                                if (!bestOdds.h2h.draw || price > bestOdds.h2h.draw) {
                                    bestOdds.h2h.draw = price;
                                }
                            }
                        }
                    } else if (market.key === 'spreads') {
                        for (const outcome of market.outcomes) {
                            const price = outcome.price;
                            const point = outcome.point;
                            
                            if (outcome.name === 'Home') {
                                if (!bestOdds.spreads.home || price > bestOdds.spreads.home.odds) {
                                    bestOdds.spreads.home = { point, odds: price };
                                }
                            } else if (outcome.name === 'Away') {
                                if (!bestOdds.spreads.away || price > bestOdds.spreads.away.odds) {
                                    bestOdds.spreads.away = { point, odds: price };
                                }
                            }
                        }
                    } else if (market.key === 'totals') {
                        for (const outcome of market.outcomes) {
                            const price = outcome.price;
                            const point = outcome.point;
                            
                            if (outcome.name === 'Over') {
                                if (!bestOdds.totals.over || price > bestOdds.totals.over.odds) {
                                    bestOdds.totals.over = { point, odds: price };
                                }
                            } else if (outcome.name === 'Under') {
                                if (!bestOdds.totals.under || price > bestOdds.totals.under.odds) {
                                    bestOdds.totals.under = { point, odds: price };
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`⚠️ Error processing market:`, error.message);
                }
            }
        }

        return bestOdds;
    }

    /**
     * Get top bookmakers with their odds
     */
    getBestBookmakers(bookmakers, limit = 5) {
        return bookmakers
            .filter(b => this.bookmakerPriority.includes(b.title?.toLowerCase() || ''))
            .sort((a, b) => {
                const aIndex = this.bookmakerPriority.indexOf(a.title?.toLowerCase() || '');
                const bIndex = this.bookmakerPriority.indexOf(b.title?.toLowerCase() || '');
                return aIndex - bIndex;
            })
            .slice(0, limit)
            .map(b => ({
                name: b.title,
                lastUpdate: b.last_update,
                markets: b.markets?.length || 0
            }));
    }

    /**
     * Check if odds have changed significantly
     */
    hasOddsChanged(oldOdds, newOdds) {
        const threshold = 5; // 5 point threshold
        
        return Math.abs(oldOdds.homeML - newOdds.homeML) >= threshold ||
               Math.abs(oldOdds.awayML - newOdds.awayML) >= threshold ||
               Math.abs(oldOdds.total - newOdds.total) >= 0.5;
    }

    /**
     * Normalize game ID (handle different formats)
     */
    normalizeGameId(id) {
        return typeof id === 'string' ? id : String(id);
    }

    // ============================================
    // NOTIFICATIONS
    // ============================================

    /**
     * Notify subscribers of odds changes
     */
    notifySubscribers(gameId, newOdds, oldOdds) {
        const callbacks = this.subscribers.get(gameId) || [];
        
        const movement = {
            homeML: newOdds.homeML - oldOdds.homeML,
            awayML: newOdds.awayML - oldOdds.awayML,
            total: newOdds.total - oldOdds.total,
            homeSpread: newOdds.homeSpread - oldOdds.homeSpread
        };

        callbacks.forEach(callback => {
            try {
                callback({
                    gameId,
                    newOdds,
                    oldOdds,
                    movement,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('❌ Error in odds update callback:', error);
            }
        });
    }

    // ============================================
    // UTILITIES
    // ============================================

    /**
     * Get odds statistics for display
     */
    getOddsStats(sport) {
        const sportOdds = this.getOddsForSport(sport);
        
        if (sportOdds.length === 0) return null;

        const avgHomeML = sportOdds.reduce((sum, o) => sum + o.homeML, 0) / sportOdds.length;
        const avgTotal = sportOdds.reduce((sum, o) => sum + o.total, 0) / sportOdds.length;
        
        return {
            gameCount: sportOdds.length,
            avgHomeML: Math.round(avgHomeML),
            avgTotal: avgTotal.toFixed(1),
            lastSync: new Date().toISOString(),
            nextSync: new Date(Date.now() + this.syncInterval).toISOString()
        };
    }

    /**
     * Clear old odds data
     */
    clearOldData(maxAge = 86400000) { // 24 hours
        const now = Date.now();
        
        for (const [gameId, odds] of this.gameOdds.entries()) {
            const age = now - new Date(odds.lastUpdate).getTime();
            if (age > maxAge) {
                this.gameOdds.delete(gameId);
                this.oddsHistory.delete(gameId);
            }
        }
    }

    /**
     * Get system status
     */
    getStatus() {
        return {
            isActive: this.isActive,
            gamesTracked: this.gameOdds.size,
            updateInterval: this.syncInterval,
            lastUpdate: Array.from(this.gameOdds.values())
                .sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate))[0]?.lastUpdate || 'Never',
            subscribersCount: this.subscribers.size
        };
    }
}

// Export singleton
export const realTimeOddsSync = new RealTimeOddsSync();
export { RealTimeOddsSync };
