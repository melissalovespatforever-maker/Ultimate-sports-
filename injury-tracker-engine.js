// ============================================
// INJURY TRACKER ENGINE
// Real-time player injury status and updates
// ============================================

import { sportsDataAPI } from './api-service.js';

class InjuryTrackerEngine {
    constructor() {
        this.injuries = [];
        this.updateInterval = null;
        this.isTracking = false;
        
        // Injury severity levels
        this.severityLevels = {
            'OUT': { color: '#ef4444', priority: 1, description: 'Will not play' },
            'DOUBTFUL': { color: '#f97316', priority: 2, description: 'Unlikely to play' },
            'QUESTIONABLE': { color: '#f59e0b', priority: 3, description: 'Game-time decision' },
            'PROBABLE': { color: '#fbbf24', priority: 4, description: 'Likely to play' },
            'DAY_TO_DAY': { color: '#3b82f6', priority: 5, description: 'Day-to-day status' },
            'HEALTHY': { color: '#10b981', priority: 6, description: 'Active' }
        };
        
        // Position abbreviations by sport
        this.positions = {
            NBA: ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F'],
            NFL: ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'],
            MLB: ['P', 'C', '1B', '2B', '3B', 'SS', 'OF', 'DH'],
            NHL: ['C', 'LW', 'RW', 'D', 'G']
        };
        
        // Event system
        this.listeners = {
            'injury_added': [],
            'injury_updated': [],
            'injury_resolved': [],
            'status_changed': []
        };
        
        this.loadFromStorage();
    }

    // ============================================
    // INJURY DATA FETCHING
    // ============================================

    /**
     * Fetch injuries for a specific sport
     * @param {string} sport - Sport name (basketball, football, etc.)
     * @param {string} league - League name (nba, nfl, etc.)
     * @returns {Promise<Array>} Array of injuries
     */
    async fetchInjuries(sport = 'basketball', league = 'nba') {
        try {
            console.log(`🏥 Fetching ${league.toUpperCase()} injuries...`);
            
            // ESPN has a teams endpoint, we'll fetch and parse injuries from there
            const injuries = await this.fetchESPNInjuries(sport, league);
            
            if (injuries && injuries.length > 0) {
                console.log(`✅ Found ${injuries.length} injuries`);
                this.updateInjuryList(injuries);
                return injuries;
            }
            
            // Fallback to demo data
            return this.getDemoInjuries(league.toUpperCase());
        } catch (error) {
            console.error('❌ Error fetching injuries:', error);
            return this.getDemoInjuries(league.toUpperCase());
        }
    }

    /**
     * Fetch injuries from ESPN API
     */
    async fetchESPNInjuries(sport, league) {
        try {
            // First get all teams
            const teamsUrl = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`;
            const teamsResponse = await fetch(teamsUrl);
            
            if (!teamsResponse.ok) {
                throw new Error(`ESPN Teams API Error: ${teamsResponse.status}`);
            }
            
            const teamsData = await teamsResponse.json();
            const teams = teamsData.sports?.[0]?.leagues?.[0]?.teams || [];
            
            const allInjuries = [];
            
            // For each team, fetch roster and check for injuries
            for (const teamObj of teams.slice(0, 10)) { // Limit to 10 teams to avoid too many requests
                const team = teamObj.team;
                try {
                    const rosterUrl = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team.id}/roster`;
                    const rosterResponse = await fetch(rosterUrl);
                    
                    if (!rosterResponse.ok) continue;
                    
                    const rosterData = await rosterResponse.json();
                    const athletes = rosterData.athletes || [];
                    
                    // Parse each athlete for injury status
                    athletes.forEach(group => {
                        group.items?.forEach(athlete => {
                            if (athlete.injuries && athlete.injuries.length > 0) {
                                athlete.injuries.forEach(injury => {
                                    allInjuries.push({
                                        id: `${team.id}-${athlete.id}-${Date.now()}`,
                                        playerId: athlete.id,
                                        playerName: athlete.fullName,
                                        team: team.displayName,
                                        teamId: team.id,
                                        teamAbbr: team.abbreviation,
                                        position: athlete.position?.abbreviation || 'N/A',
                                        sport: league.toUpperCase(),
                                        injuryType: injury.type || 'Unknown',
                                        status: this.normalizeStatus(injury.status),
                                        details: injury.details || injury.longComment || 'No details available',
                                        date: injury.date || new Date().toISOString(),
                                        returnDate: this.estimateReturnDate(injury),
                                        severity: this.calculateSeverity(injury),
                                        lastUpdate: new Date().toISOString()
                                    });
                                });
                            }
                        });
                    });
                } catch (err) {
                    console.warn(`Failed to fetch roster for ${team.displayName}:`, err);
                }
            }
            
