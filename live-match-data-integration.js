// ============================================
// LIVE MATCH DATA INTEGRATION
// Connects real sports data to notification system
// ============================================

import { sportsDataAPI } from './sports-data-api.js';
import { liveGameUpdates } from './live-game-updates.js';
import { liveMatchNotifications } from './live-match-notifications.js';

export class LiveMatchDataIntegration {
    constructor() {
        this.trackedGames = new Map(); // gameId -> tracking data
        this.updateInterval = 15000; // 15 seconds for live updates
        this.intervalId = null;
        this.isActive = false;
        
        this.init();
    }

    init() {
        console.log('🔗 Live Match Data Integration initialized');
        
        // Listen for game subscriptions from notification system
        window.addEventListener('liveMatchSubscribe', (e) => {
            this.startTrackingGame(e.detail);
        });
        
        window.addEventListener('liveMatchUnsubscribe', (e) => {
            this.stopTrackingGame(e.detail);
        });
        
        // Start monitoring live games
        this.startLiveMonitoring();
    }

    // ============================================
    // GAME TRACKING
    // ============================================

    startTrackingGame(gameData) {
        const { gameId } = gameData;
        
        if (this.trackedGames.has(gameId)) {
            return; // Already tracking
        }

        this.trackedGames.set(gameId, {
            ...gameData,
            lastUpdate: null,
            lastScore: null,
            lastQuarter: null,
            playByPlayHash: null
        });

        console.log(`📊 Started tracking game: ${gameId}`);

        // Subscribe to live game updates
        if (liveGameUpdates) {
            liveGameUpdates.subscribe(gameId, (update) => {
                this.handleGameUpdate(gameId, update);
            });
        }

        // Trigger immediate update
        this.fetchGameUpdate(gameId);

        // Dispatch event for UI
        window.dispatchEvent(new CustomEvent('gameTrackingStarted', {
            detail: { gameId }
        }));
    }

    stopTrackingGame(gameId) {
        if (!this.trackedGames.has(gameId)) {
            return;
        }

        this.trackedGames.delete(gameId);
        console.log(`📊 Stopped tracking game: ${gameId}`);

        // Unsubscribe from live updates
        if (liveGameUpdates) {
            liveGameUpdates.unsubscribe(gameId);
        }

        // Dispatch event for UI
        window.dispatchEvent(new CustomEvent('gameTrackingStopped', {
            detail: { gameId }
        }));
    }

    // ============================================
    // LIVE MONITORING
    // ============================================

    startLiveMonitoring() {
        if (this.isActive) return;

        this.isActive = true;
        
        // Update all tracked games periodically
        this.intervalId = setInterval(() => {
            this.updateAllTrackedGames();
        }, this.updateInterval);

        console.log('🔄 Live monitoring started');
    }

    stopLiveMonitoring() {
        if (!this.isActive) return;

        this.isActive = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        console.log('⏸️ Live monitoring stopped');
    }

    async updateAllTrackedGames() {
        if (this.trackedGames.size === 0) return;

        const promises = [];
        
        for (const [gameId] of this.trackedGames) {
            promises.push(this.fetchGameUpdate(gameId));
        }

        await Promise.allSettled(promises);
    }

    async fetchGameUpdate(gameId) {
        const gameData = this.trackedGames.get(gameId);
        if (!gameData) return;

        try {
            // Fetch live game details from API
            const liveData = await sportsDataAPI.getGameDetails(gameId);
            
            if (!liveData) return;

            // Detect changes and send notifications
            this.detectAndNotifyChanges(gameId, gameData, liveData);

            // Update tracked data
            gameData.lastUpdate = Date.now();
            gameData.lastScore = liveData.score;
            gameData.lastQuarter = liveData.quarter;

        } catch (error) {
            console.error(`Failed to fetch update for game ${gameId}:`, error);
        }
    }

    // ============================================
    // CHANGE DETECTION & NOTIFICATIONS
    // ============================================

    detectAndNotifyChanges(gameId, oldData, newData) {
        // Score changes
        if (this.hasScoreChanged(oldData, newData)) {
            this.notifyScoreUpdate(gameId, oldData, newData);
        }

        // Quarter/period changes
        if (this.hasQuarterChanged(oldData, newData)) {
            this.notifyPeriodChange(gameId, oldData, newData);
        }

        // Game status changes
        if (this.hasGameEnded(oldData, newData)) {
            this.notifyGameEnd(gameId, oldData, newData);
        }

        // Key plays
        if (newData.lastPlay && this.isKeyPlay(newData.lastPlay)) {
            this.notifyKeyPlay(gameId, oldData, newData);
        }

        // Injuries
        if (newData.injuries && newData.injuries.length > 0) {
            this.notifyInjuries(gameId, oldData, newData);
        }

        // Momentum detection
        if (this.hasMomentumShift(oldData, newData)) {
            this.notifyMomentumShift(gameId, oldData, newData);
        }
    }

    hasScoreChanged(oldData, newData) {
        if (!oldData.lastScore || !newData.score) return false;
        
        return oldData.lastScore.home !== newData.score.home ||
               oldData.lastScore.away !== newData.score.away;
    }

    hasQuarterChanged(oldData, newData) {
        return oldData.lastQuarter && 
               oldData.lastQuarter !== newData.quarter;
    }

