// ============================================
// LIVE MATCH NOTIFICATIONS UI
// Visual display for real-time match updates
// ============================================

import { liveMatchNotifications } from './live-match-notifications.js';

export class LiveMatchNotificationsUI {
    constructor() {
        this.container = null;
        this.isOpen = false;
        this.activeMatches = new Map(); // gameId -> match UI element
        this.floatingWidget = null;
        
        this.init();
    }

    init() {
        console.log('🎨 Live Match Notifications UI initializing...');
        
        // Create floating widget
        this.createFloatingWidget();
        
        // Create modal container
        this.createModalContainer();
        
        // Listen for notifications
        window.addEventListener('liveMatchNotification', (e) => {
            this.handleNotification(e.detail);
        });
        
        // Listen for game subscriptions
        window.addEventListener('liveMatchSubscribe', (e) => {
            this.addMatchWidget(e.detail);
        });
        
        window.addEventListener('liveMatchUnsubscribe', (e) => {
            this.removeMatchWidget(e.detail);
        });
    }

    // ============================================
    // FLOATING WIDGET
    // ============================================

    createFloatingWidget() {
        this.floatingWidget = document.createElement('div');
        this.floatingWidget.className = 'live-match-floating-widget';
        this.floatingWidget.innerHTML = `
            <div class="widget-header">
                <span class="widget-title">
                    <span class="widget-icon">🔴</span>
                    Live Matches
                    <span class="widget-count">(0)</span>
                </span>
                <div class="widget-actions">
                    <button class="widget-btn widget-settings" title="Settings">
                        ⚙️
                    </button>
                    <button class="widget-btn widget-toggle" title="Toggle">
                        ▼
                    </button>
                </div>
            </div>
            <div class="widget-content">
                <div class="widget-matches"></div>
                <div class="widget-empty-state">
                    No live matches yet
                </div>
            </div>
        `;
        
        document.body.appendChild(this.floatingWidget);
        
        // Add styles
        this.addStyles();
        
        // Add event listeners
        this.floatingWidget.querySelector('.widget-settings').addEventListener('click', () => {
            this.showPreferencesModal();
        });
        
        this.floatingWidget.querySelector('.widget-toggle').addEventListener('click', () => {
            this.toggleWidget();
        });
    }

    toggleWidget() {
        const content = this.floatingWidget.querySelector('.widget-content');
        this.isOpen = !this.isOpen;
        content.style.display = this.isOpen ? 'block' : 'none';
    }

    addMatchWidget(matchData) {
        const { gameId, homeTeam, awayTeam, sport } = matchData;
        
        const matchEl = document.createElement('div');
        matchEl.className = 'widget-match';
        matchEl.id = `match-${gameId}`;
        matchEl.innerHTML = `
            <div class="match-header">
                <div class="match-title">
                    <span class="match-sport">${sport}</span>
                    <span class="match-teams">${homeTeam} vs ${awayTeam}</span>
                </div>
                <button class="match-close" data-game-id="${gameId}">✕</button>
            </div>
            <div class="match-score">
                <span class="home-score">0</span>
                <span class="score-separator">-</span>
                <span class="away-score">0</span>
            </div>
            <div class="match-status">
                <span class="match-quarter">Live</span>
                <span class="match-clock">--:--</span>
            </div>
            <div class="match-notifications"></div>
        `;
        
        const matchesContainer = this.floatingWidget.querySelector('.widget-matches');
        matchesContainer.appendChild(matchEl);
        
        // Update match count
        this.updateMatchCount();
        
        // Hide empty state
        this.floatingWidget.querySelector('.widget-empty-state').style.display = 'none';
        
        // Add close listener
        matchEl.querySelector('.match-close').addEventListener('click', (e) => {
            const gid = e.target.dataset.gameId;
            liveMatchNotifications.unsubscribeFromGame(gid);
            this.removeMatchWidget(gid);
        });
        
        this.activeMatches.set(gameId, matchEl);
    }

