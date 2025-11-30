/**
 * Player Props Marketplace System
 * Real-time player prop betting marketplace with live odds, trending props, and AI recommendations
 * Phase 25: Advanced Betting Features
 */

class PlayerPropsMarketplace {
    constructor() {
        this.props = new Map();
        this.filters = {
            sport: 'all', // all, nfl, nba, nhl, mlb
            league: 'all', // all, season, today
            market: 'all', // all, points, rebounds, assists, passing, goals, etc
            minOdds: -500,
            maxOdds: 500,
            trending: 'all' // all, up, down
        };
        this.subscribers = new Map();
        this.updateInterval = null;
        this.cache = new Map();
        this.trendingProps = [];
        this.userFavorites = new Set();
        
        // Market categories by sport
        this.marketsByCategory = {
            'NBA': [
                { id: 'points', label: 'Points', emoji: '🏀' },
                { id: 'rebounds', label: 'Rebounds', emoji: '↕️' },
                { id: 'assists', label: 'Assists', emoji: '🎯' },
                { id: 'three_pointers', label: '3-Pointers', emoji: '🎪' },
                { id: 'steals', label: 'Steals', emoji: '🛡️' },
                { id: 'blocks', label: 'Blocks', emoji: '🚫' },
                { id: 'turnovers', label: 'Turnovers', emoji: '🔄' }
            ],
            'NFL': [
                { id: 'passing_yards', label: 'Passing Yards', emoji: '📨' },
                { id: 'passing_touchdowns', label: 'Passing TDs', emoji: '🏈' },
                { id: 'rushing_yards', label: 'Rushing Yards', emoji: '🏃' },
                { id: 'rushing_touchdowns', label: 'Rushing TDs', emoji: '🏃‍♂️' },
                { id: 'receiving_yards', label: 'Receiving Yards', emoji: '🤝' },
                { id: 'receiving_touchdowns', label: 'Receiving TDs', emoji: '📥' },
                { id: 'receptions', label: 'Receptions', emoji: '✋' }
            ],
            'NHL': [
                { id: 'goals', label: 'Goals', emoji: '⚽' },
                { id: 'assists', label: 'Assists', emoji: '🎯' },
                { id: 'points', label: 'Points', emoji: '📍' },
                { id: 'shots', label: 'Shots', emoji: '🎯' },
                { id: 'hits', label: 'Hits', emoji: '💥' }
            ],
            'MLB': [
                { id: 'hits', label: 'Hits', emoji: '🎯' },
                { id: 'runs', label: 'Runs', emoji: '🏃' },
                { id: 'rbis', label: 'RBIs', emoji: '📊' },
                { id: 'strikeouts', label: 'Strikeouts', emoji: '⚡' },
                { id: 'home_runs', label: 'Home Runs', emoji: '🚀' }
            ]
        };
        
        console.log('✅ Player Props Marketplace initialized');
    }

    // ============================================
    // LOAD & CACHE PROPS
    // ============================================

    async loadMarketplaceData() {
        try {
            console.log('📊 Loading player props marketplace data...');
            
            // Generate realistic prop data
            this.generatePropData();
            
            console.log(`✅ Loaded ${this.props.size} player props`);
            this.notifySubscribers('dataLoaded', { count: this.props.size });
            
        } catch (error) {
            console.error('❌ Error loading marketplace data:', error);
            throw error;
        }
    }