    hasGameEnded(oldData, newData) {
        return newData.status === 'final' && 
               (!oldData.lastStatus || oldData.lastStatus !== 'final');
    }

    isKeyPlay(play) {
        if (!play || !play.description) return false;

        const keyTerms = [
            'touchdown', 'goal', 'three-point', '3-pointer',
            'home run', 'grand slam', 'penalty',
            'interception', 'sack', 'turnover',
            'steal', 'block', 'dunk'
        ];

        const desc = play.description.toLowerCase();
        return keyTerms.some(term => desc.includes(term));
    }

    hasMomentumShift(oldData, newData) {
        if (!oldData.lastScore || !newData.score) return false;

        // Calculate point differential change
        const oldDiff = oldData.lastScore.home - oldData.lastScore.away;
        const newDiff = newData.score.home - newData.score.away;
        
        // Significant shift if differential changes by 10+ points
        return Math.abs(newDiff - oldDiff) >= 10;
    }

    // ============================================
    // NOTIFICATION DISPATCH
    // ============================================

    notifyScoreUpdate(gameId, oldData, newData) {
        liveMatchNotifications.handleScoreUpdate({
            gameId,
            score: newData.score,
            quarter: newData.quarter,
            clock: newData.clock,
            homeTeam: oldData.homeTeam,
            awayTeam: oldData.awayTeam
        });
    }

    notifyPeriodChange(gameId, oldData, newData) {
        // Can add specific period change notification if desired
        console.log(`Period changed for ${gameId}: Q${newData.quarter}`);
    }

    notifyGameEnd(gameId, oldData, newData) {
        const winner = newData.score.home > newData.score.away 
            ? oldData.homeTeam 
            : oldData.awayTeam;

        liveMatchNotifications.handleGameEnd({
            gameId,
            finalScore: newData.score,
            winner,
            homeTeam: oldData.homeTeam,
            awayTeam: oldData.awayTeam,
            duration: newData.duration || this.calculateDuration(newData)
        });

        // Stop tracking this game
        this.stopTrackingGame(gameId);
    }

    notifyKeyPlay(gameId, oldData, newData) {
        const play = newData.lastPlay;

        liveMatchNotifications.handleKeyPlay({
            gameId,
            play: {
                type: this.classifyPlayType(play),
                description: play.description,
                time: newData.clock || play.time
            },
            team: play.team || 'home',
            homeTeam: oldData.homeTeam,
            awayTeam: oldData.awayTeam
        });
    }

    notifyInjuries(gameId, oldData, newData) {
        // Check for new injuries
        const oldInjuries = oldData.lastInjuries || [];
        const newInjuries = newData.injuries || [];

        newInjuries.forEach(injury => {
            if (!oldInjuries.find(i => i.player === injury.player)) {
                liveMatchNotifications.handleInjury({
                    gameId,
                    player: injury.player,
                    team: injury.team,
                    severity: injury.severity || 'minor',
                    homeTeam: oldData.homeTeam,
                    awayTeam: oldData.awayTeam
                });
            }
        });

        oldData.lastInjuries = newInjuries;
    }

    notifyMomentumShift(gameId, oldData, newData) {
        const oldDiff = oldData.lastScore.home - oldData.lastScore.away;
        const newDiff = newData.score.home - newData.score.away;
        
        const team = newDiff > oldDiff ? 'home' : 'away';
        const strength = Math.abs(newDiff - oldDiff) >= 15 ? 'strong' : 'moderate';

        liveMatchNotifications.handleMomentumChange({
            gameId,
            team,
            strength,
            homeTeam: oldData.homeTeam,
            awayTeam: oldData.awayTeam
        });
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    classifyPlayType(play) {
        if (!play || !play.description) return 'play';

        const desc = play.description.toLowerCase();

        if (desc.includes('touchdown')) return 'touchdown';
        if (desc.includes('goal') || desc.includes('score')) return 'goal';
        if (desc.includes('three-point') || desc.includes('3-pointer')) return 'three-pointer';
        if (desc.includes('home run')) return 'homerun';
        if (desc.includes('penalty')) return 'penalty';
        if (desc.includes('interception')) return 'interception';
        if (desc.includes('sack')) return 'sack';
        if (desc.includes('steal')) return 'steal';
        if (desc.includes('block')) return 'block';
        if (desc.includes('dunk')) return 'dunk';

        return 'play';
    }

    calculateDuration(gameData) {
        // Estimate game duration based on sport
        const durations = {
            'NBA': '2:30:00',
            'NFL': '3:15:00',
            'MLB': '3:00:00',
            'NHL': '2:30:00',
            'Soccer': '2:00:00'
        };

        return durations[gameData.sport] || '2:30:00';
    }

    // ============================================
    // PUBLIC API
    // ============================================

    getTrackedGames() {
        return Array.from(this.trackedGames.values());
    }

    isTrackingGame(gameId) {
        return this.trackedGames.has(gameId);
    }

    getGameData(gameId) {
        return this.trackedGames.get(gameId);
    }

    forceUpdate(gameId) {
        return this.fetchGameUpdate(gameId);
    }

    // ============================================
    // CLEANUP
    // ============================================

    destroy() {
        this.stopLiveMonitoring();
        this.trackedGames.clear();
        console.log('🗑️ Live Match Data Integration destroyed');
    }
}

// Export singleton instance
export const liveMatchDataIntegration = new LiveMatchDataIntegration();
