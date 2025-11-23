// ============================================
// ACHIEVEMENTS UI
// Visual Interface for Badges & Rewards
// ============================================

import { achievementsSystem } from './achievements-system.js';

class AchievementsUI {
    constructor() {
        this.modalOpen = false;
    }

    renderAchievementsPage(containerId, userStats) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const categories = achievementsSystem.getAchievementsByCategory();
        const unlocked = achievementsSystem.getUnlockedAchievements();
        const completion = achievementsSystem.getCompletionPercentage();
        const totalXP = achievementsSystem.getTotalXPEarned();
        const nextAchievement = achievementsSystem.getNextAchievement(userStats);

        container.innerHTML = `
            <div class="achievements-page">
                <!-- Header Stats -->
                <div class="achievements-header">
                    <div class="achievements-hero">
                        <div class="hero-icon">🏆</div>
                        <h1>Achievements</h1>
                        <p>Unlock badges and earn rewards through your journey</p>
                    </div>

                    <div class="achievements-stats">
                        <div class="achievement-stat">
                            <div class="stat-value">${unlocked.length}/${Object.keys(achievementsSystem.achievements).length}</div>
                            <div class="stat-label">Unlocked</div>
                        </div>
                        <div class="achievement-stat">
                            <div class="stat-value">${completion}%</div>
                            <div class="stat-label">Complete</div>
                        </div>
                        <div class="achievement-stat">
                            <div class="stat-value">${totalXP.toLocaleString()}</div>
                            <div class="stat-label">XP Earned</div>
                        </div>
                    </div>

                    <div class="completion-bar">
                        <div class="completion-fill" style="width: ${completion}%"></div>
                    </div>
                </div>

                <!-- Next Achievement -->
                ${nextAchievement ? `
                    <div class="next-achievement-card">
                        <div class="next-badge">
                            <div class="badge-icon">${nextAchievement.icon}</div>
                            <div class="progress-ring" style="--progress: ${nextAchievement.progress}">
                                <svg>
                                    <circle cx="40" cy="40" r="36"></circle>
                                    <circle cx="40" cy="40" r="36" style="stroke-dashoffset: calc(226 - (226 * ${nextAchievement.progress}) / 100)"></circle>
                                </svg>
                            </div>
                        </div>
                        <div class="next-content">
                            <div class="next-label">NEXT ACHIEVEMENT</div>
                            <h3>${nextAchievement.name}</h3>
                            <p>${nextAchievement.description}</p>
                            <div class="next-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${nextAchievement.progress}%"></div>
                                </div>
                                <span>${Math.round(nextAchievement.progress)}%</span>
                            </div>
                            <div class="next-reward">+${nextAchievement.xpReward} XP</div>
                        </div>
                    </div>
                ` : ''}

                <!-- Filter Tabs -->
                <div class="achievements-tabs">
                    <button class="achievement-tab active" data-filter="all">All</button>
                    <button class="achievement-tab" data-filter="unlocked">Unlocked (${unlocked.length})</button>
                    <button class="achievement-tab" data-filter="locked">Locked (${Object.keys(achievementsSystem.achievements).length - unlocked.length})</button>
                </div>

                <!-- Achievement Categories -->
                ${this.renderCategories(categories, userStats)}
            </div>
        `;

