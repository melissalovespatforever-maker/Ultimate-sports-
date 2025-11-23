/**
 * Notification Settings UI
 * Beautiful interface for managing push notification preferences
 */

import { pushNotificationSystem } from './push-notification-system.js';

export class NotificationSettingsUI {
    constructor() {
        this.container = null;
        this.isOpen = false;
    }

    // ============================================
    // RENDER SETTINGS
    // ============================================

    render(container) {
        this.container = container;
        const prefs = pushNotificationSystem.getPreferences();
        const hasPermission = pushNotificationSystem.hasPermission();

        this.container.innerHTML = `
            <div class="notification-settings">
                <div class="notification-settings-header">
                    <h2>
                        <span class="header-icon">🔔</span>
                        Notification Settings
                    </h2>
                    <p class="header-subtitle">Stay updated with live game action</p>
                </div>

                ${!hasPermission ? this.renderPermissionPrompt() : ''}

                <div class="notification-settings-body">
                    <!-- Master Toggle -->
                    <div class="settings-section">
                        <div class="setting-item setting-item-primary">
                            <div class="setting-info">
                                <div class="setting-label">
                                    <span class="setting-icon">🔔</span>
                                    <span>Enable Notifications</span>
                                </div>
                                <div class="setting-description">
                                    Receive push notifications for live games
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="notify-enabled" ${prefs.enabled ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <!-- Notification Types -->
                    <div class="settings-section ${!prefs.enabled ? 'disabled' : ''}">
                        <h3 class="section-title">Notification Types</h3>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-label">
                                    <span class="setting-icon">⚡</span>
                                    <span>Score Updates</span>
                                </div>
                                <div class="setting-description">Get notified when teams score</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="notify-score-updates" ${prefs.scoreUpdates ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-label">
                                    <span class="setting-icon">🔥</span>
                                    <span>Big Plays</span>
                                </div>
                                <div class="setting-description">Dunks, 3-pointers, turnovers</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="notify-big-plays" ${prefs.bigPlays ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-label">
                                    <span class="setting-icon">⏰</span>
                                    <span>Quarter/Period End</span>
                                </div>
                                <div class="setting-description">Score at end of each period</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="notify-quarter-end" ${prefs.quarterEnd ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-label">
                                    <span class="setting-icon">🏀</span>
                                    <span>Game Start</span>
                                </div>
                                <div class="setting-description">When games begin</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="notify-game-start" ${prefs.gameStart ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-label">
                                    <span class="setting-icon">🏁</span>
                                    <span>Game End</span>
                                </div>
                                <div class="setting-description">Final scores</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="notify-game-end" ${prefs.gameEnd ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <!-- Favorite Teams -->
                    <div class="settings-section ${!prefs.enabled ? 'disabled' : ''}">
                        <h3 class="section-title">Favorite Teams</h3>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-label">
                                    <span class="setting-icon">⭐</span>
                                    <span>Favorites Only</span>
                                </div>
                                <div class="setting-description">Only notify for your favorite teams</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="notify-favorites-only" ${prefs.favoriteTeamsOnly ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="favorite-teams-list">
                            ${prefs.favoriteTeams.length > 0 ? `
                                <div class="favorite-teams">
                                    ${prefs.favoriteTeams.map(team => `
                                        <div class="favorite-team-chip">
                                            <span>${team}</span>
                                            <button class="remove-favorite-btn" data-team="${team}">×</button>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <div class="no-favorites">
                                    <p>No favorite teams selected</p>
                                </div>
                            `}
                            <button class="btn-secondary add-favorite-btn">
                                <span>➕</span>
                                <span>Add Favorite Team</span>
                            </button>
                        </div>
                    </div>

                    <!-- Sound & Vibration -->
                    <div class="settings-section ${!prefs.enabled ? 'disabled' : ''}">
                        <h3 class="section-title">Sound & Vibration</h3>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-label">
                                    <span class="setting-icon">🔊</span>
                                    <span>Notification Sound</span>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="notify-sound" ${prefs.soundEnabled ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-label">
                                    <span class="setting-icon">📳</span>
                                    <span>Vibration</span>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="notify-vibration" ${prefs.vibrationEnabled ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <!-- Quiet Hours -->
                    <div class="settings-section ${!prefs.enabled ? 'disabled' : ''}">
                        <h3 class="section-title">Quiet Hours</h3>
                        
                        <div class="setting-item">
                            <div class="setting-info">
                                <div class="setting-label">
                                    <span class="setting-icon">🌙</span>
                                    <span>Enable Quiet Hours</span>
                                </div>
                                <div class="setting-description">Pause notifications during specific times</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="notify-quiet-hours" ${prefs.quietHours.enabled ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        ${prefs.quietHours.enabled ? `
                            <div class="quiet-hours-time">
                                <div class="time-input-group">
                                    <label>From</label>
                                    <input type="time" id="quiet-start" value="${prefs.quietHours.start}">
                                </div>
                                <div class="time-input-group">
                                    <label>To</label>
                                    <input type="time" id="quiet-end" value="${prefs.quietHours.end}">
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Test Notification -->
                    <div class="settings-section">
                        <button class="btn-primary test-notification-btn" ${!hasPermission ? 'disabled' : ''}>
                            <span>🧪</span>
                            <span>Send Test Notification</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderPermissionPrompt() {
        return `
            <div class="notification-permission-prompt">
                <div class="permission-icon">🔔</div>
                <h3>Enable Push Notifications</h3>
                <p>Get real-time updates for live games, scores, and big plays</p>
                <button class="btn-primary enable-notifications-btn">
                    <span>🔔</span>
                    <span>Enable Notifications</span>
                </button>
            </div>
        `;
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    attachEventListeners() {
        // Enable notifications button
        const enableBtn = this.container.querySelector('.enable-notifications-btn');
        if (enableBtn) {
            enableBtn.addEventListener('click', async () => {
                const granted = await pushNotificationSystem.requestPermission();
                if (granted) {
                    this.render(this.container);
                }
            });
        }

        // Master toggle
        this.container.querySelector('#notify-enabled')?.addEventListener('change', (e) => {
            pushNotificationSystem.updatePreference('enabled', e.target.checked);
            this.render(this.container);
        });

        // Notification type toggles
        this.container.querySelector('#notify-score-updates')?.addEventListener('change', (e) => {
            pushNotificationSystem.updatePreference('scoreUpdates', e.target.checked);
        });

        this.container.querySelector('#notify-big-plays')?.addEventListener('change', (e) => {
            pushNotificationSystem.updatePreference('bigPlays', e.target.checked);
        });

        this.container.querySelector('#notify-quarter-end')?.addEventListener('change', (e) => {
            pushNotificationSystem.updatePreference('quarterEnd', e.target.checked);
        });

        this.container.querySelector('#notify-game-start')?.addEventListener('change', (e) => {
            pushNotificationSystem.updatePreference('gameStart', e.target.checked);
        });

        this.container.querySelector('#notify-game-end')?.addEventListener('change', (e) => {
            pushNotificationSystem.updatePreference('gameEnd', e.target.checked);
        });

        // Favorites only
        this.container.querySelector('#notify-favorites-only')?.addEventListener('change', (e) => {
            pushNotificationSystem.updatePreference('favoriteTeamsOnly', e.target.checked);
        });

        // Sound & vibration
        this.container.querySelector('#notify-sound')?.addEventListener('change', (e) => {
            pushNotificationSystem.updatePreference('soundEnabled', e.target.checked);
        });

        this.container.querySelector('#notify-vibration')?.addEventListener('change', (e) => {
            pushNotificationSystem.updatePreference('vibrationEnabled', e.target.checked);
        });

        // Quiet hours
        this.container.querySelector('#notify-quiet-hours')?.addEventListener('change', (e) => {
            pushNotificationSystem.updatePreference('quietHours.enabled', e.target.checked);
            this.render(this.container);
        });

        this.container.querySelector('#quiet-start')?.addEventListener('change', (e) => {
            pushNotificationSystem.updatePreference('quietHours.start', e.target.value);
        });

        this.container.querySelector('#quiet-end')?.addEventListener('change', (e) => {
            pushNotificationSystem.updatePreference('quietHours.end', e.target.value);
        });

        // Add favorite team
        this.container.querySelector('.add-favorite-btn')?.addEventListener('click', () => {
            this.showAddFavoriteModal();
        });

        // Remove favorite team
        this.container.querySelectorAll('.remove-favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const team = e.currentTarget.dataset.team;
                pushNotificationSystem.removeFavoriteTeam(team);
                this.render(this.container);
            });
        });

        // Test notification
        this.container.querySelector('.test-notification-btn')?.addEventListener('click', () => {
            pushNotificationSystem.sendTestNotification();
        });
    }

    // ============================================
    // MODALS
    // ============================================

    showAddFavoriteModal() {
        const teams = [
            'Lakers', 'Warriors', 'Celtics', 'Nets', 'Bucks',
            'Heat', 'Suns', 'Clippers', 'Nuggets', 'Mavericks',
            '76ers', 'Raptors', 'Bulls', 'Knicks', 'Hawks'
        ];

        const modal = document.createElement('div');
        modal.className = 'notification-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Favorite Team</h3>
                    <button class="modal-close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="team-selection-grid">
                        ${teams.map(team => `
                            <button class="team-select-btn" data-team="${team}">
                                <span class="team-icon">🏀</span>
                                <span>${team}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal
        const closeModal = () => modal.remove();
        modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        // Select team
        modal.querySelectorAll('.team-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const team = e.currentTarget.dataset.team;
                pushNotificationSystem.addFavoriteTeam(team);
                this.render(this.container);
                closeModal();
            });
        });
    }

    // ============================================
    // MODAL INTERFACE
    // ============================================

    showModal() {
        const modal = document.createElement('div');
        modal.className = 'notification-settings-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content modal-content-large">
                <div class="modal-close-btn">×</div>
                <div class="settings-modal-container"></div>
            </div>
        `;

        document.body.appendChild(modal);
        
        const container = modal.querySelector('.settings-modal-container');
        this.render(container);

        // Close handlers
        const closeModal = () => {
            modal.remove();
            this.isOpen = false;
        };

        modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        this.isOpen = true;
    }
}

// Create singleton instance
export const notificationSettingsUI = new NotificationSettingsUI();