            return allInjuries;
        } catch (error) {
            console.error('Error fetching ESPN injuries:', error);
            return [];
        }
    }

    /**
     * Fetch injuries for multiple sports
     */
    async fetchAllSportsInjuries() {
        const sports = [
            { sport: 'basketball', league: 'nba' },
            { sport: 'football', league: 'nfl' },
            { sport: 'baseball', league: 'mlb' },
            { sport: 'hockey', league: 'nhl' }
        ];

        const allInjuries = [];

        for (const { sport, league } of sports) {
            try {
                const injuries = await this.fetchInjuries(sport, league);
                allInjuries.push(...injuries);
            } catch (error) {
                console.warn(`Failed to fetch ${league} injuries:`, error);
            }
        }

        return allInjuries;
    }

    // ============================================
    // INJURY MANAGEMENT
    // ============================================

    updateInjuryList(newInjuries) {
        newInjuries.forEach(newInjury => {
            const existingIndex = this.injuries.findIndex(
                inj => inj.playerId === newInjury.playerId && inj.teamId === newInjury.teamId
            );

            if (existingIndex >= 0) {
                // Update existing injury
                const oldInjury = this.injuries[existingIndex];
                
                if (oldInjury.status !== newInjury.status) {
                    this.emit('status_changed', { old: oldInjury, new: newInjury });
                }
                
                this.injuries[existingIndex] = newInjury;
                this.emit('injury_updated', newInjury);
            } else {
                // Add new injury
                this.injuries.push(newInjury);
                this.emit('injury_added', newInjury);
            }
        });

        // Check for resolved injuries
        this.checkResolvedInjuries(newInjuries);

        this.saveToStorage();
    }

    checkResolvedInjuries(currentInjuries) {
        const currentPlayerIds = new Set(currentInjuries.map(inj => `${inj.playerId}-${inj.teamId}`));
        
        this.injuries = this.injuries.filter(injury => {
            const key = `${injury.playerId}-${injury.teamId}`;
            if (!currentPlayerIds.has(key)) {
                this.emit('injury_resolved', injury);
                return false;
            }
            return true;
        });
    }

    // ============================================
    // FILTERING & QUERYING
    // ============================================

    getInjuriesBySport(sport) {
        return this.injuries.filter(inj => inj.sport === sport.toUpperCase());
    }

    getInjuriesByTeam(teamName) {
        return this.injuries.filter(inj => 
            inj.team.toLowerCase().includes(teamName.toLowerCase())
        );
    }

    getInjuriesByStatus(status) {
        return this.injuries.filter(inj => inj.status === status);
    }

    getCriticalInjuries() {
        return this.injuries.filter(inj => 
            ['OUT', 'DOUBTFUL'].includes(inj.status)
        );
    }

    getInjuriesByPosition(sport, position) {
        return this.injuries.filter(inj => 
            inj.sport === sport.toUpperCase() && 
            inj.position === position
        );
    }

    searchInjuries(query) {
        const lowerQuery = query.toLowerCase();
        return this.injuries.filter(inj =>
            inj.playerName.toLowerCase().includes(lowerQuery) ||
            inj.team.toLowerCase().includes(lowerQuery) ||
            inj.injuryType.toLowerCase().includes(lowerQuery)
        );
    }

    // ============================================
    // IMPACT ANALYSIS
    // ============================================

    analyzeTeamImpact(teamName) {
        const teamInjuries = this.getInjuriesByTeam(teamName);
        
        const analysis = {
            totalInjuries: teamInjuries.length,
            out: teamInjuries.filter(i => i.status === 'OUT').length,
            doubtful: teamInjuries.filter(i => i.status === 'DOUBTFUL').length,
            questionable: teamInjuries.filter(i => i.status === 'QUESTIONABLE').length,
            impactScore: this.calculateImpactScore(teamInjuries),
            impactLevel: 'Low',
            keyPlayers: teamInjuries.filter(i => i.severity <= 2)
        };

        // Determine impact level
        if (analysis.impactScore >= 80) {
            analysis.impactLevel = 'Critical';
        } else if (analysis.impactScore >= 60) {
            analysis.impactLevel = 'High';
        } else if (analysis.impactScore >= 40) {
            analysis.impactLevel = 'Moderate';
        } else if (analysis.impactScore >= 20) {
            analysis.impactLevel = 'Low';
        } else {
            analysis.impactLevel = 'Minimal';
        }

        return analysis;
    }

    calculateImpactScore(injuries) {
        let score = 0;
        
        injuries.forEach(injury => {
            // Base score by status
            const statusScore = {
                'OUT': 25,
                'DOUBTFUL': 20,
                'QUESTIONABLE': 15,
                'PROBABLE': 10,
                'DAY_TO_DAY': 5
            };
            
            score += statusScore[injury.status] || 0;
            
            // Bonus for key positions
            const keyPositions = ['QB', 'PG', 'P', 'G']; // Quarterback, Point Guard, Pitcher, Goalie
            if (keyPositions.includes(injury.position)) {
                score += 15;
            }
        });

        return Math.min(score, 100); // Cap at 100
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    normalizeStatus(status) {
        if (!status) return 'DAY_TO_DAY';
        
        const normalized = status.toUpperCase().replace(/\s+/g, '_');
        
        if (normalized.includes('OUT')) return 'OUT';
        if (normalized.includes('DOUBTFUL')) return 'DOUBTFUL';
        if (normalized.includes('QUESTIONABLE')) return 'QUESTIONABLE';
        if (normalized.includes('PROBABLE')) return 'PROBABLE';
        if (normalized.includes('DAY')) return 'DAY_TO_DAY';
        
        return 'DAY_TO_DAY';
    }

    calculateSeverity(injury) {
        const status = this.normalizeStatus(injury.status);
        return this.severityLevels[status]?.priority || 5;
    }

    estimateReturnDate(injury) {
        // Try to parse return date from details
        if (injury.details) {
            const weekMatch = injury.details.match(/(\d+)[\s-]*(week|wk)/i);
            if (weekMatch) {
                const weeks = parseInt(weekMatch[1]);
                const returnDate = new Date();
                returnDate.setDate(returnDate.getDate() + (weeks * 7));
                return returnDate.toISOString();
            }
            
            const monthMatch = injury.details.match(/(\d+)[\s-]*(month|mo)/i);
            if (monthMatch) {
                const months = parseInt(monthMatch[1]);
                const returnDate = new Date();
                returnDate.setMonth(returnDate.getMonth() + months);
                return returnDate.toISOString();
            }
        }
        
        // Default estimates by status
        const status = this.normalizeStatus(injury.status);
        const returnDate = new Date();
        
        switch (status) {
            case 'OUT':
                returnDate.setDate(returnDate.getDate() + 14); // 2 weeks
                break;
            case 'DOUBTFUL':
                returnDate.setDate(returnDate.getDate() + 7); // 1 week
                break;
            case 'QUESTIONABLE':
                returnDate.setDate(returnDate.getDate() + 3); // 3 days
                break;
            case 'PROBABLE':
                returnDate.setDate(returnDate.getDate() + 1); // 1 day
                break;
            default:
                returnDate.setDate(returnDate.getDate() + 7);
        }
        
        return returnDate.toISOString();
    }

    // ============================================
    // AUTO-UPDATE
    // ============================================

    startAutoUpdate(intervalMinutes = 30) {
        if (this.isTracking) return;
        
        this.isTracking = true;
        
        // Initial fetch
        this.fetchAllSportsInjuries();
        
        // Set up interval
        this.updateInterval = setInterval(() => {
            console.log('🔄 Auto-updating injury data...');
            this.fetchAllSportsInjuries();
        }, intervalMinutes * 60 * 1000);
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isTracking = false;
    }

    // ============================================
    // STATISTICS
    // ============================================

    getStatistics() {
        const stats = {
            total: this.injuries.length,
            bySport: {},
            byStatus: {},
            byPosition: {},
            critical: this.getCriticalInjuries().length,
            lastUpdate: this.injuries.length > 0 ? 
                Math.max(...this.injuries.map(i => new Date(i.lastUpdate).getTime())) : null
        };

        // Count by sport
        this.injuries.forEach(inj => {
            stats.bySport[inj.sport] = (stats.bySport[inj.sport] || 0) + 1;
            stats.byStatus[inj.status] = (stats.byStatus[inj.status] || 0) + 1;
            stats.byPosition[inj.position] = (stats.byPosition[inj.position] || 0) + 1;
        });

        return stats;
    }

    // ============================================
    // DEMO DATA
    // ============================================

    getDemoInjuries(sport = 'NBA') {
        console.warn('⚠️ Using demo injury data');
        
        const demoData = {
            NBA: [
                {
                    id: 'demo-nba-1',
                    playerId: 'demo-1',
                    playerName: 'LeBron James',
                    team: 'Los Angeles Lakers',
                    teamId: 'lal',
                    teamAbbr: 'LAL',
                    position: 'SF',
                    sport: 'NBA',
                    injuryType: 'Ankle',
                    status: 'QUESTIONABLE',
                    details: 'Sprained left ankle. Game-time decision.',
                    date: new Date().toISOString(),
                    returnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                    severity: 3,
                    lastUpdate: new Date().toISOString()
                },
                {
                    id: 'demo-nba-2',
                    playerId: 'demo-2',
                    playerName: 'Stephen Curry',
                    team: 'Golden State Warriors',
                    teamId: 'gsw',
                    teamAbbr: 'GSW',
                    position: 'PG',
                    sport: 'NBA',
                    injuryType: 'Shoulder',
                    status: 'OUT',
                    details: 'Right shoulder strain. Expected to miss 2 weeks.',
                    date: new Date().toISOString(),
                    returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    severity: 1,
                    lastUpdate: new Date().toISOString()
                }
            ],
            NFL: [
                {
                    id: 'demo-nfl-1',
                    playerId: 'demo-3',
                    playerName: 'Patrick Mahomes',
                    team: 'Kansas City Chiefs',
                    teamId: 'kc',
                    teamAbbr: 'KC',
                    position: 'QB',
                    sport: 'NFL',
                    injuryType: 'Ankle',
                    status: 'PROBABLE',
                    details: 'High ankle sprain. Expected to play.',
                    date: new Date().toISOString(),
                    returnDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                    severity: 4,
                    lastUpdate: new Date().toISOString()
                }
            ]
        };

        return demoData[sport] || [];
    }

    // ============================================
    // EVENT SYSTEM
    // ============================================

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    // ============================================
    // PERSISTENCE
    // ============================================

    saveToStorage() {
        try {
            localStorage.setItem('injury_tracker_data', JSON.stringify({
                injuries: this.injuries,
                lastUpdate: new Date().toISOString()
            }));
        } catch (e) {
            console.warn('Failed to save injuries to storage:', e);
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('injury_tracker_data');
            if (stored) {
                const data = JSON.parse(stored);
                this.injuries = data.injuries || [];
                console.log(`📦 Loaded ${this.injuries.length} cached injuries`);
            }
        } catch (e) {
            console.warn('Failed to load injuries from storage:', e);
        }
    }

    clearStorage() {
        this.injuries = [];
        localStorage.removeItem('injury_tracker_data');
    }

    // ============================================
    // GETTERS
    // ============================================

    getAllInjuries() {
        return [...this.injuries];
    }

    getInjuryById(id) {
        return this.injuries.find(inj => inj.id === id);
    }
}

// Singleton instance
export const injuryTracker = new InjuryTrackerEngine();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.injuryTracker = injuryTracker;
}