        this.setupEventListeners(userStats);
    }

    renderCategories(categories, userStats) {
        const categoryNames = {
            getting_started: { name: 'Getting Started', icon: '🎯' },
            performance: { name: 'Performance', icon: '📊' },
            volume: { name: 'Volume', icon: '📈' },
            engagement: { name: 'Engagement', icon: '🔥' },
            social: { name: 'Social', icon: '👥' },
            learning: { name: 'Learning', icon: '🎓' },
            special: { name: 'Special', icon: '✨' }
        };

        return Object.entries(categories)
            .filter(([_, achievements]) => achievements.length > 0)
            .map(([category, achievements]) => `
                <div class="achievement-category">
                    <div class="category-header">
                        <span class="category-icon">${categoryNames[category].icon}</span>
                        <h2>${categoryNames[category].name}</h2>
                        <span class="category-count">${achievements.filter(a => a.unlocked).length}/${achievements.length}</span>
                    </div>
                    <div class="achievement-grid">
                        ${achievements.map(achievement => this.renderAchievementCard(achievement, userStats)).join('')}
                    </div>
                </div>
            `).join('');
    }

    renderAchievementCard(achievement, userStats) {
        const progress = achievementsSystem.getProgress(achievement.id, userStats);
        const tierColors = {
            bronze: '#CD7F32',
            silver: '#C0C0C0',
            gold: '#FFD700',
            platinum: '#E5E4E2'
        };

        return `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}" 
                 data-achievement="${achievement.id}"
                 style="--tier-color: ${tierColors[achievement.tier]}">
                <div class="achievement-badge">
                    <div class="badge-icon ${achievement.unlocked ? 'unlocked' : ''}">${achievement.icon}</div>
                    ${!achievement.unlocked ? `
                        <div class="badge-lock">🔒</div>
                    ` : ''}
                    <div class="tier-badge ${achievement.tier}">${achievement.tier}</div>
                </div>
                <div class="achievement-info">
                    <h3>${achievement.name}</h3>
                    <p>${achievement.description}</p>
                    ${!achievement.unlocked ? `
                        <div class="achievement-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <span>${Math.round(progress)}%</span>
                        </div>
                    ` : `
                        <div class="achievement-unlocked">
                            <i class="fas fa-check-circle"></i>
                            <span>Unlocked ${this.formatDate(achievement.unlockedAt)}</span>
                        </div>
                    `}
                    <div class="achievement-reward">
                        <i class="fas fa-star"></i>
                        <span>+${achievement.xpReward} XP</span>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners(userStats) {
        // Filter tabs
        document.querySelectorAll('.achievement-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.achievement-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                const filter = e.target.dataset.filter;
                this.filterAchievements(filter);
            });
        });

        // Achievement card click for details
        document.querySelectorAll('.achievement-card').forEach(card => {
            card.addEventListener('click', () => {
                const achievementId = card.dataset.achievement;
                const achievement = achievementsSystem.achievements[achievementId];
                this.showAchievementModal(achievement, userStats);
            });
        });
    }

    filterAchievements(filter) {
        const cards = document.querySelectorAll('.achievement-card');
        
        cards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'flex';
            } else if (filter === 'unlocked') {
                card.style.display = card.classList.contains('unlocked') ? 'flex' : 'none';
            } else if (filter === 'locked') {
                card.style.display = card.classList.contains('locked') ? 'flex' : 'none';
            }
        });
    }

    showAchievementModal(achievement, userStats) {
        const progress = achievementsSystem.getProgress(achievement.id, userStats);
        
        const modal = document.createElement('div');
        modal.className = 'achievement-modal-overlay';
        modal.innerHTML = `
            <div class="achievement-modal">
                <button class="modal-close">&times;</button>
                <div class="modal-badge ${achievement.unlocked ? 'unlocked' : ''}">
                    <div class="badge-icon-large">${achievement.icon}</div>
                    ${!achievement.unlocked ? '<div class="badge-lock-large">🔒</div>' : ''}
                </div>
                <h2>${achievement.name}</h2>
                <div class="tier-badge-large ${achievement.tier}">${achievement.tier.toUpperCase()}</div>
                <p class="modal-description">${achievement.description}</p>
                
                ${achievement.unlocked ? `
                    <div class="modal-unlocked">
                        <i class="fas fa-trophy"></i>
                        <span>Unlocked on ${this.formatDate(achievement.unlockedAt)}</span>
                    </div>
                ` : `
                    <div class="modal-progress">
                        <div class="progress-label">Progress: ${Math.round(progress)}%</div>
                        <div class="progress-bar-large">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                `}
                
                <div class="modal-reward">
                    <i class="fas fa-star"></i>
                    <span>Reward: +${achievement.xpReward} XP</span>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        // Close handlers
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    showUnlockNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-unlock-notification';
        notification.innerHTML = `
            <div class="unlock-content">
                <div class="unlock-badge">
                    <div class="badge-icon">${achievement.icon}</div>
                    <div class="unlock-shine"></div>
                </div>
                <div class="unlock-text">
                    <div class="unlock-title">Achievement Unlocked!</div>
                    <div class="unlock-name">${achievement.name}</div>
                    <div class="unlock-reward">+${achievement.xpReward} XP</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 5000);

        // Play sound (if enabled)
        this.playUnlockSound();
    }

    playUnlockSound() {
        // Audio feedback for achievement unlock
        const audioContext = window.AudioContext || window.webkitAudioContext;
        if (!audioContext) return;

        try {
            const ctx = new audioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = 523.25; // C5
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.5);

            // Second note
            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.frequency.value = 659.25; // E5
                osc2.type = 'sine';
                gain2.gain.setValueAtTime(0.3, ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                osc2.start(ctx.currentTime);
                osc2.stop(ctx.currentTime + 0.5);
            }, 150);
        } catch (e) {
            // Silent fail if audio not supported
        }
    }

    formatDate(dateString) {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return date.toLocaleDateString();
    }

    // Compact badge display for profile/dashboard
    renderCompactBadges(containerId, limit = 6) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const unlocked = achievementsSystem.getUnlockedAchievements()
            .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
            .slice(0, limit);

        container.innerHTML = `
            <div class="compact-badges">
                ${unlocked.map(achievement => `
                    <div class="compact-badge" title="${achievement.name}">
                        <div class="compact-icon">${achievement.icon}</div>
                    </div>
                `).join('')}
                ${unlocked.length === 0 ? '<p class="no-badges">No badges unlocked yet. Start tracking picks!</p>' : ''}
            </div>
        `;
    }
}

export const achievementsUI = new AchievementsUI();