    removeMatchWidget(gameId) {
        const matchEl = document.getElementById(`match-${gameId}`);
        if (matchEl) {
            matchEl.remove();
        }
        
        this.activeMatches.delete(gameId);
        this.updateMatchCount();
        
        // Show empty state if no matches
        if (this.activeMatches.size === 0) {
            this.floatingWidget.querySelector('.widget-empty-state').style.display = 'block';
        }
    }

    updateMatchCount() {
        const count = this.floatingWidget.querySelector('.widget-count');
        count.textContent = `(${this.activeMatches.size})`;
    }

    // ============================================
    // NOTIFICATION DISPLAY
    // ============================================

    handleNotification(notification) {
        const { gameId, type, data } = notification;
        const matchEl = document.getElementById(`match-${gameId}`);
        
        if (!matchEl) return;
        
        // Update score if available
        if (data.score) {
            this.updateMatchScore(matchEl, data.score);
        }
        
        // Update clock if available
        if (data.quarter && data.clock) {
            this.updateMatchClock(matchEl, data.quarter, data.clock);
        }
        
        // Add notification to match widget
        if (type !== 'score_update') {
            this.addMatchNotification(matchEl, notification);
        }
    }

    updateMatchScore(matchEl, score) {
        matchEl.querySelector('.home-score').textContent = score.home;
        matchEl.querySelector('.away-score').textContent = score.away;
        
        // Animate score update
        matchEl.classList.add('score-updated');
        setTimeout(() => {
            matchEl.classList.remove('score-updated');
        }, 500);
    }

    updateMatchClock(matchEl, quarter, clock) {
        matchEl.querySelector('.match-quarter').textContent = `Q${quarter}`;
        matchEl.querySelector('.match-clock').textContent = clock;
    }

