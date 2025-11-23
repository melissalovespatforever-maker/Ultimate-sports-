// ============================================
// CHALLENGES UI
// Visual Interface for Daily/Weekly Challenges
// ============================================

import { challengesSystem } from './challenges-system.js';

class ChallengesUI {
    constructor() {
        this.timers = [];
    }

    renderChallengesSection(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const daily = challengesSystem.getDailyChallenges();
        const weekly = challengesSystem.getWeeklyChallenges();

        container.innerHTML = `
            <div class="challenges-section">
                <!-- Daily Challenges -->
                <div class="challenge-period-section">
                    <div class="period-header">
                        <div class="period-title">
                            <div class="period-icon daily">☀️</div>
                            <div>
                                <h2>Daily Challenges</h2>
                                <p class="period-subtitle">Refresh in <span class="countdown" data-end="${daily[0]?.endTime}">--:--:--</span></p>
                            </div>
                        </div>
                        <div class="period-progress">
                            <span class="progress-text">${challengesSystem.getCompletedDailiesCount()}/${daily.length} Complete</span>
                        </div>
                    </div>
                    <div class="challenges-grid">
                        ${daily.map(challenge => this.renderChallengeCard(challenge, 'daily')).join('')}
                    </div>
                </div>

                <!-- Weekly Challenges -->
                <div class="challenge-period-section">
                    <div class="period-header">
                        <div class="period-title">
                            <div class="period-icon weekly">📅</div>
                            <div>
                                <h2>Weekly Challenges</h2>
                                <p class="period-subtitle">Refresh in <span class="countdown" data-end="${weekly[0]?.endTime}">--:--:--</span></p>
                            </div>
                        </div>
                        <div class="period-progress">
                            <span class="progress-text">${challengesSystem.getCompletedWeekliesCount()}/${weekly.length} Complete</span>
                        </div>
                    </div>
                    <div class="challenges-grid">
                        ${weekly.map(challenge => this.renderChallengeCard(challenge, 'weekly')).join('')}
                    </div>
                </div>
            </div>
        `;

        this.startTimers();
        this.setupEventListeners();
    }

