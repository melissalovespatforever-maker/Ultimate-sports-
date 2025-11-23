// ============================================
// AI COACHING DASHBOARD UI
// Visual interface for personalized coaching
// ============================================

import { aiCoachingDashboard } from './ai-coaching-dashboard.js';

class AICoachingDashboardUI {
    constructor() {
        this.currentLesson = null;
        this.currentQuizIndex = 0;
        this.hasSeenWelcome = localStorage.getItem('coachingWelcomeSeen') === 'true';
    }

    // Render main dashboard
    render(containerId = 'coaching-page') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const data = aiCoachingDashboard.getDashboardData();
        
        // Show welcome guide for first-time users
        if (!this.hasSeenWelcome && data.progress.level === 1 && data.progress.totalBets === 0) {
            setTimeout(() => this.showWelcomeGuide(), 500);
        }

        container.innerHTML = `
            <div class="coaching-dashboard">
                <!-- Header with Level Progress -->
                <div class="coaching-header">
                    <div class="level-badge">
                        <i class="fas fa-star"></i>
                        <span>Level ${data.progress.level}</span>
                    </div>
                    <div class="xp-progress">
                        <div class="xp-bar-container">
                            <div class="xp-bar" style="width: ${data.stats.nextLevelProgress}%"></div>
                        </div>
                        <span class="xp-text">${data.progress.xp} / ${data.progress.xpToNextLevel} XP</span>
                    </div>
                </div>

                <!-- Coaching Insights -->
                <section class="coaching-section">
                    <h2 class="section-title">
                        <i class="fas fa-brain"></i>
                        Your AI Coaches Say...
                    </h2>
                    <div class="insights-grid">
                        ${this.renderInsights(data.insights)}
                    </div>
                </section>

                <!-- Stats Overview -->
                <section class="coaching-section">
                    <h2 class="section-title">
                        <i class="fas fa-chart-line"></i>
                        Performance Overview
                    </h2>
                    <div class="stats-grid">
                        ${this.renderStatsCards(data.progress)}
                    </div>
                </section>

                <!-- Skills Breakdown -->
                <section class="coaching-section">
                    <h2 class="section-title">
                        <i class="fas fa-graduation-cap"></i>
                        Betting Skills Breakdown
                    </h2>
                    <div class="skills-container">
                        ${this.renderSkills(data.stats.skillBreakdown)}
                    </div>
                </section>

                <!-- Daily Challenges -->
                <section class="coaching-section">
                    <h2 class="section-title">
                        <i class="fas fa-star"></i>
                        Today's Challenges
                        <span class="challenge-timer" id="daily-timer"></span>
                    </h2>
                    <div class="challenges-grid">
                        ${this.renderChallenges(data.dailyChallenges, 'daily')}
                    </div>
                </section>

                <!-- Weekly Challenges -->
                <section class="coaching-section">
                    <h2 class="section-title">
                        <i class="fas fa-trophy"></i>
                        This Week's Challenges
                        <span class="challenge-timer" id="weekly-timer"></span>
                    </h2>
                    <div class="challenges-grid">
                        ${this.renderChallenges(data.weeklyChallenges, 'weekly')}
                    </div>
                </section>

                <!-- Active Goals -->
                <section class="coaching-section">
                    <h2 class="section-title">
                        <i class="fas fa-bullseye"></i>
                        Active Goals
                    </h2>
                    <div class="goals-grid">
                        ${this.renderGoals(data.stats.activeGoals)}
                    </div>
                </section>

                <!-- Lessons -->
                <section class="coaching-section">
                    <h2 class="section-title">
                        <i class="fas fa-book"></i>
                        Coaching Lessons
                        <span class="lesson-progress">${data.stats.completedLessons}/${data.stats.totalLessons} Complete</span>
                    </h2>
                    <div class="lessons-container">
                        ${this.renderLessons(data.lessons, data.progress.completedLessons)}
                    </div>
                </section>

                <!-- Achievements -->
                <section class="coaching-section">
                    <h2 class="section-title">
                        <i class="fas fa-trophy"></i>
                        Achievements
                    </h2>
                    <div class="achievements-grid">
                        ${this.renderAchievements(data.achievements)}
                    </div>
                </section>
            </div>
        `;