    addMatchNotification(matchEl, notification) {
        const { type, message, icon, priority } = notification;
        
        const notifEl = document.createElement('div');
        notifEl.className = `match-notification priority-${priority}`;
        notifEl.innerHTML = `
            <span class="notif-icon">${icon}</span>
            <span class="notif-message">${message}</span>
        `;
        
        const notifContainer = matchEl.querySelector('.match-notifications');
        notifContainer.insertBefore(notifEl, notifContainer.firstChild);
        
        // Keep only last 3 notifications
        const notifs = notifContainer.querySelectorAll('.match-notification');
        if (notifs.length > 3) {
            notifs[notifs.length - 1].remove();
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notifEl.classList.add('fade-out');
            setTimeout(() => notifEl.remove(), 300);
        }, 5000);
    }

    // ============================================
    // PREFERENCES MODAL
    // ============================================

    createModalContainer() {
        this.container = document.createElement('div');
        this.container.id = 'live-notifications-container';
        this.container.style.display = 'none';
        document.body.appendChild(this.container);
    }

    showPreferencesModal() {
        const prefs = liveMatchNotifications.getPreferences();
        
        const modal = document.createElement('div');
        modal.className = 'live-notifications-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Live Notification Preferences</h3>
                    <button class="modal-close">✕</button>
                </div>
                
                <div class="modal-body">
                    <div class="pref-group">
                        <label class="pref-checkbox">
                            <input type="checkbox" name="scoreUpdates" ${prefs.scoreUpdates ? 'checked' : ''}>
                            <span>⚽ Score Updates</span>
                        </label>
                    </div>
                    
                    <div class="pref-group">
                        <label class="pref-checkbox">
                            <input type="checkbox" name="keyPlays" ${prefs.keyPlays ? 'checked' : ''}>
                            <span>🎯 Key Plays</span>
                        </label>
                    </div>
                    
                    <div class="pref-group">
                        <label class="pref-checkbox">
                            <input type="checkbox" name="gameEnd" ${prefs.gameEnd ? 'checked' : ''}>
                            <span>🏁 Game End</span>
                        </label>
                    </div>
                    
                    <div class="pref-group">
                        <label class="pref-checkbox">
                            <input type="checkbox" name="injuries" ${prefs.injuries ? 'checked' : ''}>
                            <span>🏥 Injuries</span>
                        </label>
                    </div>
                    
                    <div class="pref-group">
                        <label class="pref-checkbox">
                            <input type="checkbox" name="majorMomentum" ${prefs.majorMomentum ? 'checked' : ''}>
                            <span>💥 Momentum Shifts</span>
                        </label>
                    </div>
                    
                    <div class="pref-group">
                        <label class="pref-checkbox">
                            <input type="checkbox" name="oddsChanges" ${prefs.oddsChanges ? 'checked' : ''}>
                            <span>💰 Odds Changes</span>
                        </label>
                    </div>
                    
                    <div class="pref-group">
                        <label class="pref-checkbox">
                            <input type="checkbox" name="soundEnabled" ${prefs.soundEnabled ? 'checked' : ''}>
                            <span>🔊 Sound Effects</span>
                        </label>
                    </div>
                    
                    <div class="pref-divider"></div>
                    
                    <div class="pref-group">
                        <label class="pref-text">
                            <span>Toast Duration (ms):</span>
                            <input type="number" name="toastDuration" value="${prefs.toastDuration}" min="1000" max="10000" step="500">
                        </label>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary modal-cancel">Cancel</button>
                    <button class="btn btn-primary modal-save">Save Preferences</button>
                </div>
            </div>
        `;
        
        this.container.innerHTML = '';
        this.container.appendChild(modal);
        this.container.style.display = 'block';
        
        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.container.style.display = 'none';
        });
        
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            this.container.style.display = 'none';
        });
        
        modal.querySelector('.modal-cancel').addEventListener('click', () => {
            this.container.style.display = 'none';
        });
        
        modal.querySelector('.modal-save').addEventListener('click', () => {
            const newPrefs = {
                scoreUpdates: modal.querySelector('input[name="scoreUpdates"]').checked,
                keyPlays: modal.querySelector('input[name="keyPlays"]').checked,
                gameEnd: modal.querySelector('input[name="gameEnd"]').checked,
                injuries: modal.querySelector('input[name="injuries"]').checked,
                majorMomentum: modal.querySelector('input[name="majorMomentum"]').checked,
                oddsChanges: modal.querySelector('input[name="oddsChanges"]').checked,
                soundEnabled: modal.querySelector('input[name="soundEnabled"]').checked,
                toastDuration: parseInt(modal.querySelector('input[name="toastDuration"]').value)
            };
            
            liveMatchNotifications.setPreferences(newPrefs);
            this.container.style.display = 'none';
        });
    }

    // ============================================
    // STYLES
    // ============================================

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .live-match-floating-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 320px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                overflow: hidden;
                animation: slideIn 0.3s ease-out;
            }

            @keyframes slideIn {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .widget-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                color: white;
            }

            .widget-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                font-size: 14px;
            }

            .widget-icon {
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .widget-count {
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: 500;
            }

            .widget-actions {
                display: flex;
                gap: 6px;
            }

            .widget-btn {
                background: rgba(255, 255, 255, 0.15);
                border: none;
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .widget-btn:hover {
                background: rgba(255, 255, 255, 0.25);
            }

            .widget-content {
                max-height: 500px;
                overflow-y: auto;
                padding: 12px;
                display: block;
            }

            .widget-matches {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .widget-match {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 12px;
                backdrop-filter: blur(10px);
                transition: all 0.3s;
            }

            .widget-match:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            .widget-match.score-updated {
                animation: scoreFlash 0.5s ease-out;
            }

            @keyframes scoreFlash {
                0% { background: rgba(255, 255, 0, 0.3); }
                100% { background: rgba(255, 255, 255, 0.1); }
            }

            .match-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }

            .match-title {
                display: flex;
                align-items: center;
                gap: 8px;
                color: white;
                font-size: 12px;
            }

            .match-sport {
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
                font-size: 10px;
            }

            .match-teams {
                font-weight: 600;
            }

            .match-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                cursor: pointer;
                font-size: 14px;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .match-close:hover {
                color: white;
                transform: scale(1.2);
            }

            .match-score {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                color: white;
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 8px;
            }

            .score-separator {
                font-size: 14px;
            }

            .match-status {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: rgba(255, 255, 255, 0.8);
                padding: 6px;
                background: rgba(0, 0, 0, 0.15);
                border-radius: 4px;
                margin-bottom: 8px;
            }

            .match-notifications {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .match-notification {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 8px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 4px;
                font-size: 11px;
                color: white;
                animation: slideInRight 0.3s ease-out;
            }

            .match-notification.fade-out {
                animation: fadeOut 0.3s ease-out;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(10px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes fadeOut {
                to {
                    opacity: 0;
                    transform: translateX(-10px);
                }
            }

            .match-notification.priority-critical {
                background: rgba(220, 38, 38, 0.3);
                border-left: 2px solid #dc2626;
            }

            .match-notification.priority-high {
                background: rgba(245, 158, 11, 0.3);
                border-left: 2px solid #f59e0b;
            }

            .match-notification.priority-normal {
                background: rgba(59, 130, 246, 0.3);
                border-left: 2px solid #3b82f6;
            }

            .match-notification.priority-low {
                background: rgba(34, 197, 94, 0.3);
                border-left: 2px solid #22c55e;
            }

            .notif-icon {
                min-width: 16px;
            }

            .notif-message {
                flex: 1;
                line-height: 1.3;
            }

            .widget-empty-state {
                text-align: center;
                color: rgba(255, 255, 255, 0.6);
                padding: 20px;
                font-size: 12px;
            }

            /* Modal Styles */
            #live-notifications-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
            }

            .live-notifications-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.2s ease-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
            }

            .modal-content {
                position: relative;
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 64px rgba(0, 0, 0, 0.15);
                max-width: 400px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                animation: slideUp 0.3s ease-out;
            }

            @keyframes slideUp {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                border-bottom: 1px solid #e5e7eb;
            }

            .modal-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #6b7280;
                transition: color 0.2s;
            }

            .modal-close:hover {
                color: #111827;
            }

            .modal-body {
                padding: 16px;
            }

            .pref-group {
                margin-bottom: 12px;
            }

            .pref-checkbox {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                user-select: none;
                padding: 8px;
                border-radius: 6px;
                transition: background 0.2s;
            }

            .pref-checkbox:hover {
                background: #f3f4f6;
            }

            .pref-checkbox input {
                cursor: pointer;
                width: 16px;
                height: 16px;
            }

            .pref-text {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                padding: 8px;
                font-size: 13px;
            }

            .pref-text input {
                width: 70px;
                padding: 4px 6px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                font-size: 12px;
            }

            .pref-divider {
                height: 1px;
                background: #e5e7eb;
                margin: 12px 0;
            }

            .modal-footer {
                display: flex;
                gap: 8px;
                padding: 16px;
                border-top: 1px solid #e5e7eb;
            }

            .btn {
                flex: 1;
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
            }

            .btn-primary {
                background: #667eea;
                color: white;
            }

            .btn-primary:hover {
                background: #5568d3;
            }

            .btn-secondary {
                background: #e5e7eb;
                color: #111827;
            }

            .btn-secondary:hover {
                background: #d1d5db;
            }

            @media (max-width: 640px) {
                .live-match-floating-widget {
                    width: calc(100% - 40px);
                    right: 20px;
                    left: 20px;
                    max-width: none;
                }
                
                .modal-content {
                    width: 95%;
                    max-height: 90vh;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Export singleton instance
export const liveMatchNotificationsUI = new LiveMatchNotificationsUI();