    generatePropData() {
        // Sample player props data
        const propsList = [
            // NBA Props
            {
                id: 'prop-nba-001',
                sport: 'NBA',
                league: 'season',
                game: 'LAL vs GSW',
                team: 'Lakers',
                player: 'LeBron James',
                playerPosition: 'SF',
                playerStats: { season: 24.5, avg: 24.2, last5: 23.8 },
                market: 'points',
                prop: 'Over/Under 23.5',
                overOdds: -110,
                underOdds: -110,
                impliedOver: 52.4,
                impliedUnder: 52.4,
                movement: { direction: 'up', percentage: 2.5 },
                popularity: 8750,
                trending: true,
                aiConfidence: 68,
                recommendations: 'High volume shooter, plays heavy minutes',
                startTime: new Date(Date.now() + 3600000),
                liquidity: 'High',
                sportsbooks: ['FanDuel', 'DraftKings', 'BetMGM', 'Caesars']
            },
            {
                id: 'prop-nba-002',
                sport: 'NBA',
                league: 'season',
                game: 'LAL vs GSW',
                team: 'Warriors',
                player: 'Stephen Curry',
                playerPosition: 'PG',
                playerStats: { season: 28.4, avg: 28.1, last5: 29.2 },
                market: 'three_pointers',
                prop: 'Over/Under 3.5',
                overOdds: -115,
                underOdds: -105,
                impliedOver: 53.5,
                impliedUnder: 51.2,
                movement: { direction: 'down', percentage: 1.8 },
                popularity: 7220,
                trending: false,
                aiConfidence: 72,
                recommendations: 'Streak shooter, hot hand indicator',
                startTime: new Date(Date.now() + 3600000),
                liquidity: 'High',
                sportsbooks: ['FanDuel', 'DraftKings', 'Caesars']
            },
            {
                id: 'prop-nba-003',
                sport: 'NBA',
                league: 'today',
                game: 'Celtics vs Bucks',
                team: 'Celtics',
                player: 'Jayson Tatum',
                playerPosition: 'PF',
                playerStats: { season: 28.1, avg: 27.9, last5: 26.5 },
                market: 'rebounds',
                prop: 'Over/Under 8.5',
                overOdds: -110,
                underOdds: -110,
                impliedOver: 52.4,
                impliedUnder: 52.4,
                movement: { direction: 'up', percentage: 3.2 },
                popularity: 6540,
                trending: true,
                aiConfidence: 65,
                recommendations: 'Elite rebounder, facing strong interior defense',
                startTime: new Date(Date.now() + 7200000),
                liquidity: 'High',
                sportsbooks: ['FanDuel', 'DraftKings', 'BetMGM']
            },
            // NFL Props
            {
                id: 'prop-nfl-001',
                sport: 'NFL',
                league: 'today',
                game: 'KC vs Buffalo',
                team: 'Chiefs',
                player: 'Patrick Mahomes',
                playerPosition: 'QB',
                playerStats: { season: 290, avg: 288, last5: 295 },
                market: 'passing_yards',
                prop: 'Over/Under 285.5',
                overOdds: -110,
                underOdds: -110,
                impliedOver: 52.4,
                impliedUnder: 52.4,
                movement: { direction: 'up', percentage: 2.1 },
                popularity: 9820,
                trending: true,
                aiConfidence: 71,
                recommendations: 'Facing weak secondary, high pass volume expected',
                startTime: new Date(Date.now() + 14400000),
                liquidity: 'Very High',
                sportsbooks: ['FanDuel', 'DraftKings', 'BetMGM', 'Caesars', 'PointsBet']
            },
            {
                id: 'prop-nfl-002',
                sport: 'NFL',
                league: 'today',
                game: 'KC vs Buffalo',
                team: 'Bills',
                player: 'Josh Allen',
                playerPosition: 'QB',
                playerStats: { season: 268, avg: 265, last5: 272 },
                market: 'passing_touchdowns',
                prop: 'Over/Under 2.5',
                overOdds: -120,
                underOdds: -100,
                impliedOver: 54.5,
                impliedUnder: 50.3,
                movement: { direction: 'down', percentage: 1.5 },
                popularity: 7100,
                trending: false,
                aiConfidence: 58,
                recommendations: 'Strong defensive matchup, may limit TD opportunities',
                startTime: new Date(Date.now() + 14400000),
                liquidity: 'Very High',
                sportsbooks: ['FanDuel', 'DraftKings', 'Caesars']
            },
            {
                id: 'prop-nfl-003',
                sport: 'NFL',
                league: 'today',
                game: 'KC vs Buffalo',
                team: 'Chiefs',
                player: 'Travis Kelce',
                playerPosition: 'TE',
                playerStats: { season: 102, avg: 7.3, last5: 8.1 },
                market: 'receiving_yards',
                prop: 'Over/Under 87.5',
                overOdds: -110,
                underOdds: -110,
                impliedOver: 52.4,
                impliedUnder: 52.4,
                movement: { direction: 'up', percentage: 4.5 },
                popularity: 8340,
                trending: true,
                aiConfidence: 74,
                recommendations: 'Primary target, high touch expected in pass-heavy game',
                startTime: new Date(Date.now() + 14400000),
                liquidity: 'Very High',
                sportsbooks: ['FanDuel', 'DraftKings', 'BetMGM', 'Caesars']
            },
            // More diverse props across sports
            {
                id: 'prop-nhl-001',
                sport: 'NHL',
                league: 'today',
                game: 'Maple Leafs vs Lightning',
                team: 'Maple Leafs',
                player: 'Auston Matthews',
                playerPosition: 'C',
                playerStats: { season: 44, avg: 0.35, last5: 0.4 },
                market: 'goals',
                prop: 'Over/Under 0.5',
                overOdds: -165,
                underOdds: +140,
                impliedOver: 62.3,
                impliedUnder: 41.5,
                movement: { direction: 'up', percentage: 2.3 },
                popularity: 5420,
                trending: true,
                aiConfidence: 69,
                recommendations: 'Elite scorer vs solid defense',
                startTime: new Date(Date.now() + 21600000),
                liquidity: 'Medium',
                sportsbooks: ['FanDuel', 'DraftKings']
            },
            {
                id: 'prop-mlb-001',
                sport: 'MLB',
                league: 'today',
                game: 'Yankees vs Red Sox',
                team: 'Yankees',
                player: 'Juan Soto',
                playerPosition: 'OF',
                playerStats: { season: 153, avg: 3.9, last5: 4.1 },
                market: 'hits',
                prop: 'Over/Under 1.5',
                overOdds: -110,
                underOdds: -110,
                impliedOver: 52.4,
                impliedUnder: 52.4,
                movement: { direction: 'up', percentage: 1.2 },
                popularity: 4850,
                trending: false,
                aiConfidence: 66,
                recommendations: 'Hot streak recently, good park for hitting',
                startTime: new Date(Date.now() + 82800000),
                liquidity: 'Medium-High',
                sportsbooks: ['FanDuel', 'DraftKings']
            }
        ];

        // Add to props map
        propsList.forEach(prop => {
            this.props.set(prop.id, prop);
        });

        // Calculate trending
        this.updateTrendingProps();
    }

