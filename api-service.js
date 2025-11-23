// ============================================
// SPORTS DATA API SERVICE
// Real-time sports data from multiple sources
// ============================================

class SportsDataAPI {
    constructor() {
        // Get backend URL from config
        this.backendUrl = window.getApiUrl ? window.getApiUrl() : 'http://localhost:3001';
        
        // API Keys (In production, use environment variables)
        // For Rosebud: Set these in project settings/environment
        this.oddsAPIKey = this.getEnvVar('THE_ODDS_API_KEY') || '9f8af56c3774a79663650a7713d1a776';
        this.sportsDataKey = this.getEnvVar('SPORTSDATA_API_KEY') || 'demo';
        
        // Cache configuration
        this.cache = new Map();
        this.cacheExpiry = {
            odds: 5 * 60 * 1000,      // 5 minutes
            scores: 30 * 1000,        // 30 seconds  
            schedule: 60 * 60 * 1000, // 1 hour
            stats: 10 * 60 * 1000     // 10 minutes
        };
        
        // Rate limiting
        this.rateLimiter = {
            requests: [],
            maxPerMinute: 10
        };
        
        // Usage tracking
        this.usage = {
            total: 0,
            byEndpoint: {},
            byDay: {}
        };
        
        this.loadUsageFromStorage();
    }

    // ============================================
    // THE ODDS API (Primary - for odds data)
    // ============================================

