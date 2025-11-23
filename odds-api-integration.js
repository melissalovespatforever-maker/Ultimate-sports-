// ============================================
// ODDS API INTEGRATION - PHASE 1
// Connect to The Odds API for real-time data
// ============================================

import { lineMovementTracker } from './line-movement-tracker.js';

export class OddsAPIIntegration {
    constructor() {
        // Get API key from localStorage (user can set it in settings)
        this.apiKey = localStorage.getItem('THE_ODDS_API_KEY') || null;
        this.baseUrl = 'https://api.the-odds-api.com/v4';
        this.cache = new Map();
        this.cacheTimeout = 60000; // 60 seconds
        this.requestCount = 0;
        this.monthlyLimit = 500; // Free tier limit
        this.lineTracker = lineMovementTracker;
        this.trackLineMovements = true; // Enable line movement tracking
    }

    /**
     * Set API key
     */
    setAPIKey(key) {
        this.apiKey = key;
        localStorage.setItem('THE_ODDS_API_KEY', key);
    }

    /**
     * Check if API key is configured
     */
    hasAPIKey() {
        return this.apiKey !== null && this.apiKey !== '';
    }

    /**
     * Get available sports
     */
    async getSports() {
        if (!this.hasAPIKey()) {
            return this.getMockSports();
        }

        const cacheKey = 'sports';
        if (this.checkCache(cacheKey)) {
            return this.getCache(cacheKey);
        }

        try {
            const response = await fetch(`${this.baseUrl}/sports?apiKey=${this.apiKey}`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            this.setCache(cacheKey, data);
            this.requestCount++;

            return data;
        } catch (error) {
            console.error('Error fetching sports:', error);
            return this.getMockSports();
        }
    }

    /**
     * Get odds for a specific sport
     */
    async getOdds(sport = 'basketball_nba', regions = 'us', markets = 'h2h,spreads,totals') {
        if (!this.hasAPIKey()) {
            return this.getMockOdds(sport);
        }

        const cacheKey = `odds_${sport}`;
        if (this.checkCache(cacheKey)) {
            return this.getCache(cacheKey);
        }

        try {
            const url = `${this.baseUrl}/sports/${sport}/odds?` +
                       `apiKey=${this.apiKey}&` +
                       `regions=${regions}&` +
                       `markets=${markets}&` +
                       `oddsFormat=american`;

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Transform to our format
            const transformed = this.transformOddsData(data, sport);
            
            this.setCache(cacheKey, transformed);
            this.requestCount++;

            // Check remaining requests from header
            const remaining = response.headers.get('x-requests-remaining');
            if (remaining) {
                console.log(`API requests remaining: ${remaining}`);
            }

            return transformed;
        } catch (error) {
            console.error('Error fetching odds:', error);
            return this.getMockOdds(sport);
        }
    }

    /**
     * Transform API data to our internal format
     */
    transformOddsData(apiData, sport) {
        return apiData.map((game, index) => {
            const bookmaker = game.bookmakers[0]; // Use first bookmaker
            if (!bookmaker) return null;

            // Extract markets
            const h2hMarket = bookmaker.markets.find(m => m.key === 'h2h');
            const spreadsMarket = bookmaker.markets.find(m => m.key === 'spreads');
            const totalsMarket = bookmaker.markets.find(m => m.key === 'totals');

            const homeTeam = game.home_team;
            const awayTeam = game.away_team;

            // Get odds
            const homeML = h2hMarket?.outcomes.find(o => o.name === homeTeam)?.price || -110;
            const awayML = h2hMarket?.outcomes.find(o => o.name === awayTeam)?.price || -110;
            
            const homeSpread = spreadsMarket?.outcomes.find(o => o.name === homeTeam);
            const awaySpread = spreadsMarket?.outcomes.find(o => o.name === awayTeam);
            
            const overUnder = totalsMarket?.outcomes[0];

            const gameData = {
                id: `game_${index + 1}`,
                league: this.getLeagueFromSport(sport),
                homeTeam: this.cleanTeamName(homeTeam),
                awayTeam: this.cleanTeamName(awayTeam),
                startTime: this.formatTime(game.commence_time),
                status: this.getGameStatus(game.commence_time),
                odds: {
                    homeML: this.convertToAmerican(homeML),
                    awayML: this.convertToAmerican(awayML),
                    homeSpread: homeSpread?.point || 0,
                    homeSpreadOdds: this.convertToAmerican(homeSpread?.price || -110),
                    awaySpread: awaySpread?.point || 0,
                    awaySpreadOdds: this.convertToAmerican(awaySpread?.price || -110),
                    total: overUnder?.point || 0,
                    over: this.convertToAmerican(overUnder?.price || -110),
                    under: this.convertToAmerican(totalsMarket?.outcomes[1]?.price || -110)
                },
                bookmaker: bookmaker.key,
                lastUpdate: game.update_timestamp || Date.now()
            };
            
            // Track line movements
            if (this.trackLineMovements) {
                this.lineTracker.recordOdds(gameData.id, gameData.odds, {
                    homeTeam: gameData.homeTeam,
                    awayTeam: gameData.awayTeam,
                    league: gameData.league,
                    startTime: game.commence_time,
                    sportsbook: bookmaker.key
                });
            }
            
            return gameData;
        }).filter(game => game !== null);
    }

    /**
     * Convert decimal odds to American
     */
    convertToAmerican(decimal) {
        if (typeof decimal === 'number' && decimal < 100 && decimal > 1) {
            // It's decimal, convert it
            if (decimal >= 2) {
                return Math.round((decimal - 1) * 100);
            } else {
                return Math.round(-100 / (decimal - 1));
            }
        }
        // Already American
        return decimal;
    }

    getLeagueFromSport(sport) {
        const mapping = {
            'basketball_nba': 'NBA',
            'americanfootball_nfl': 'NFL',
            'baseball_mlb': 'MLB',
            'icehockey_nhl': 'NHL',
            'basketball_ncaab': 'NCAAB',
            'americanfootball_ncaaf': 'NCAAF'
        };
        return mapping[sport] || 'NBA';
    }

    cleanTeamName(name) {
        // Remove city names for cleaner display
        const parts = name.split(' ');
        return parts[parts.length - 1];
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const gameDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const timeStr = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        if (gameDate.getTime() === today.getTime()) {
            return `Today ${timeStr}`;
        } else if (gameDate.getTime() === today.getTime() + 86400000) {
            return `Tomorrow ${timeStr}`;
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
        }
    }

    getGameStatus(commenceTime) {
        const now = Date.now();
        const gameTime = new Date(commenceTime).getTime();
        const diff = gameTime - now;

        if (diff < 0 && diff > -10800000) { // Within 3 hours after start
            return 'live';
        } else if (diff < 0) {
            return 'finished';
        } else {
            return 'upcoming';
        }
    }

    // Cache management
    checkCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return false;
        
        const age = Date.now() - cached.timestamp;
        return age < this.cacheTimeout;
    }