    updateTrendingProps() {
        this.trendingProps = Array.from(this.props.values())
            .filter(p => p.trending)
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 10);
    }

    // ============================================
    // FILTERING & SEARCH
    // ============================================

    getFilteredProps(filters = {}) {
        const activeFilters = { ...this.filters, ...filters };
        
        return Array.from(this.props.values()).filter(prop => {
            if (activeFilters.sport !== 'all' && prop.sport !== activeFilters.sport) return false;
            if (activeFilters.league !== 'all' && prop.league !== activeFilters.league) return false;
            if (activeFilters.market !== 'all' && prop.market !== activeFilters.market) return false;
            if (activeFilters.trending !== 'all') {
                if (activeFilters.trending === 'up' && prop.movement.direction !== 'up') return false;
                if (activeFilters.trending === 'down' && prop.movement.direction !== 'down') return false;
            }
            return true;
        });
    }

    searchProps(query) {
        const q = query.toLowerCase();
        return Array.from(this.props.values()).filter(prop => 
            prop.player.toLowerCase().includes(q) ||
            prop.team.toLowerCase().includes(q) ||
            prop.game.toLowerCase().includes(q) ||
            prop.market.toLowerCase().includes(q)
        );
    }

    // ============================================
    // ODDS COMPARISON
    // ============================================

    compareSportsbookOdds(propId) {
        const prop = this.props.get(propId);
        if (!prop) return null;

        // Simulate odds from different sportsbooks
        const bookmakerOdds = {
            'FanDuel': {
                over: prop.overOdds - (Math.random() * 10 - 5),
                under: prop.underOdds - (Math.random() * 10 - 5)
            },
            'DraftKings': {
                over: prop.overOdds + (Math.random() * 8 - 4),
                under: prop.underOdds + (Math.random() * 8 - 4)
            },
            'BetMGM': {
                over: prop.overOdds - (Math.random() * 6 - 3),
                under: prop.underOdds - (Math.random() * 6 - 3)
            },
            'Caesars': {
                over: prop.overOdds + (Math.random() * 7 - 3),
                under: prop.underOdds + (Math.random() * 7 - 3)
            }
        };

        return {
            propId,
            prop: prop.prop,
            bookmakerOdds,
            bestOver: Math.max(...Object.values(bookmakerOdds).map(b => b.over)),
            bestUnder: Math.max(...Object.values(bookmakerOdds).map(b => b.under))
        };
    }

    // ============================================
    // AI INSIGHTS
    // ============================================

    getAIInsight(propId) {
        const prop = this.props.get(propId);
        if (!prop) return null;

        const confidence = prop.aiConfidence;
        const confidenceLevel = confidence >= 70 ? 'High' : confidence >= 55 ? 'Medium' : 'Low';
        
        return {
            propId,
            confidence,
            confidenceLevel,
            recommendation: prop.recommendations,
            trend: prop.movement.direction === 'up' ? '📈 Climbing' : '📉 Falling',
            popularityTrend: prop.popularity > 5000 ? 'Very Popular' : 'Growing Interest',
            recentForm: this.getRecentForm(prop),
            matchupAnalysis: this.getMatchupAnalysis(prop)
        };
    }

    getRecentForm(prop) {
        const { season, avg, last5 } = prop.playerStats;
        if (last5 > avg) {
            return `🔥 Hot streak! Last 5 games avg: ${last5.toFixed(1)} vs season avg: ${avg.toFixed(1)}`;
        } else if (last5 < avg) {
            return `📉 Cooling off. Last 5 games avg: ${last5.toFixed(1)} vs season avg: ${avg.toFixed(1)}`;
        }
        return `📊 Playing to season average: ${avg.toFixed(1)}`;
    }

    getMatchupAnalysis(prop) {
        // Simulate matchup difficulty
        const matchupFactors = {
            'defense_rank': Math.floor(Math.random() * 32),
            'pace': Math.random() > 0.5 ? 'Fast' : 'Slow',
            'rest': Math.floor(Math.random() * 3),
            'injury_impact': Math.random() > 0.7 ? 'Key players out' : 'Full health'
        };
        
        return matchupFactors;
    }

    // ============================================
    // REAL-TIME UPDATES
    // ============================================

    startRealTimeUpdates() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        
        this.updateInterval = setInterval(() => {
            this.simulateOddsMovement();
        }, 3000); // Update every 3 seconds
        
        console.log('🔄 Real-time prop updates started');
    }

    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        console.log('⏸️ Real-time prop updates stopped');
    }

    simulateOddsMovement() {
        this.props.forEach((prop, propId) => {
            // Simulate random odds movement
            if (Math.random() > 0.8) {
                const changeAmount = (Math.random() - 0.5) * 4;
                prop.overOdds += changeAmount;
                prop.underOdds -= changeAmount;
                
                // Update movement direction
                if (Math.random() > 0.5) {
                    prop.movement.direction = 'up';
                    prop.movement.percentage += 0.5;
                } else {
                    prop.movement.direction = 'down';
                    prop.movement.percentage -= 0.5;
                }
                
                // Update popularity
                prop.popularity += Math.floor((Math.random() - 0.5) * 200);
                
                // Notify subscribers
                this.notifySubscribers('propUpdated', { propId, prop });
            }
        });
        
        this.updateTrendingProps();
    }

    // ============================================
    // FAVORITES
    // ============================================

    addToFavorites(propId) {
        this.userFavorites.add(propId);
        this.notifySubscribers('favoriteAdded', { propId });
        console.log(`⭐ Added ${propId} to favorites`);
    }

    removeFromFavorites(propId) {
        this.userFavorites.delete(propId);
        this.notifySubscribers('favoriteRemoved', { propId });
        console.log(`✖️ Removed ${propId} from favorites`);
    }

    isFavorite(propId) {
        return this.userFavorites.has(propId);
    }

    getFavorites() {
        return Array.from(this.userFavorites)
            .map(propId => this.props.get(propId))
            .filter(Boolean);
    }

    // ============================================
    // ALERTS & NOTIFICATIONS
    // ============================================

    createAlert(propId, config) {
        const alert = {
            id: `alert-${propId}-${Date.now()}`,
            propId,
            type: config.type, // 'odds_movement', 'price_target', 'steam'
            threshold: config.threshold,
            createdAt: new Date(),
            active: true
        };
        
        this.notifySubscribers('alertCreated', alert);
        console.log(`🔔 Alert created for ${propId}:`, alert);
        return alert;
    }

    // ============================================
    // SUBSCRIBERS
    // ============================================

    subscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        this.subscribers.get(event).push(callback);
        
        return () => {
            const callbacks = this.subscribers.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        };
    }

    notifySubscribers(event, data) {
        if (this.subscribers.has(event)) {
            this.subscribers.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in subscriber callback for ${event}:`, error);
                }
            });
        }
    }

    // ============================================
    // STATISTICS
    // ============================================

    getMarketplaceStats() {
        const props = Array.from(this.props.values());
        const sports = new Set(props.map(p => p.sport));
        const totalVolume = props.reduce((sum, p) => sum + p.popularity, 0);
        const trendingCount = props.filter(p => p.trending).length;
        
        return {
            totalProps: props.length,
            sports: Array.from(sports),
            totalVolume,
            averagePopularity: (totalVolume / props.length).toFixed(0),
            trendingCount,
            highLiquidityProps: props.filter(p => p.liquidity === 'Very High').length
        };
    }

    getPlayerStats(playerName) {
        const playerProps = Array.from(this.props.values())
            .filter(p => p.player.toLowerCase().includes(playerName.toLowerCase()));
        
        return {
            player: playerName,
            propsCount: playerProps.length,
            props: playerProps,
            avgConfidence: (playerProps.reduce((sum, p) => sum + p.aiConfidence, 0) / playerProps.length).toFixed(1)
        };
    }

    // ============================================
    // EXPORT & IMPORT
    // ============================================

    exportSlip(propIds) {
        const selectedProps = propIds
            .map(id => this.props.get(id))
            .filter(Boolean);
        
        return {
            exportedAt: new Date().toISOString(),
            props: selectedProps,
            totalOdds: this.calculateParlay(selectedProps)
        };
    }

    calculateParlay(props) {
        // Simple parlay calculation
        return props.reduce((total, prop) => {
            const odds = Math.random() > 0.5 ? prop.overOdds : prop.underOdds;
            return total * (odds / 100 + 1);
        }, 1);
    }
}

// Export singleton
export const playerPropsMarketplace = new PlayerPropsMarketplace();
export { PlayerPropsMarketplace };