    /**
     * Get live odds from multiple sportsbooks
     * @param {string} sport - Sport key (basketball_nba, americanfootball_nfl, etc.)
     * @returns {Promise<Array>} Array of games with odds from multiple books
     */
    async getLiveOdds(sport = 'basketball_nba') {
        const cacheKey = `odds_${sport}`;
        const cached = this.getFromCache(cacheKey, this.cacheExpiry.odds);
        if (cached) return cached;

        await this.checkRateLimit();

        try {
            // Use backend proxy for odds API - correct endpoint with query parameter
            const url = `${this.backendUrl}/api/odds/live?sport=${encodeURIComponent(sport)}`;

            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('⚠️ Invalid API key. Using demo data.');
                    return this.getDemoOddsData(sport);
                }
                if (response.status === 404) {
                    console.warn(`⚠️ Endpoint not found for sport: ${sport}. Using demo data.`);
                    return this.getDemoOddsData(sport);
                }
                if (response.status === 429) {
                    console.warn('⚠️ Rate limit exceeded. Using cached/demo data.');
                    return this.getDemoOddsData(sport);
                }
                if (response.status >= 500) {
                    console.warn(`⚠️ Backend error (${response.status}). Using demo data.`);
                    return this.getDemoOddsData(sport);
                }
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Track usage from headers
            const remaining = response.headers.get('x-requests-remaining');
            const used = response.headers.get('x-requests-used');
            if (remaining) {
                console.log(`📊 Odds API - Remaining: ${remaining}, Used: ${used}`);
            }
            
            this.trackAPICall('odds', sport);
            this.setCache(cacheKey, data, this.cacheExpiry.odds);
            
            return data;
        } catch (error) {
            console.error('❌ Error fetching live odds:', error.message);
            
            // Return fallback demo data
            return this.getDemoOddsData(sport);
        }
    }

    /**
     * Get list of available sports
     * @returns {Promise<Array>} Array of available sports
     */
    async getAvailableSports() {
        const cacheKey = 'sports_list';
        const cached = this.getFromCache(cacheKey, this.cacheExpiry.schedule);
        if (cached) return cached;

        try {
            // Use backend proxy for sports list
            const url = `${this.backendUrl}/api/odds/sports`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const data = await response.json();
            this.setCache(cacheKey, data, this.cacheExpiry.schedule);
            
            return data;
        } catch (error) {
            console.error('❌ Error fetching sports:', error);
            return this.getDemoSportsList();
        }
    }

    // ============================================
    // ESPN API (Secondary - for scores & schedules)
    // FREE - No API key required
    // ============================================

    /**
     * Get live scores from ESPN
     * @param {string} sport - Sport name (basketball, football, etc.)
     * @param {string} league - League name (nba, nfl, etc.)
     * @returns {Promise<Object>} Scoreboard data
     */
    async getLiveScores(sport = 'basketball', league = 'nba') {
        const cacheKey = `scores_${sport}_${league}`;
        const cached = this.getFromCache(cacheKey, this.cacheExpiry.scores);
        if (cached) return cached;

        try {
            const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error(`ESPN API Error: ${response.status}`);
            
            const data = await response.json();
            this.trackAPICall('espn_scores', `${sport}_${league}`);
            this.setCache(cacheKey, data, this.cacheExpiry.scores);
            
            console.log(`✅ ESPN Scores loaded: ${data.events?.length || 0} games`);
            return data;
        } catch (error) {
            console.error('❌ Error fetching ESPN scores:', error);
            return this.getDemoScoresData(league);
        }
    }

    /**
     * Get team standings
     * @param {string} sport - Sport name
     * @param {string} league - League name
     * @returns {Promise<Object>} Standings data
     */
    async getStandings(sport = 'basketball', league = 'nba') {
        const cacheKey = `standings_${sport}_${league}`;
        const cached = this.getFromCache(cacheKey, this.cacheExpiry.schedule);
        if (cached) return cached;

        try {
            const url = `https://site.api.espn.com/apis/v2/sports/${sport}/${league}/standings`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error(`ESPN API Error: ${response.status}`);
            
            const data = await response.json();
            this.setCache(cacheKey, data, this.cacheExpiry.schedule);
            
            return data;
        } catch (error) {
            console.error('❌ Error fetching standings:', error);
            return null;
        }
    }

    /**
     * Get team information
     * @param {string} sport - Sport name
     * @param {string} league - League name
     * @param {string} teamId - Team ID
     * @returns {Promise<Object>} Team data
     */
    async getTeamInfo(sport, league, teamId) {
        const cacheKey = `team_${teamId}`;
        const cached = this.getFromCache(cacheKey, this.cacheExpiry.schedule);
        if (cached) return cached;

        try {
            const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamId}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error(`ESPN API Error: ${response.status}`);
            
            const data = await response.json();
            this.setCache(cacheKey, data, this.cacheExpiry.schedule);
            
            return data;
        } catch (error) {
            console.error('❌ Error fetching team info:', error);
            return null;
        }
    }

    // ============================================
    // CACHE MANAGEMENT
    // ============================================

    getFromCache(key, maxAge) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        const now = Date.now();
        if (now - cached.timestamp > maxAge) {
            this.cache.delete(key);
            return null;
        }
        
        console.log(`📦 Cache hit: ${key}`);
        return cached.data;
    }

    setCache(key, data, maxAge) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now(),
            maxAge: maxAge
        });
    }

    clearCache(pattern = null) {
        if (pattern) {
            // Clear specific pattern
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
            console.log(`🗑️ Cleared cache for: ${pattern}`);
        } else {
            // Clear all
            this.cache.clear();
            console.log('🗑️ Cleared all cache');
        }
    }

    getCacheStats() {
        const stats = {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            oldestEntry: null,
            newestEntry: null
        };

        let oldest = Infinity;
        let newest = 0;

        for (const [key, value] of this.cache.entries()) {
            if (value.timestamp < oldest) {
                oldest = value.timestamp;
                stats.oldestEntry = { key, age: Date.now() - value.timestamp };
            }
            if (value.timestamp > newest) {
                newest = value.timestamp;
                stats.newestEntry = { key, age: Date.now() - value.timestamp };
            }
        }

        return stats;
    }

    // ============================================
    // RATE LIMITING
    // ============================================

    async checkRateLimit() {
        const now = Date.now();
        
        // Remove requests older than 1 minute
        this.rateLimiter.requests = this.rateLimiter.requests.filter(
            time => now - time < 60000
        );
        
        if (this.rateLimiter.requests.length >= this.rateLimiter.maxPerMinute) {
            const oldestRequest = Math.min(...this.rateLimiter.requests);
            const waitTime = 60000 - (now - oldestRequest);
            
            console.warn(`⏱️ Rate limit reached. Waiting ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            // Recursive check after waiting
            return this.checkRateLimit();
        }
        
        this.rateLimiter.requests.push(now);
    }

    // ============================================
    // USAGE TRACKING
    // ============================================

    trackAPICall(endpoint, detail = '') {
        this.usage.total++;
        
        const key = detail ? `${endpoint}_${detail}` : endpoint;
        this.usage.byEndpoint[key] = (this.usage.byEndpoint[key] || 0) + 1;
        
        const today = new Date().toISOString().split('T')[0];
        this.usage.byDay[today] = (this.usage.byDay[today] || 0) + 1;
        
        this.saveUsageToStorage();
    }

    getUsageReport() {
        const today = new Date().toISOString().split('T')[0];
        
        return {
            total: this.usage.total,
            today: this.usage.byDay[today] || 0,
            breakdown: this.usage.byEndpoint,
            history: this.usage.byDay
        };
    }

    resetUsageTracking() {
        this.usage = {
            total: 0,
            byEndpoint: {},
            byDay: {}
        };
        this.saveUsageToStorage();
    }

    saveUsageToStorage() {
        try {
            localStorage.setItem('api_usage', JSON.stringify(this.usage));
        } catch (e) {
            console.warn('Failed to save usage to storage:', e);
        }
    }

    loadUsageFromStorage() {
        try {
            const stored = localStorage.getItem('api_usage');
            if (stored) {
                this.usage = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to load usage from storage:', e);
        }
    }

    // ============================================
    // DEMO DATA (Fallback)
    // ============================================

    getDemoOddsData(sport) {
        console.warn('⚠️ Using demo odds data (API unavailable)');
        
        // Return realistic demo data structure matching The Odds API
        return [
            {
                id: 'demo_game_1',
                sport_key: sport,
                sport_title: sport.toUpperCase(),
                commence_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                home_team: 'Los Angeles Lakers',
                away_team: 'Golden State Warriors',
                bookmakers: [
                    {
                        key: 'draftkings',
                        title: 'DraftKings',
                        last_update: new Date().toISOString(),
                        markets: [
                            {
                                key: 'h2h',
                                outcomes: [
                                    { name: 'Los Angeles Lakers', price: -150 },
                                    { name: 'Golden State Warriors', price: 130 }
                                ]
                            },
                            {
                                key: 'spreads',
                                outcomes: [
                                    { name: 'Los Angeles Lakers', price: -110, point: -3.5 },
                                    { name: 'Golden State Warriors', price: -110, point: 3.5 }
                                ]
                            },
                            {
                                key: 'totals',
                                outcomes: [
                                    { name: 'Over', price: -110, point: 225.5 },
                                    { name: 'Under', price: -110, point: 225.5 }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];
    }

    getDemoScoresData(league) {
        console.warn('⚠️ Using demo scores data (ESPN unavailable)');
        return { events: [] };
    }

    getDemoSportsList() {
        return [
            { key: 'basketball_nba', title: 'NBA', active: true },
            { key: 'americanfootball_nfl', title: 'NFL', active: true },
            { key: 'baseball_mlb', title: 'MLB', active: true },
            { key: 'icehockey_nhl', title: 'NHL', active: true }
        ];
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    getEnvVar(name) {
        // Try multiple sources for environment variables
        if (typeof process !== 'undefined' && process.env) {
            return process.env[name];
        }
        if (typeof window !== 'undefined' && window.ENV) {
            return window.ENV[name];
        }
        return null;
    }

    /**
     * Health check for API connectivity
     * @returns {Promise<Object>} Status of each API
     */
    async healthCheck() {
        const results = {
            oddsAPI: { status: 'unknown', message: '' },
            espnAPI: { status: 'unknown', message: '' }
        };

        // Check The Odds API
        try {
            const sports = await this.getAvailableSports();
            results.oddsAPI.status = sports.length > 0 ? 'healthy' : 'unhealthy';
            results.oddsAPI.message = `Found ${sports.length} sports`;
        } catch (error) {
            results.oddsAPI.status = 'error';
            results.oddsAPI.message = error.message;
        }

        // Check ESPN API
        try {
            const scores = await this.getLiveScores('basketball', 'nba');
            results.espnAPI.status = 'healthy';
            results.espnAPI.message = `Found ${scores.events?.length || 0} games`;
        } catch (error) {
            results.espnAPI.status = 'error';
            results.espnAPI.message = error.message;
        }

        return results;
    }
}

// Singleton instance
export const sportsDataAPI = new SportsDataAPI();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.sportsDataAPI = sportsDataAPI;
}