    getCache(key) {
        return this.cache.get(key).data;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }

    // Mock data for when API key is not set
    getMockSports() {
        return [
            { key: 'basketball_nba', title: 'NBA' },
            { key: 'americanfootball_nfl', title: 'NFL' },
            { key: 'baseball_mlb', title: 'MLB' },
            { key: 'icehockey_nhl', title: 'NHL' }
        ];
    }

    getMockOdds(sport) {
        const league = this.getLeagueFromSport(sport);
        
        // Return mock data structure matching real API
        const mockGames = [
            {
                id: 'mock_1',
                league,
                homeTeam: 'Lakers',
                awayTeam: 'Warriors',
                startTime: 'Today 7:30 PM',
                status: 'upcoming',
                odds: {
                    homeML: -150,
                    awayML: +130,
                    homeSpread: -3.5,
                    homeSpreadOdds: -110,
                    awaySpread: +3.5,
                    awaySpreadOdds: -110,
                    total: 225.5,
                    over: -110,
                    under: -110
                },
                bookmaker: 'draftkings'
            },
            {
                id: 'mock_2',
                league,
                homeTeam: 'Celtics',
                awayTeam: 'Heat',
                startTime: 'Today 8:00 PM',
                status: 'upcoming',
                odds: {
                    homeML: -180,
                    awayML: +155,
                    homeSpread: -4.5,
                    homeSpreadOdds: -110,
                    awaySpread: +4.5,
                    awaySpreadOdds: -110,
                    total: 218.5,
                    over: -110,
                    under: -110
                },
                bookmaker: 'fanduel'
            }
        ];

        console.log('📝 Using mock odds data. Set your API key in settings to get real data.');
        return mockGames;
    }

    /**
     * Get API usage stats
     */
    getUsageStats() {
        return {
            requestsThisSession: this.requestCount,
            monthlyLimit: this.monthlyLimit,
            hasAPIKey: this.hasAPIKey(),
            cacheSize: this.cache.size
        };
    }

    /**
     * Test API connection
     */
    async testConnection() {
        if (!this.hasAPIKey()) {
            return {
                success: false,
                message: 'No API key configured'
            };
        }

        try {
            const response = await fetch(`${this.baseUrl}/sports?apiKey=${this.apiKey}`);
            
            if (response.ok) {
                const remaining = response.headers.get('x-requests-remaining');
                return {
                    success: true,
                    message: 'API connection successful',
                    requestsRemaining: remaining
                };
            } else {
                return {
                    success: false,
                    message: `API returned ${response.status}: ${response.statusText}`
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `Connection failed: ${error.message}`
            };
        }
    }
}

// Create singleton
export const oddsAPI = new OddsAPIIntegration();