        this.attachEventListeners();
        this.startChallengeTimers();
    }

    // Render coaching insights
    renderInsights(insights) {
        if (insights.length === 0) {
            return `
                <div class="insight-card success">
                    <div class="insight-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="insight-content">
                        <h3>You're Doing Great!</h3>
                        <p class="coach-name">All Coaches</p>
                        <p>No issues to report. Keep up the excellent work and stick to your strategy.</p>
                    </div>
                </div>
            `;
        }

        return insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <div class="insight-icon">
                    ${this.getInsightIcon(insight.type)}
                </div>
                <div class="insight-content">
                    <h3>${insight.title}</h3>
                    <p class="coach-name">${insight.coach}</p>
                    <p>${insight.message}</p>
                    ${insight.action ? `
                        <button class="insight-action-btn" data-action="${insight.action}" data-action-id="${insight.actionId || ''}">
                            ${insight.action}
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Get insight icon
    getInsightIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            critical: '<i class="fas fa-exclamation-circle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    }

    // Render stats cards
    renderStatsCards(progress) {
        return `
            <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15));">
                    <i class="fas fa-percentage" style="color: var(--success);"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-value">${progress.winRate}%</span>
                    <span class="stat-label">Win Rate</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15));">
                    <i class="fas fa-dollar-sign" style="color: var(--info);"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-value ${progress.profitLoss >= 0 ? 'positive' : 'negative'}">
                        ${progress.profitLoss >= 0 ? '+' : ''}$${Math.abs(progress.profitLoss).toFixed(0)}
                    </span>
                    <span class="stat-label">Total P/L</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.15));">
                    <i class="fas fa-fire" style="color: var(--warning);"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-value">${Math.abs(progress.streakCurrent)}</span>
                    <span class="stat-label">${progress.streakCurrent >= 0 ? 'Win' : 'Loss'} Streak</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.15));">
                    <i class="fas fa-chart-bar" style="color: var(--secondary);"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-value">${progress.totalBets}</span>
                    <span class="stat-label">Total Bets</span>
                </div>
            </div>
        `;
    }

    // Render skills
    renderSkills(skills) {
        return skills.map(skill => `
            <div class="skill-item">
                <div class="skill-header">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-grade grade-${skill.grade.replace('+', 'plus')}">${skill.grade}</span>
                </div>
                <div class="skill-bar-container">
                    <div class="skill-bar" style="width: ${skill.rating}%; background: ${this.getSkillColor(skill.rating)}"></div>
                </div>
                <div class="skill-footer">
                    <span class="skill-rating">${skill.rating}%</span>
                    <span class="skill-status">${this.getSkillStatus(skill.rating)}</span>
                </div>
            </div>
        `).join('');
    }

    // Get skill color
    getSkillColor(rating) {
        if (rating >= 80) return 'linear-gradient(90deg, #10b981, #059669)';
        if (rating >= 65) return 'linear-gradient(90deg, #3b82f6, #2563eb)';
        if (rating >= 50) return 'linear-gradient(90deg, #f59e0b, #d97706)';
        return 'linear-gradient(90deg, #ef4444, #dc2626)';
    }

    // Get skill status
    getSkillStatus(rating) {
        if (rating >= 85) return 'Expert';
        if (rating >= 70) return 'Advanced';
        if (rating >= 55) return 'Intermediate';
        if (rating >= 40) return 'Developing';
        return 'Needs Work';
    }

    // Render challenges
    renderChallenges(challenges, type) {
        if (!challenges || challenges.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-hourglass-half"></i>
                    <p>New ${type} challenges coming soon...</p>
                </div>
            `;
        }

        return challenges.map(challenge => {
            const progress = (challenge.current / challenge.target) * 100;
            const isCompleted = challenge.completed;
            
            return `
                <div class="challenge-card ${isCompleted ? 'completed' : ''} difficulty-${challenge.difficulty}">
                    ${isCompleted ? '<div class="challenge-completed-badge"><i class="fas fa-check"></i></div>' : ''}
                    <div class="challenge-header">
                        <div class="challenge-icon">
                            <i class="fas ${challenge.icon}"></i>
                        </div>
                        <div class="challenge-difficulty ${challenge.difficulty}">
                            ${challenge.difficulty}
                        </div>
                    </div>
                    <h3>${challenge.name}</h3>
                    <p class="challenge-description">${challenge.description}</p>
                    <div class="challenge-progress">
                        <div class="challenge-progress-bar">
                            <div class="challenge-progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="challenge-progress-text">
                            <span>${challenge.current} / ${challenge.target}</span>
                            <span class="challenge-percent">${Math.round(progress)}%</span>
                        </div>
                    </div>
                    <div class="challenge-reward">
                        <i class="fas fa-star"></i>
                        <span class="bonus-xp">+${challenge.bonusXP} BONUS XP</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render goals
    renderGoals(goals) {
        if (goals.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>All goals completed! New goals will appear soon.</p>
                </div>
            `;
        }

        return goals.map(goal => `
            <div class="goal-card">
                <div class="goal-header">
                    <h3>${goal.name}</h3>
                    <span class="goal-type ${goal.type}">${goal.type}</span>
                </div>
                <p class="goal-description">${goal.description}</p>
                <div class="goal-progress">
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill" style="width: ${(goal.current / goal.target) * 100}%"></div>
                    </div>
                    <span class="goal-progress-text">${goal.current} / ${goal.target}</span>
                </div>
                <div class="goal-reward">
                    <i class="fas fa-star"></i>
                    <span>${goal.xpReward} XP</span>
                </div>
            </div>
        `).join('');
    }

    // Start challenge countdown timers
    startChallengeTimers() {
        this.updateTimers();
        // Update every second
        setInterval(() => this.updateTimers(), 1000);
    }

    // Update countdown timers
    updateTimers() {
        const now = new Date();
        
        // Daily timer - time until midnight
        const dailyTimer = document.getElementById('daily-timer');
        if (dailyTimer) {
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0);
            const diff = tomorrow - now;
            dailyTimer.textContent = this.formatTimeRemaining(diff);
        }

        // Weekly timer - time until Monday
        const weeklyTimer = document.getElementById('weekly-timer');
        if (weeklyTimer) {
            const nextMonday = new Date(now);
            const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
            nextMonday.setDate(now.getDate() + daysUntilMonday);
            nextMonday.setHours(0, 0, 0, 0);
            const diff = nextMonday - now;
            weeklyTimer.textContent = this.formatTimeRemaining(diff);
        }
    }

    // Format time remaining
    formatTimeRemaining(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        
        if (hours >= 24) {
            const days = Math.floor(hours / 24);
            return `🕐 Resets in ${days}d ${hours % 24}h`;
        }
        return `🕐 Resets in ${hours}h ${minutes}m ${seconds}s`;
    }

    // Render lessons
    renderLessons(lessons, completedIds) {
        // Group by category
        const categories = ['Basics', 'Advanced', 'Strategy', 'Psychology'];
        
        return categories.map(category => {
            const categoryLessons = lessons.filter(l => l.category === category);
            if (categoryLessons.length === 0) return '';

            return `
                <div class="lesson-category">
                    <h3 class="category-title">${category}</h3>
                    <div class="lessons-grid">
                        ${categoryLessons.map(lesson => {
                            const completed = completedIds.includes(lesson.id);
                            return `
                                <div class="lesson-card ${completed ? 'completed' : ''}" data-lesson-id="${lesson.id}">
                                    ${completed ? '<div class="lesson-completed-badge"><i class="fas fa-check"></i></div>' : ''}
                                    <div class="lesson-difficulty ${lesson.difficulty.toLowerCase()}">${lesson.difficulty}</div>
                                    <h4>${lesson.title}</h4>
                                    <p>${lesson.description}</p>
                                    <div class="lesson-footer">
                                        <span class="lesson-duration">
                                            <i class="fas fa-clock"></i>
                                            ${lesson.duration} min
                                        </span>
                                        <span class="lesson-xp">
                                            <i class="fas fa-star"></i>
                                            ${lesson.xpReward} XP
                                        </span>
                                    </div>
                                    <button class="lesson-btn ${completed ? 'review' : 'start'}">
                                        ${completed ? 'Review' : 'Start Lesson'}
                                        <i class="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render achievements
    renderAchievements(achievements) {
        return achievements.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon ${achievement.tier}">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
                <div class="achievement-reward">
                    <i class="fas fa-star"></i>
                    <span>${achievement.xpReward} XP</span>
                </div>
                ${achievement.unlocked ? `
                    <div class="achievement-unlocked">
                        <i class="fas fa-check-circle"></i>
                        Unlocked
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // Attach event listeners
    attachEventListeners() {
        // Lesson cards
        document.querySelectorAll('.lesson-card').forEach(card => {
            card.querySelector('.lesson-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const lessonId = card.dataset.lessonId;
                this.openLesson(lessonId);
            });
        });

        // Insight action buttons
        document.querySelectorAll('.insight-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const actionId = btn.dataset.actionId;
                this.handleInsightAction(action, actionId);
            });
        });
    }

    // Open lesson modal
    openLesson(lessonId) {
        const lesson = aiCoachingDashboard.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        this.currentLesson = lesson;
        this.currentQuizIndex = 0;

        const modal = document.createElement('div');
        modal.className = 'lesson-modal-overlay';
        modal.innerHTML = `
            <div class="lesson-modal">
                <div class="lesson-modal-header">
                    <h2>${lesson.title}</h2>
                    <button class="lesson-close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="lesson-modal-content">
                    ${lesson.content}
                </div>
                ${lesson.quiz ? `
                    <div class="lesson-quiz" id="lesson-quiz">
                        <h3>Quiz Time!</h3>
                        <p>Test your knowledge to complete this lesson.</p>
                        <button class="quiz-start-btn">
                            Start Quiz
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                ` : `
                    <div class="lesson-actions">
                        <button class="lesson-complete-btn">
                            Complete Lesson
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                `}
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.lesson-close-btn').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        if (lesson.quiz) {
            modal.querySelector('.quiz-start-btn')?.addEventListener('click', () => {
                this.startQuiz(modal, lesson);
            });
        } else {
            modal.querySelector('.lesson-complete-btn')?.addEventListener('click', () => {
                this.completeLesson(lessonId);
                modal.remove();
            });
        }
    }

    // Start quiz
    startQuiz(modal, lesson) {
        const quizContainer = modal.querySelector('#lesson-quiz');
        this.renderQuizQuestion(quizContainer, lesson, 0);
    }

    // Render quiz question
    renderQuizQuestion(container, lesson, questionIndex) {
        const question = lesson.quiz[questionIndex];
        
        container.innerHTML = `
            <div class="quiz-question">
                <div class="quiz-progress">Question ${questionIndex + 1} of ${lesson.quiz.length}</div>
                <h3>${question.question}</h3>
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <button class="quiz-option" data-index="${index}">
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Attach option click handlers
        container.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedIndex = parseInt(btn.dataset.index);
                this.checkQuizAnswer(container, lesson, questionIndex, selectedIndex);
            });
        });
    }

    // Check quiz answer
    checkQuizAnswer(container, lesson, questionIndex, selectedIndex) {
        const question = lesson.quiz[questionIndex];
        const isCorrect = selectedIndex === question.correct;

        if (isCorrect) {
            container.innerHTML = `
                <div class="quiz-result correct">
                    <i class="fas fa-check-circle"></i>
                    <h3>Correct!</h3>
                    <p>Great job! You're mastering this concept.</p>
                    ${questionIndex < lesson.quiz.length - 1 ? `
                        <button class="quiz-next-btn">
                            Next Question
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    ` : `
                        <button class="quiz-complete-btn">
                            Complete Lesson
                            <i class="fas fa-check"></i>
                        </button>
                    `}
                </div>
            `;

            if (questionIndex < lesson.quiz.length - 1) {
                container.querySelector('.quiz-next-btn').addEventListener('click', () => {
                    this.renderQuizQuestion(container, lesson, questionIndex + 1);
                });
            } else {
                container.querySelector('.quiz-complete-btn').addEventListener('click', () => {
                    this.completeLesson(lesson.id);
                    container.closest('.lesson-modal-overlay').remove();
                });
            }
        } else {
            container.innerHTML = `
                <div class="quiz-result incorrect">
                    <i class="fas fa-times-circle"></i>
                    <h3>Not Quite</h3>
                    <p>The correct answer was: ${question.options[question.correct]}</p>
                    <button class="quiz-retry-btn">
                        Try Again
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            `;

            container.querySelector('.quiz-retry-btn').addEventListener('click', () => {
                this.renderQuizQuestion(container, lesson, questionIndex);
            });
        }
    }

    // Complete lesson
    completeLesson(lessonId) {
        const success = aiCoachingDashboard.completeLesson(lessonId);
        if (success) {
            this.render(); // Re-render dashboard
            
            if (typeof window.notificationSystem !== 'undefined') {
                const lesson = aiCoachingDashboard.lessons.find(l => l.id === lessonId);
                window.notificationSystem.show({
                    title: '🎓 Lesson Complete!',
                    message: `You earned ${lesson.xpReward} XP!`,
                    type: 'success'
                });
            }
        }
    }

    // Show welcome guide
    showWelcomeGuide() {
        const modal = document.createElement('div');
        modal.className = 'welcome-guide-overlay';
        modal.innerHTML = `
            <div class="welcome-guide-modal">
                <div class="welcome-header">
                    <div class="welcome-icon">
                        <i class="fas fa-brain"></i>
                    </div>
                    <h2>Welcome to AI Coaching!</h2>
                    <p>Your personal guide to becoming a better bettor</p>
                </div>
                
                <div class="welcome-content">
                    <div class="welcome-feature">
                        <div class="feature-icon">
                            <i class="fas fa-star"></i>
                        </div>
                        <h3>Level Up & Earn XP</h3>
                        <p>Gain experience by placing bets, completing lessons, and unlocking achievements</p>
                    </div>
                    
                    <div class="welcome-feature">
                        <div class="feature-icon">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <h3>AI Coach Insights</h3>
                        <p>Get personalized tips from 5 expert AI coaches based on your performance</p>
                    </div>
                    
                    <div class="welcome-feature">
                        <div class="feature-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <h3>Interactive Lessons</h3>
                        <p>Learn proven betting strategies with 6 lessons and interactive quizzes</p>
                    </div>
                    
                    <div class="welcome-feature">
                        <div class="feature-icon">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <h3>Unlock Achievements</h3>
                        <p>Complete challenges and earn rewards as you improve your skills</p>
                    </div>
                </div>
                
                <div class="welcome-cta">
                    <button class="welcome-start-btn">
                        <i class="fas fa-rocket"></i>
                        Get Started
                    </button>
                    <button class="welcome-skip-btn">Skip Tour</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Start button - open first lesson
        modal.querySelector('.welcome-start-btn').addEventListener('click', () => {
            modal.remove();
            this.hasSeenWelcome = true;
            localStorage.setItem('coachingWelcomeSeen', 'true');
            this.openLesson('basics-1'); // Open first lesson
        });
        
        // Skip button
        modal.querySelector('.welcome-skip-btn').addEventListener('click', () => {
            modal.remove();
            this.hasSeenWelcome = true;
            localStorage.setItem('coachingWelcomeSeen', 'true');
        });
    }

    // Handle insight action
    handleInsightAction(action, actionId) {
        switch (action) {
            case 'Review Lesson':
            case 'Take Lesson':
                if (actionId) {
                    this.openLesson(actionId);
                }
                break;
            case 'View Stats':
            case 'View Analysis':
                // Navigate to analytics page
                if (typeof window.modernNav !== 'undefined') {
                    window.modernNav.navigateToPage('analytics');
                }
                break;
            case 'Review Bankroll':
                // Scroll to stats section
                document.querySelector('.stats-grid')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'View Achievements':
                // Scroll to achievements
                document.querySelector('.achievements-grid')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'Browse Games':
                // Navigate to games page
                if (typeof window.modernNav !== 'undefined') {
                    window.modernNav.navigateToPage('games');
                }
                break;
        }
    }
}

// Export singleton
export const aiCoachingDashboardUI = new AICoachingDashboardUI();
