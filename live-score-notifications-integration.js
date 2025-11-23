/**
 * Live Score Notifications Integration
 * Connects live score system with push notifications
 */

import { liveScoreSystem } from './live-score-system.js';
import { pushNotificationSystem } from './push-notification-system.js';

export class LiveScoreNotificationsIntegration {
    constructor() {
        this.init();
    }

    init() {
        // Subscribe to all live score events
        this.subscribeToScoreUpdates();
        this.subscribeToStatusChanges();
        this.subscribeToPlayUpdates();
    }

    // ============================================
    // SCORE UPDATE NOTIFICATIONS
    // ============================================

    subscribeToScoreUpdates() {
        // Listen for score updates from any game
        document.addEventListener('livescore:update', (event) => {
            const { type, game, data } = event.detail;

            if (type === 'score_update') {
                this.handleScoreUpdate(game, data);
            }
        });

        // Alternative: Subscribe to specific games
        // const liveGames = liveScoreSystem.getLiveGames();
        // liveGames.forEach(game => {
        //     liveScoreSystem.subscribe(game.id, (data) => {
        //         this.handleGameUpdate(data);
        //     });
        // });
    }

    handleScoreUpdate(game, data) {
        const { homePoints, awayPoints, scoringTeam } = data;
        
        if (homePoints > 0) {
            pushNotificationSystem.notifyScoreUpdate(game, {
                team: 'home',
                points: homePoints,
                newScore: game.homeTeam.score
            });
        }

        if (awayPoints > 0) {
            pushNotificationSystem.notifyScoreUpdate(game, {
                team: 'away',
                points: awayPoints,
                newScore: game.awayTeam.score
            });
        }

        // Check if it's a close game
        this.checkCloseGame(game);
    }

    checkCloseGame(game) {
        const diff = Math.abs(game.homeTeam.score - game.awayTeam.score);
        
        // Notify if game becomes close in final period
        if (game.period === 'Q4' || game.period === '4th' || game.period.includes('OT')) {
            if (diff <= 5 && diff > 0) {
                // Only notify once per game for close game status
                const notifiedKey = `close-game-${game.id}`;
                if (!sessionStorage.getItem(notifiedKey)) {
                    pushNotificationSystem.notifyCloseGame(game);
                    sessionStorage.setItem(notifiedKey, 'true');
                }
            }
        }
    }

    // ============================================
    // STATUS CHANGE NOTIFICATIONS
    // ============================================

    subscribeToStatusChanges() {
        document.addEventListener('livescore:update', (event) => {
            const { type, game } = event.detail;

            if (type === 'status_change') {
                this.handleStatusChange(game);
            }
        });
    }

    handleStatusChange(game) {
        switch (game.status) {
            case 'live':
                pushNotificationSystem.notifyGameStart(game);
                break;
            
            case 'final':
                pushNotificationSystem.notifyGameEnd(game);
                break;
            
            case 'halftime':
            case 'quarter_end':
                pushNotificationSystem.notifyQuarterEnd(game);
                break;
        }
    }

    // ============================================
    // PLAY UPDATE NOTIFICATIONS
    // ============================================

    subscribeToPlayUpdates() {
        document.addEventListener('livescore:update', (event) => {
            const { type, game, data } = event.detail;

            if (type === 'play_update') {
                this.handlePlayUpdate(game, data);
            }
        });
    }

    handlePlayUpdate(game, data) {
        // Check if it's a big play
        if (this.isBigPlay(data)) {
            pushNotificationSystem.notifyBigPlay(game, data);
        }
    }

    isBigPlay(playData) {
        const bigPlayKeywords = [
            'dunk', 'slam', 'alley-oop', '3-pointer',
            'steal', 'block', 'buzzer', 'clutch',
            'game-winning', 'overtime'
        ];

        const playText = playData.description?.toLowerCase() || '';
        return bigPlayKeywords.some(keyword => playText.includes(keyword));
    }

    // ============================================
    // MANUAL NOTIFICATIONS
    // ============================================

    notifyGameStarting(gameId, minutesUntilStart) {
        const game = liveScoreSystem.getGameById(gameId);
        if (!game) return;

        pushNotificationSystem.sendNotification({
            title: `⏰ Game Starting Soon`,
            body: `${game.awayTeam.shortName} @ ${game.homeTeam.shortName} starts in ${minutesUntilStart} minutes`,
            tag: `starting-${gameId}`,
            icon: '⏰',
            data: {
                type: 'game_starting',
                gameId: gameId,
                action: 'view_game'
            }
        });
    }

    notifyUpsetAlert(game) {
        const underdog = game.awayTeam.score > game.homeTeam.score ? 
            game.awayTeam.shortName : game.homeTeam.shortName;

        pushNotificationSystem.sendNotification({
            title: `🚨 Upset Alert!`,
            body: `${underdog} is pulling off an upset!`,
            tag: `upset-${game.id}`,
            icon: '🚨',
            requireInteraction: true,
            data: {
                type: 'upset',
                gameId: game.id,
                action: 'view_game'
            }
        });
    }
}

// Create singleton instance
export const liveScoreNotificationsIntegration = new LiveScoreNotificationsIntegration();
