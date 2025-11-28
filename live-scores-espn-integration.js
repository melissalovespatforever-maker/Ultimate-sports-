// ============================================
// LIVE SCORES ESPN INTEGRATION
// Real-time game scores with ESPN data
// ============================================

class LiveScoresESPNIntegration {
    constructor() {
        this.games = new Map();
        this.sports = new Map();
        this.updateInterval = null;
        this.isLive = false;
        this.subscribers = new Map();
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
        
        // ESPN sport mappings
        this.espnSportMappings = {
            'nba': 'basketball',
            'nfl': 'football',
            'mlb': 'baseball',
            'nhl': 'hockey',
            'mls': 'soccer',
            'college-football': 'college-football',
            'college-basketball': 'college-basketball'
        };
        
        // Sport endpoints
        this.sportEndpoints = {
            'basketball': {
                league: 'nba',
                url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/events'
            },
            'football': {
                league: 'nfl',
                url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/events'
            },
            'baseball': {
                league: 'mlb',
                url: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/events'
            },
            'hockey': {
                league: 'nhl',
                url: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/events'
            },
            'soccer': {
                league: 'mls',
                url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/mls/events'
            },
            'college-football': {
                league: 'college-football',
                url: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/events'
            },
            'college-basketball': {
                league: 'college-basketball',
                url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/college-basketball/events'
            }
        };
        
        console.log('✅ Live Scores ESPN Integration initialized');
    }

    // ============================================
    // FETCH & CACHE
    // ============================================
    
    async fetchWithCache(key, fetchFn, timeout = this.cacheTimeout) {
        const cached = this.cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < timeout) {
            console.log(`📦 Using cached data for ${key}`);
            return cached.data;
        }
        
        try {
            const data = await fetchFn();
            this.cache.set(key, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error(`❌ Fetch error for ${key}:`, error);
            // Return cached data even if expired, better than nothing
            if (cached) {
                console.warn(`⚠️ Returning stale cache for ${key}`);
                return cached.data;
            }
            throw error;
        }
    }

    // ============================================
    // FETCH LIVE GAMES
    // ============================================
    
    async fetchLiveGames(sport = 'basketball') {
        try {
            const endpoint = this.sportEndpoints[sport];
            if (!endpoint) {
                console.warn(`⚠️ Unknown sport: ${sport}`);
                return [];
            }
            
            console.log(`🔄 Fetching live games for ${sport}...`);
            
            const data = await this.fetchWithCache(
                `espn_games_${sport}`,
                async () => {
                    const response = await fetch(endpoint);
                    
                    if (!response.ok) {
                        throw new Error(`ESPN API error: ${response.status}`);
                    }
                    
                    return await response.json();
                }
            );
            
            return this.processGames(data.events || [], sport);
        } catch (error) {
            console.error(`❌ Error fetching live games for ${sport}:`, error);
            return [];
        }
    }

    // ============================================
    // PROCESS GAMES
    // ============================================
    
    processGames(events, sport) {
        const games = [];
        
        events.forEach(event => {
            try {
                const game = this.parseGameData(event, sport);
                if (game) {
                    games.push(game);
                    this.games.set(game.id, game);
                }
            } catch (error) {
                console.warn(`⚠️ Error parsing game:`, error);
            }
        });
        
        console.log(`✅ Processed ${games.length} games for ${sport}`);
        this.emit('gamesUpdated', { sport, count: games.length, games });
        
        return games;
    }

    parseGameData(event, sport) {
        try {
            const competitions = event.competitions?.[0];
            if (!competitions) return null;
            
            const homeTeam = competitions.competitors?.find(c => c.homeAway === 'home');
            const awayTeam = competitions.competitors?.find(c => c.homeAway === 'away');
            
            if (!homeTeam || !awayTeam) return null;
            
            const game = {
                id: event.id,
                uid: event.uid,
                name: event.name,
                sport: sport,
                league: this.sportEndpoints[sport].league,
                
                // Team data
                homeTeam: {
                    id: homeTeam.id,
                    uid: homeTeam.uid,
                    name: homeTeam.displayName,
                    abbreviation: homeTeam.abbreviation,
                    logo: homeTeam.logo || null,
                    score: parseInt(homeTeam.score) || 0,
                    wins: homeTeam.record?.[0]?.summary || 'N/A',
                    losses: homeTeam.record?.[1]?.summary || 'N/A'
                },
                awayTeam: {
                    id: awayTeam.id,
                    uid: awayTeam.uid,
                    name: awayTeam.displayName,
                    abbreviation: awayTeam.abbreviation,
                    logo: awayTeam.logo || null,
                    score: parseInt(awayTeam.score) || 0,
                    wins: awayTeam.record?.[0]?.summary || 'N/A',
                    losses: awayTeam.record?.[1]?.summary || 'N/A'
                },
                
                // Game status
                status: event.status?.type || 'unknown',
                status_display: this.getStatusDisplay(event.status),
                
                // Timing
                dateTime: new Date(event.date),
                startTime: new Date(event.date).toLocaleTimeString(),
                date: new Date(event.date).toLocaleDateString(),
                
                // Game details
                venue: competitions.venue?.fullName || 'TBA',
                broadcast: this.extractBroadcast(competitions.broadcasts),
                
                // Quarter/Period info
                period: competitions.status?.period || 0,
                displayClock: competitions.status?.displayClock || '0:00',
                
                // Link to ESPN
                espnUrl: event.links?.find(l => l.text === 'Gamecast')?.href || event.links?.[0]?.href,
                
                // Last updated
                lastUpdated: new Date()
            };
            
            return game;
        } catch (error) {
            console.error(`❌ Error parsing game data:`, error);
            return null;
        }
    }

