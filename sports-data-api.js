// ============================================
// SPORTS DATA API INTEGRATION
// Real-time data with intelligent fallbacks
// ============================================

export class SportsDataAPI {
    constructor() {
        this.config = {
            // API Keys (configure in localStorage or config file)
            theOddsApiKey: localStorage.getItem('THE_ODDS_API_KEY') || 'YOUR_API_KEY_HERE',
            sportsDataIoKey: localStorage.getItem('SPORTSDATA_IO_KEY') || 'YOUR_API_KEY_HERE',
            apiFootballKey: localStorage.getItem('API_FOOTBALL_KEY') || 'YOUR_API_KEY_HERE',
            
            // API Endpoints
            endpoints: {
                theOdds: 'https://api.the-odds-api.com/v4',
                sportsDataIo: 'https://api.sportsdata.io/v3',
                apiFootball: 'https://v3.football.api-sports.io',
                espn: 'https://site.api.espn.com/apis/site/v2/sports'
            },
            
            // Cache settings
            cacheEnabled: true,
            cacheDuration: 30000, // 30 seconds
            
            // Fallback settings
            useFallback: true,
            maxRetries: 3,
            retryDelay: 1000
        };
        
        this.cache = new Map();
        this.rateLimiter = new RateLimiter();
        this.fallbackData = new FallbackDataGenerator();
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    init() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('📶 Connection restored - switching to live data');
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Connection lost - using cached/fallback data');
        });
        
        console.log('✅ Sports Data API initialized');
    }

    // ============================================
    // MAIN DATA FETCHING METHODS
    // ============================================

    async getLiveGames(sport = 'all') {
        const cacheKey = `live_games_${sport}`;
        
        // Check cache first
        if (this.isCacheValid(cacheKey)) {
            return this.getFromCache(cacheKey);
        }

        // Try to fetch live data
        try {
            let data;
            
            if (!this.isOnline) {
                throw new Error('Offline mode');
            }

            // Try multiple sources with priority
            data = await this.fetchWithFallback([
                () => this.fetchFromESPN(sport),
                () => this.fetchFromTheOddsAPI(sport),
                () => this.fetchFromSportsDataIO(sport)
            ]);

            // Process and normalize data
            const normalizedData = this.normalizeGameData(data, sport);
            
            // Cache the results
            this.setCache(cacheKey, normalizedData);
            
            return normalizedData;
        } catch (error) {
            console.warn('Failed to fetch live data:', error.message);
            return this.handleFetchError(cacheKey, sport);
        }
    }

    async getOdds(gameId, markets = ['h2h', 'spreads', 'totals']) {
        const cacheKey = `odds_${gameId}_${markets.join('_')}`;
        
        if (this.isCacheValid(cacheKey)) {
            return this.getFromCache(cacheKey);
        }

        try {
            if (!this.isOnline) {
                throw new Error('Offline mode');
            }

            const data = await this.fetchWithFallback([
                () => this.fetchOddsFromTheOddsAPI(gameId, markets),
                () => this.fetchOddsFromSportsDataIO(gameId)
            ]);

            const normalizedOdds = this.normalizeOddsData(data);
            this.setCache(cacheKey, normalizedOdds);
            
            return normalizedOdds;
        } catch (error) {
            console.warn('Failed to fetch odds:', error.message);
            return this.fallbackData.generateOdds(gameId);
        }
    }

    async getGameDetails(gameId) {
        const cacheKey = `game_details_${gameId}`;
        
        if (this.isCacheValid(cacheKey)) {
            return this.getFromCache(cacheKey);
        }

        try {
            const data = await this.fetchWithFallback([
                () => this.fetchGameDetailsFromESPN(gameId),
                () => this.fetchGameDetailsFromSportsDataIO(gameId)
            ]);

            const details = this.normalizeGameDetails(data);
            this.setCache(cacheKey, details);
            
            return details;
        } catch (error) {
            console.warn('Failed to fetch game details:', error.message);
            return this.fallbackData.generateGameDetails(gameId);
        }
    }

    async getTeamStats(teamId, league) {
        const cacheKey = `team_stats_${teamId}_${league}`;
        
        // Team stats can be cached longer (5 minutes)
        if (this.isCacheValid(cacheKey, 300000)) {
            return this.getFromCache(cacheKey);
        }

        try {
            const data = await this.fetchWithFallback([
                () => this.fetchTeamStatsFromSportsDataIO(teamId, league),
                () => this.fetchTeamStatsFromESPN(teamId, league)
            ]);

            this.setCache(cacheKey, data, 300000);
            return data;
        } catch (error) {
            console.warn('Failed to fetch team stats:', error.message);
            return this.fallbackData.generateTeamStats(teamId);
        }
    }

    async getPlayerStats(playerId, league) {
        const cacheKey = `player_stats_${playerId}_${league}`;
        
        if (this.isCacheValid(cacheKey, 300000)) {
            return this.getFromCache(cacheKey);
        }

        try {
            const data = await this.fetchTeamStatsFromSportsDataIO(playerId, league);
            this.setCache(cacheKey, data, 300000);
            return data;
        } catch (error) {
            return this.fallbackData.generatePlayerStats(playerId);
        }
    }

    async getInjuryReport(league) {
        const cacheKey = `injuries_${league}`;
        
        // Injury reports cached for 1 hour
        if (this.isCacheValid(cacheKey, 3600000)) {
            return this.getFromCache(cacheKey);
        }

        try {
            const data = await this.fetchInjuriesFromSportsDataIO(league);
            this.setCache(cacheKey, data, 3600000);
            return data;
        } catch (error) {
            return [];
        }
    }

    async getWeatherData(gameId, venue) {
        const cacheKey = `weather_${gameId}`;
        
        if (this.isCacheValid(cacheKey, 600000)) {
            return this.getFromCache(cacheKey);
        }

        try {
            // In production, use OpenWeatherMap or similar
            const data = await this.fetchWeatherData(venue);
            this.setCache(cacheKey, data, 600000);
            return data;
        } catch (error) {
            return this.fallbackData.generateWeather();
        }
    }

    // ============================================
    // ESPN API METHODS (FREE)
    // ============================================

    async fetchFromESPN(sport) {
        const sportMap = {
            'NBA': 'basketball/nba',
            'NFL': 'football/nfl',
            'MLB': 'baseball/mlb',
            'NHL': 'hockey/nhl',
            'all': 'basketball/nba' // Default to NBA
        };

        const sportPath = sportMap[sport] || sportMap['all'];
        const url = `${this.config.endpoints.espn}/${sportPath}/scoreboard`;

        const response = await this.fetchWithTimeout(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`ESPN API error: ${response.status}`);
        }

        const data = await response.json();
        return this.parseESPNData(data);
    }

    parseESPNData(data) {
        if (!data.events) return [];

        return data.events.map(event => {
            const competition = event.competitions[0];
            const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
            const awayTeam = competition.competitors.find(c => c.homeAway === 'away');

            return {
                id: event.id,
                league: data.leagues?.[0]?.abbreviation || 'NBA',
                sport: data.leagues?.[0]?.name || 'Basketball',
                homeTeam: {
                    id: homeTeam.id,
                    name: homeTeam.team.displayName,
                    shortName: homeTeam.team.abbreviation,
                    score: parseInt(homeTeam.score) || 0,
                    record: homeTeam.records?.[0]?.summary || '0-0',
                    logo: homeTeam.team.logo
                },
                awayTeam: {
                    id: awayTeam.id,
                    name: awayTeam.team.displayName,
                    shortName: awayTeam.team.abbreviation,
                    score: parseInt(awayTeam.score) || 0,
                    record: awayTeam.records?.[0]?.summary || '0-0',
                    logo: awayTeam.team.logo
                },
                status: this.parseESPNStatus(competition.status),
                startTime: event.date,
                venue: competition.venue?.fullName || 'Unknown',
                broadcast: competition.broadcasts?.[0]?.names?.[0] || null,
                situation: competition.situation || null
            };
        });
    }

    parseESPNStatus(status) {
        const typeId = status.type.id;
        
        if (typeId === '1') return 'scheduled';
        if (typeId === '2') return 'live';
        if (typeId === '3') return 'final';
        
        return 'scheduled';
    }

    async fetchGameDetailsFromESPN(gameId) {
        // Check if this is a mock/fallback game ID
        if (gameId.includes('game-') || gameId.includes('fallback_')) {
            throw new Error('Mock game ID - using fallback data');
        }
        
        // ESPN provides detailed game data
        const url = `${this.config.endpoints.espn}/basketball/nba/summary?event=${gameId}`;
        
        const response = await this.fetchWithTimeout(url);
        if (!response.ok) throw new Error('ESPN game details failed');
        
        return await response.json();
    }

    async fetchTeamStatsFromESPN(teamId, league) {
        const sportMap = {
            'NBA': 'basketball/nba',
            'NFL': 'football/nfl',
            'MLB': 'baseball/mlb'
        };

        const url = `${this.config.endpoints.espn}/${sportMap[league]}/teams/${teamId}/statistics`;
        
        const response = await this.fetchWithTimeout(url);
        if (!response.ok) throw new Error('ESPN team stats failed');
        
        return await response.json();
    }

    // ============================================
    // THE ODDS API METHODS
    // ============================================

    async fetchFromTheOddsAPI(sport) {
        // Skip if using placeholder API key
        if (this.config.theOddsApiKey === 'YOUR_API_KEY_HERE') {
            throw new Error('The Odds API key not configured');
        }

        await this.rateLimiter.waitForSlot('theOdds');

        const sportKey = this.mapSportToOddsAPI(sport);
        const url = `${this.config.endpoints.theOdds}/sports/${sportKey}/odds/?apiKey=${this.config.theOddsApiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`;

        const response = await this.fetchWithTimeout(url);
        
        if (!response.ok) {
            throw new Error(`The Odds API error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    }

    async fetchOddsFromTheOddsAPI(gameId, markets) {
        // Skip if using placeholder API key
        if (this.config.theOddsApiKey === 'YOUR_API_KEY_HERE') {
            throw new Error('The Odds API key not configured');
        }

        await this.rateLimiter.waitForSlot('theOdds');

        const url = `${this.config.endpoints.theOdds}/sports/basketball_nba/events/${gameId}/odds?apiKey=${this.config.theOddsApiKey}&regions=us&markets=${markets.join(',')}&oddsFormat=american`;

        const response = await this.fetchWithTimeout(url);
        if (!response.ok) throw new Error('Odds API failed');

        return await response.json();
    }

    mapSportToOddsAPI(sport) {
        const mapping = {
            'NBA': 'basketball_nba',
            'NFL': 'americanfootball_nfl',
            'MLB': 'baseball_mlb',
            'NHL': 'icehockey_nhl'
        };
        return mapping[sport] || 'basketball_nba';
    }

    // ============================================
    // SPORTSDATA.IO METHODS
    // ============================================

    async fetchFromSportsDataIO(sport) {
        // Skip if using placeholder API key
        if (this.config.sportsDataIoKey === 'YOUR_API_KEY_HERE') {
            throw new Error('SportsData.io API key not configured');
        }

        await this.rateLimiter.waitForSlot('sportsDataIo');

        const sportPath = sport.toLowerCase();
        const url = `${this.config.endpoints.sportsDataIo}/${sportPath}/scores/json/GamesByDate/${this.getTodayDate()}?key=${this.config.sportsDataIoKey}`;

        const response = await this.fetchWithTimeout(url);
        
        if (!response.ok) {
            throw new Error(`SportsData.io error: ${response.status}`);
        }

        return await response.json();
    }

    async fetchOddsFromSportsDataIO(gameId) {
        // Skip if using placeholder API key
        if (this.config.sportsDataIoKey === 'YOUR_API_KEY_HERE') {
            throw new Error('SportsData.io API key not configured');
        }

        await this.rateLimiter.waitForSlot('sportsDataIo');

        const url = `${this.config.endpoints.sportsDataIo}/nba/odds/json/GameOddsByGameID/${gameId}?key=${this.config.sportsDataIoKey}`;

        const response = await this.fetchWithTimeout(url);
        if (!response.ok) throw new Error('SportsData.io odds failed');

        return await response.json();
    }

    async fetchTeamStatsFromSportsDataIO(teamId, league) {
        // Skip if using placeholder API key
        if (this.config.sportsDataIoKey === 'YOUR_API_KEY_HERE') {
            throw new Error('SportsData.io API key not configured');
        }

        await this.rateLimiter.waitForSlot('sportsDataIo');

        const url = `${this.config.endpoints.sportsDataIo}/${league.toLowerCase()}/scores/json/TeamSeasonStats/2024?key=${this.config.sportsDataIoKey}`;

        const response = await this.fetchWithTimeout(url);
        if (!response.ok) throw new Error('Team stats failed');

        const allTeams = await response.json();
        return allTeams.find(t => t.TeamID === teamId);
    }

    async fetchInjuriesFromSportsDataIO(league) {
        // Skip if using placeholder API key
        if (this.config.sportsDataIoKey === 'YOUR_API_KEY_HERE') {
            throw new Error('SportsData.io API key not configured');
        }

        await this.rateLimiter.waitForSlot('sportsDataIo');

        const url = `${this.config.endpoints.sportsDataIo}/${league.toLowerCase()}/scores/json/Injuries?key=${this.config.sportsDataIoKey}`;

        const response = await this.fetchWithTimeout(url);
        if (!response.ok) throw new Error('Injuries failed');

        return await response.json();
    }

    async fetchGameDetailsFromSportsDataIO(gameId) {
        // Skip if using placeholder API key
        if (this.config.sportsDataIoKey === 'YOUR_API_KEY_HERE') {
            throw new Error('SportsData.io API key not configured');
        }

        await this.rateLimiter.waitForSlot('sportsDataIo');

        const url = `${this.config.endpoints.sportsDataIo}/nba/stats/json/BoxScore/${gameId}?key=${this.config.sportsDataIoKey}`;

        const response = await this.fetchWithTimeout(url);
        if (!response.ok) throw new Error('Game details failed');

        return await response.json();
    }

    // ============================================
    // DATA NORMALIZATION
    // ============================================

    normalizeGameData(data, sport) {
        // Normalize data from different sources to common format
        if (Array.isArray(data)) {
            return data.map(game => this.normalizeGame(game, sport));
        }
        return [];
    }

    normalizeGame(game, sport) {
        // Common game structure
        return {
            id: game.id || game.GameID || game.gameId,
            league: sport,
            homeTeam: this.normalizeTeam(game.homeTeam || game.HomeTeam),
            awayTeam: this.normalizeTeam(game.awayTeam || game.AwayTeam),
            status: game.status || game.Status,
            startTime: game.startTime || game.DateTime || game.date,
            venue: game.venue || game.Stadium || game.Venue,
            odds: game.odds || null
        };
    }

    normalizeTeam(team) {
        return {
            id: team.id || team.TeamID,
            name: team.name || team.Name || team.displayName,
            shortName: team.shortName || team.Key || team.abbreviation,
            score: team.score || team.Score || 0,
            record: team.record || team.Wins + '-' + team.Losses || '0-0'
        };
    }

    normalizeOddsData(data) {
        // Normalize odds from different bookmakers
        if (!data || !data.bookmakers) return null;

        const primaryBookmaker = data.bookmakers[0];
        const odds = {
            moneyline: { home: null, away: null },
            spread: { home: null, away: null, line: null },
            total: { over: null, under: null, line: null }
        };

        primaryBookmaker.markets.forEach(market => {
            if (market.key === 'h2h') {
                odds.moneyline.home = market.outcomes.find(o => o.name === 'home')?.price || -110;
                odds.moneyline.away = market.outcomes.find(o => o.name === 'away')?.price || -110;
            }
            if (market.key === 'spreads') {
                const homeSpread = market.outcomes.find(o => o.name === 'home');
                const awaySpread = market.outcomes.find(o => o.name === 'away');
                odds.spread.home = homeSpread?.price || -110;
                odds.spread.away = awaySpread?.price || -110;
                odds.spread.line = homeSpread?.point || 0;
            }
            if (market.key === 'totals') {
                const over = market.outcomes.find(o => o.name === 'Over');
                const under = market.outcomes.find(o => o.name === 'Under');
                odds.total.over = over?.price || -110;
                odds.total.under = under?.price || -110;
                odds.total.line = over?.point || 0;
            }
        });

        return odds;
    }

    normalizeGameDetails(data) {
        return {
            playByPlay: data.plays || data.PlayByPlay || [],
            boxScore: data.boxscore || data.BoxScore || {},
            leaders: data.leaders || data.Leaders || {},
            situation: data.situation || {},
            weather: data.weather || null
        };
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    async fetchWithFallback(fetchFunctions) {
        for (const fetchFn of fetchFunctions) {
            try {
                return await fetchFn();
            } catch (error) {
                console.warn(`Fetch attempt failed, trying next source...`);
                continue;
            }
        }
        throw new Error('All data sources failed');
    }

    async fetchWithTimeout(url, options = {}, timeout = 10000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    handleFetchError(cacheKey, sport) {
        // Try to return cached data even if expired
        if (this.cache.has(cacheKey)) {
            console.log('📦 Using expired cache as fallback');
            return this.cache.get(cacheKey).data;
        }

        // Use fallback data generator
        console.log('🎲 Generating fallback data');
        return this.fallbackData.generateGames(sport);
    }

    // ============================================
    // CACHE MANAGEMENT
    // ============================================

    isCacheValid(key, duration = this.config.cacheDuration) {
        if (!this.config.cacheEnabled) return false;
        
        const cached = this.cache.get(key);
        if (!cached) return false;
        
        return (Date.now() - cached.timestamp) < duration;
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        return cached ? cached.data : null;
    }

    setCache(key, data, duration = this.config.cacheDuration) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            duration
        });

        // Auto-cleanup old cache entries
        this.cleanupCache();
    }

    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > value.duration) {
                this.cache.delete(key);
            }
        }
    }

    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache cleared');
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    getTodayDate() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    async syncOfflineData() {
        // Sync any offline changes when connection is restored
        console.log('🔄 Syncing offline data...');
        // Implementation depends on your offline storage strategy
    }

    async fetchWeatherData(venue) {
        // Placeholder for weather API integration
        return {
            temperature: 72,
            condition: 'Clear',
            humidity: 45,
            windSpeed: 8
        };
    }
}

// ============================================
// RATE LIMITER
// ============================================

class RateLimiter {
    constructor() {
        this.limits = {
            theOdds: { calls: 0, max: 500, resetTime: 60000 }, // 500 per minute
            sportsDataIo: { calls: 0, max: 100, resetTime: 60000 }, // 100 per minute
            default: { calls: 0, max: 1000, resetTime: 60000 }
        };

        // Reset counters periodically
        setInterval(() => this.resetCounters(), 60000);
    }

    async waitForSlot(apiName = 'default') {
        const limit = this.limits[apiName] || this.limits.default;
        
        if (limit.calls >= limit.max) {
            console.log(`⏳ Rate limit reached for ${apiName}, waiting...`);
            await this.sleep(limit.resetTime);
        }

        limit.calls++;
    }

    resetCounters() {
        Object.values(this.limits).forEach(limit => {
            limit.calls = 0;
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================
// FALLBACK DATA GENERATOR
// ============================================

class FallbackDataGenerator {
    generateGames(sport = 'NBA') {
        console.log('🎲 Generating fallback game data');
        
        const teams = this.getTeamsBySport(sport);
        const games = [];

        for (let i = 0; i < 5; i++) {
            const homeIndex = Math.floor(Math.random() * teams.length);
            let awayIndex = Math.floor(Math.random() * teams.length);
            while (awayIndex === homeIndex) {
                awayIndex = Math.floor(Math.random() * teams.length);
            }

            games.push({
                id: `fallback_${Date.now()}_${i}`,
                league: sport,
                homeTeam: {
                    ...teams[homeIndex],
                    score: this.status === 'live' ? Math.floor(Math.random() * 100) : 0
                },
                awayTeam: {
                    ...teams[awayIndex],
                    score: this.status === 'live' ? Math.floor(Math.random() * 100) : 0
                },
                status: i === 0 ? 'live' : 'scheduled',
                startTime: new Date(Date.now() + i * 3600000).toISOString(),
                venue: 'Stadium',
                odds: this.generateOdds(`fallback_${i}`)
            });
        }

        return games;
    }

    generateOdds(gameId) {
        return {
            moneyline: {
                home: -150 + Math.floor(Math.random() * 100),
                away: 130 + Math.floor(Math.random() * 100)
            },
            spread: {
                home: -3.5,
                homeOdds: -110,
                away: 3.5,
                awayOdds: -110,
                line: -3.5
            },
            total: {
                over: -110,
                under: -110,
                line: 220.5 + Math.random() * 20
            }
        };
    }

    generateGameDetails(gameId) {
        return {
            playByPlay: [],
            boxScore: {},
            leaders: {},
            situation: null,
            weather: this.generateWeather()
        };
    }

    generateTeamStats(teamId) {
        return {
            ppg: 110 + Math.random() * 15,
            oppg: 105 + Math.random() * 15,
            wins: Math.floor(Math.random() * 50),
            losses: Math.floor(Math.random() * 50)
        };
    }

    generatePlayerStats(playerId) {
        return {
            points: 20 + Math.random() * 15,
            rebounds: 5 + Math.random() * 8,
            assists: 3 + Math.random() * 7
        };
    }

    generateWeather() {
        return {
            temperature: 65 + Math.random() * 20,
            condition: ['Clear', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
            humidity: 40 + Math.random() * 40,
            windSpeed: Math.floor(Math.random() * 15)
        };
    }

    getTeamsBySport(sport) {
        const teams = {
            NBA: [
                { id: 1, name: 'Los Angeles Lakers', shortName: 'LAL', record: '45-37' },
                { id: 2, name: 'Golden State Warriors', shortName: 'GSW', record: '44-38' },
                { id: 3, name: 'Boston Celtics', shortName: 'BOS', record: '57-25' },
                { id: 4, name: 'Miami Heat', shortName: 'MIA', record: '44-38' },
                { id: 5, name: 'Phoenix Suns', shortName: 'PHX', record: '49-33' },
                { id: 6, name: 'Milwaukee Bucks', shortName: 'MIL', record: '49-33' }
            ],
            NFL: [
                { id: 1, name: 'Kansas City Chiefs', shortName: 'KC', record: '11-6' },
                { id: 2, name: 'Buffalo Bills', shortName: 'BUF', record: '13-4' },
                { id: 3, name: 'San Francisco 49ers', shortName: 'SF', record: '12-5' },
                { id: 4, name: 'Philadelphia Eagles', shortName: 'PHI', record: '11-6' }
            ]
        };

        return teams[sport] || teams.NBA;
    }
}

// Export singleton instance
export const sportsDataAPI = new SportsDataAPI();