    renderChallengeCard(challenge, period) {
        const progress = this.calculateProgressPercentage(challenge);
        const difficultyClass = challenge.difficulty || 'medium';

        return `
            <div class="challenge-card ${challenge.completed ? 'completed' : ''} difficulty-${difficultyClass}" 
                 data-challenge-id="${challenge.id}" 
                 data-period="${period}">
                
                <div class="challenge-header">
                    <div class="challenge-icon">${challenge.icon}</div>
                    <div class="challenge-difficulty ${difficultyClass}">
                        ${this.getDifficultyLabel(challenge.difficulty)}
                    </div>
                </div>

                <div class="challenge-content">
                    <h3>${challenge.name}</h3>
                    <p class="challenge-description">${challenge.description}</p>

                    ${!challenge.completed ? `
                        <div class="challenge-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <div class="progress-label">
                                <span>${this.formatProgress(challenge)}</span>
                                <span>${Math.round(progress)}%</span>
                            </div>
                        </div>
                    ` : `
                        <div class="challenge-completed-badge">
                            <i class="fas fa-check-circle"></i>
                            <span>Completed!</span>
                        </div>
                    `}

                    <div class="challenge-rewards">
                        <div class="reward-item">
                            <i class="fas fa-star"></i>
                            <span>+${challenge.reward.xp} XP</span>
                        </div>
                        ${challenge.reward.currency ? `
                            <div class="reward-item">
                                <i class="fas fa-coins"></i>
                                <span>+${challenge.reward.currency}</span>
                            </div>
                        ` : ''}
                        ${challenge.reward.badge ? `
                            <div class="reward-item badge-reward">
                                <i class="fas fa-trophy"></i>
                                <span>Badge</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${challenge.completed && !challenge.claimed ? `
                    <button class="claim-button" data-challenge-id="${challenge.id}" data-period="${period}">
                        <i class="fas fa-gift"></i>
                        Claim Reward
                    </button>
                ` : challenge.claimed ? `
                    <div class="claimed-badge">
                        <i class="fas fa-check"></i>
                        Claimed
                    </div>
                ` : ''}
            </div>
        `;
    }

    calculateProgressPercentage(challenge) {
        if (challenge.type.includes('win_rate') || challenge.type === 'daily_perfect') {
            // For percentage-based challenges
            return Math.min(100, (challenge.current / challenge.target) * 100);
        }
        return Math.min(100, (challenge.current / challenge.target) * 100);
    }

    formatProgress(challenge) {
        if (challenge.type.includes('win_rate')) {
            const current = Math.round(challenge.current * 100);
            const target = Math.round(challenge.target * 100);
            return `${current}% / ${target}%`;
        } else if (challenge.type === 'daily_perfect') {
            return challenge.current === 1 ? 'Perfect!' : 'In Progress';
        }
        return `${challenge.current} / ${challenge.target}`;
    }

    getDifficultyLabel(difficulty) {
        const labels = {
            'easy': '⭐',
            'medium': '⭐⭐',
            'hard': '⭐⭐⭐',
            'expert': '⭐⭐⭐⭐'
        };
        return labels[difficulty] || labels.medium;
    }

    // ============================================
    // COMPACT VIEW (Dashboard)
    // ============================================

    renderCompactChallenges(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const daily = challengesSystem.getDailyChallenges();
        const weekly = challengesSystem.getWeeklyChallenges();
        const allChallenges = [...daily, ...weekly];
        
        // Show incomplete challenges first, then completed
        const sorted = allChallenges.sort((a, b) => {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1;
        });

        const featured = sorted.slice(0, 3);

        container.innerHTML = `
            <div class="compact-challenges">
                <div class="compact-header">
                    <h3>Active Challenges</h3>
                    <button class="view-all-btn" id="view-all-challenges">
                        View All <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
                <div class="compact-challenges-list">
                    ${featured.map(c => this.renderCompactCard(c)).join('')}
                </div>
            </div>
        `;

        this.setupCompactListeners();
    }

    renderCompactCard(challenge) {
        const progress = this.calculateProgressPercentage(challenge);

        return `
            <div class="compact-challenge-card ${challenge.completed ? 'completed' : ''}">
                <div class="compact-icon">${challenge.icon}</div>
                <div class="compact-content">
                    <h4>${challenge.name}</h4>
                    <div class="compact-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span>${Math.round(progress)}%</span>
                    </div>
                    <div class="compact-reward">
                        <i class="fas fa-star"></i> +${challenge.reward.xp} XP
                    </div>
                </div>
                ${challenge.completed && !challenge.claimed ? `
                    <div class="compact-claim">
                        <i class="fas fa-gift"></i>
                    </div>
                ` : ''}
            </div>
        `;
    }

    setupCompactListeners() {
        const viewAllBtn = document.getElementById('view-all-challenges');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                // Navigate to challenges page
                window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'rewards' } }));
            });
        }
    }

    // ============================================
    // TIMERS & COUNTDOWN
    // ============================================

    startTimers() {
        this.stopTimers();
        
        const countdownElements = document.querySelectorAll('.countdown');
        
        const updateTimers = () => {
            countdownElements.forEach(el => {
                const endTime = el.dataset.end;
                if (!endTime) return;

                const remaining = challengesSystem.getTimeRemaining(endTime);
                
                if (remaining) {
                    const { hours, minutes, seconds } = remaining;
                    el.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                    
                    // Add urgency class if less than 1 hour
                    if (hours === 0) {
                        el.classList.add('urgent');
                    }
                } else {
                    el.textContent = 'Refreshing...';
                    // Trigger refresh check
                    setTimeout(() => {
                        challengesSystem.checkAndRefreshChallenges();
                    }, 1000);
                }
            });
        };

        // Initial update
        updateTimers();
        
        // Update every second
        this.timers.push(setInterval(updateTimers, 1000));
    }

    stopTimers() {
        this.timers.forEach(timer => clearInterval(timer));
        this.timers = [];
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    setupEventListeners() {
        // Claim buttons
        document.querySelectorAll('.claim-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const challengeId = e.target.dataset.challengeId || e.target.closest('.claim-button').dataset.challengeId;
                const period = e.target.dataset.period || e.target.closest('.claim-button').dataset.period;
                this.handleClaimReward(challengeId, period);
            });
        });

        // Challenge cards for details
        document.querySelectorAll('.challenge-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking claim button
                if (e.target.closest('.claim-button')) return;
                
                const challengeId = card.dataset.challengeId;
                const period = card.dataset.period;
                this.showChallengeDetails(challengeId, period);
            });
        });
    }

    handleClaimReward(challengeId, period) {
        const reward = challengesSystem.claimReward(challengeId, period);
        
        if (reward) {
            // Show reward notification
            this.showRewardNotification(reward);
            
            // Re-render to update UI
            this.renderChallengesSection(document.querySelector('.challenges-section')?.parentElement.id);
        }
    }

    showRewardNotification(reward) {
        const notification = document.createElement('div');
        notification.className = 'challenge-reward-notification';
        
        let rewardText = `+${reward.xp} XP`;
        if (reward.currency) rewardText += ` • +${reward.currency} coins`;
        if (reward.badge) rewardText += ` • 🏆 Badge!`;

        notification.innerHTML = `
            <div class="reward-content">
                <div class="reward-icon">🎁</div>
                <div class="reward-text">
                    <div class="reward-title">Challenge Completed!</div>
                    <div class="reward-details">${rewardText}</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }

    showChallengeDetails(challengeId, period) {
        const challenges = period === 'daily' ? 
            challengesSystem.getDailyChallenges() : 
            challengesSystem.getWeeklyChallenges();
        
        const challenge = challenges.find(c => c.id === challengeId);
        if (!challenge) return;

        const modal = document.createElement('div');
        modal.className = 'challenge-modal-overlay';
        
        const progress = this.calculateProgressPercentage(challenge);
        const timeRemaining = challengesSystem.getTimeRemaining(challenge.endTime);

        modal.innerHTML = `
            <div class="challenge-modal">
                <button class="modal-close">&times;</button>
                
                <div class="modal-icon ${challenge.difficulty}">${challenge.icon}</div>
                <h2>${challenge.name}</h2>
                <div class="modal-difficulty ${challenge.difficulty}">
                    ${this.getDifficultyLabel(challenge.difficulty)} ${challenge.difficulty.toUpperCase()}
                </div>
                
                <p class="modal-description">${challenge.description}</p>
                
                ${!challenge.completed ? `
                    <div class="modal-progress">
                        <div class="progress-label-large">
                            Progress: ${this.formatProgress(challenge)}
                        </div>
                        <div class="progress-bar-large">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-percent">${Math.round(progress)}%</div>
                    </div>
                ` : `
                    <div class="modal-completed">
                        <i class="fas fa-check-circle"></i>
                        <span>Challenge Completed!</span>
                    </div>
                `}

                ${timeRemaining ? `
                    <div class="modal-timer">
                        <i class="fas fa-clock"></i>
                        <span>Time Remaining: ${timeRemaining.hours}h ${timeRemaining.minutes}m</span>
                    </div>
                ` : ''}

                <div class="modal-rewards">
                    <h3>Rewards</h3>
                    <div class="rewards-list">
                        <div class="reward-item-large">
                            <i class="fas fa-star"></i>
                            <span>+${challenge.reward.xp} XP</span>
                        </div>
                        ${challenge.reward.currency ? `
                            <div class="reward-item-large">
                                <i class="fas fa-coins"></i>
                                <span>+${challenge.reward.currency} Coins</span>
                            </div>
                        ` : ''}
                        ${challenge.reward.badge ? `
                            <div class="reward-item-large badge">
                                <i class="fas fa-trophy"></i>
                                <span>Exclusive Badge</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${challenge.completed && !challenge.claimed ? `
                    <button class="modal-claim-btn" data-challenge-id="${challenge.id}" data-period="${period}">
                        <i class="fas fa-gift"></i> Claim Rewards
                    </button>
                ` : ''}
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        // Close handlers
        const close = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        };

        modal.querySelector('.modal-close').addEventListener('click', close);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });

        // Claim button in modal
        const claimBtn = modal.querySelector('.modal-claim-btn');
        if (claimBtn) {
            claimBtn.addEventListener('click', (e) => {
                const challengeId = e.target.dataset.challengeId || e.target.closest('.modal-claim-btn').dataset.challengeId;
                const period = e.target.dataset.period || e.target.closest('.modal-claim-btn').dataset.period;
                this.handleClaimReward(challengeId, period);
                close();
            });
        }
    }

    // ============================================
    // PROGRESS UPDATE ANIMATION
    // ============================================

    animateProgress(challengeId, period) {
        const card = document.querySelector(`[data-challenge-id="${challengeId}"][data-period="${period}"]`);
        if (!card) return;

        card.classList.add('progress-pulse');
        setTimeout(() => card.classList.remove('progress-pulse'), 1000);
    }
}

export const challengesUI = new ChallengesUI();