    getStatusDisplay(status) {
        const typeMap = {
            'pre': '📅 Scheduled',
            'in': '🔴 Live',
            'post': '✅ Final',
            'scheduled': '📅 Scheduled',
            'inprogress': '🔴 Live',
            'final': '✅ Final'
        };
        
        const displayType = status?.type?.toLowerCase() || 'unknown';
        return typeMap[displayType] || status?.description || 'Unknown';
    }

    extractBroadcast(broadcasts) {
        if (!broadcasts || !Array.isArray(broadcasts)) return null;
        
        const broadcast = broadcasts[0];
        return {
            network: broadcast?.names?.[0] || 'TBD',
            channel: broadcast?.market || 'TBD'
        };
    }

    // ============================================
    // LIVE UPDATES
    // ============================================
    
    startLiveUpdates(sports = ['basketball', 'football', 'baseball'], intervalSeconds = 30) {
        if (this.isLive) {
            console.warn('⚠️ Live updates already running');
            return;
        }
        
        this.isLive = true;
        console.log(`🔴 Starting live score updates for: ${sports.join(', ')}`);
        
        // Initial fetch
        this.updateAllSports(sports);
        
        // Set up interval
        this.updateInterval = setInterval(() => {
            this.updateAllSports(sports);
        }, intervalSeconds * 1000);
        
        this.emit('liveStarted', { sports, interval: intervalSeconds });
    }

    async updateAllSports(sports) {
        const updates = await Promise.all(
            sports.map(sport => this.fetchLiveGames(sport))
        );
        
        console.log(`📊 Live score update complete - ${updates.flat().length} total games`);
    }

    stopLiveUpdates() {
        if (!this.isLive) return;
        
        this.isLive = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('⏸️ Live score updates stopped');
        this.emit('liveStopped');
    }

    // ============================================
    // GETTERS
    // ============================================
    
    getAllGames() {
        return Array.from(this.games.values());
    }

    getGame(gameId) {
        return this.games.get(gameId);
    }

    getGamesBySport(sport) {
        return this.getAllGames().filter(game => game.sport === sport);
    }

    getGamesByStatus(status) {
        return this.getAllGames().filter(game => 
            game.status.toLowerCase().includes(status.toLowerCase())
        );
    }

    getLiveGames() {
        return this.getGamesByStatus('in');
    }

    getScheduledGames() {
        return this.getGamesByStatus('pre');
    }

    getFinalGames() {
        return this.getGamesByStatus('post');
    }

    getGamesByTeam(teamId) {
        return this.getAllGames().filter(game =>
            game.homeTeam.id === teamId || game.awayTeam.id === teamId
        );
    }

    // ============================================
    // EVENT SYSTEM
    // ============================================
    
    on(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        this.subscribers.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.subscribers.has(event)) return;
        
        const callbacks = this.subscribers.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.subscribers.has(event)) return;
        
        this.subscribers.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`❌ Error in event listener for ${event}:`, error);
            }
        });
    }

    // ============================================
    // UTILITIES
    // ============================================
    
    formatScore(homeScore, awayScore) {
        return `${homeScore} - ${awayScore}`;
    }

    formatGameTime(game) {
        if (game.status.toLowerCase().includes('post')) {
            return 'Final';
        } else if (game.status.toLowerCase().includes('in')) {
            return `Q${game.period} - ${game.displayClock}`;
        }
        return game.startTime;
    }

    getWinner(game) {
        if (!game.status.toLowerCase().includes('post')) return null;
        
        if (game.homeTeam.score > game.awayTeam.score) {
            return 'home';
        } else if (game.awayTeam.score > game.homeTeam.score) {
            return 'away';
        }
        return 'tie';
    }

    // ============================================
    // STATISTICS
    // ============================================
    
    getStatsSnapshot() {
        const all = this.getAllGames();
        const live = this.getLiveGames();
        const scheduled = this.getScheduledGames();
        const final = this.getFinalGames();
        
        const sportStats = {};
        Object.keys(this.sportEndpoints).forEach(sport => {
            sportStats[sport] = this.getGamesBySport(sport).length;
        });
        
        return {
            totalGames: all.length,
            liveGames: live.length,
            scheduledGames: scheduled.length,
            finalGames: final.length,
            sportBreakdown: sportStats,
            lastUpdated: new Date()
        };
    }
}

// Export singleton instance
const liveScoresESPN = new LiveScoresESPNIntegration();
export { liveScoresESPN, LiveScoresESPNIntegration };
