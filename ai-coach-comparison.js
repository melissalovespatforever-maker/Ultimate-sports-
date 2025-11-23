// ============================================
// AI COACH COMPARISON TOOL
// Help users choose the right AI coach
// ============================================

import { AIPredictionEngine } from './ai-prediction-engine.js';
import { paywallSystem } from './paywall-system.js';
import { subscriptionHelper } from './subscription-helper.js';

export class AICoachComparison {
    constructor() {
        this.engine = new AIPredictionEngine();
        this.selectedCoaches = [];
        this.comparisonMode = 'overview'; // overview, detailed, performance
        this.userPreferences = this.loadUserPreferences();
    }

    // ============================================
    // RENDER MAIN COMPARISON TOOL
    // ============================================

    render(container) {
        const element = typeof container === 'string' 
            ? document.getElementById(container) 
            : container;

        element.innerHTML = `
            <div class="coach-comparison-tool">
                <!-- Header -->
                <div class="comparison-header">
                    <div class="comparison-title-section">
                        <h2 class="comparison-title">
                            <i class="fas fa-balance-scale"></i>
                            Compare AI Coaches
                        </h2>
                        <p class="comparison-subtitle">Find the perfect AI coach for your betting style</p>
                    </div>
                    
                    <div class="comparison-actions">
                        <button class="quiz-btn" id="take-quiz-btn">
                            <i class="fas fa-question-circle"></i>
                            <span>Take Quiz</span>
                        </button>
                        <button class="view-toggle" id="view-toggle">
                            <i class="fas fa-th"></i>
                            <span>Grid View</span>
                        </button>
                    </div>
                </div>

                <!-- Quick Filter Tabs -->
                <div class="comparison-tabs">
                    <button class="tab-btn active" data-mode="overview">
                        <i class="fas fa-eye"></i>
                        <span>Overview</span>
                    </button>
                    <button class="tab-btn" data-mode="performance">
                        <i class="fas fa-chart-line"></i>
                        <span>Performance</span>
                    </button>
                    <button class="tab-btn" data-mode="detailed">
                        <i class="fas fa-list"></i>
                        <span>Detailed</span>
                    </button>
                    <button class="tab-btn" data-mode="pricing">
                        <i class="fas fa-dollar-sign"></i>
                        <span>Pricing</span>
                    </button>
                </div>

                <!-- Filter Options -->
                <div class="comparison-filters">
                    <div class="filter-group">
                        <label>
                            <i class="fas fa-filter"></i>
                            <span>Access Level:</span>
                        </label>
                        <select id="access-filter">
                            <option value="all">All Coaches</option>
                            <option value="available">Available to Me</option>
                            <option value="locked">Premium Only</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>
                            <i class="fas fa-sort"></i>
                            <span>Sort By:</span>
                        </label>
                        <select id="sort-filter">
                            <option value="confidence">Confidence</option>
                            <option value="winRate">Win Rate</option>
                            <option value="roi">ROI</option>
                            <option value="tier">Access Tier</option>
                        </select>
                    </div>
                </div>

                <!-- Comparison Content -->
                <div class="comparison-content" id="comparison-content">
                    ${this.renderComparisonContent()}
                </div>

                <!-- Recommendation Section -->
                <div class="recommendation-section" id="recommendation-section">
                    ${this.renderRecommendation()}
                </div>
            </div>
        `;

        this.attachEventHandlers(element);
    }

    // ============================================
    // RENDER COMPARISON CONTENT
    // ============================================

    renderComparisonContent() {
        switch (this.comparisonMode) {
            case 'overview':
                return this.renderOverviewComparison();
            case 'performance':
                return this.renderPerformanceComparison();
            case 'detailed':
                return this.renderDetailedComparison();
            case 'pricing':
                return this.renderPricingComparison();
            default:
                return this.renderOverviewComparison();
        }
    }

    // ============================================
    // OVERVIEW COMPARISON
    // ============================================

    renderOverviewComparison() {
        const coaches = Object.values(this.engine.coaches);
        const userTier = subscriptionHelper.getUserTier();

        return `
            <div class="coaches-grid-comparison">
                ${coaches.map(coach => {
                    const perf = this.engine.performance[coach.id];
                    const hasAccess = this.hasAccess(coach);
                    const tier = this.getTierName(coach);
                    
                    return `
                        <div class="coach-comparison-card ${!hasAccess ? 'locked' : ''}" data-coach-id="${coach.id}">
                            <!-- Header with Avatar -->
                            <div class="coach-card-header">
                                <div class="coach-avatar-wrapper">
                                    <img src="${coach.avatar}" alt="${coach.name}" class="coach-avatar ${!hasAccess ? 'blurred' : ''}">
                                    ${!hasAccess ? '<div class="lock-overlay"><i class="fas fa-lock"></i></div>' : ''}
                                </div>
                                <div class="tier-badge tier-${tier.toLowerCase()}">
                                    ${tier}
                                </div>
                            </div>

                            <!-- Coach Info -->
                            <div class="coach-card-info">
                                <h3 class="coach-name">${coach.name}</h3>
                                <p class="coach-title">${coach.title}</p>
                                <div class="coach-specialty">
                                    <i class="fas fa-star"></i>
                                    <span>${coach.specialty}</span>
                                </div>
                            </div>

                            <!-- Key Stats -->
                            <div class="coach-key-stats">
                                <div class="key-stat">
                                    <div class="stat-icon confidence">
                                        <i class="fas fa-brain"></i>
                                    </div>
                                    <div class="stat-info">
                                        <span class="stat-label">Confidence</span>
                                        <span class="stat-value">${Math.round(coach.confidence * 100)}%</span>
                                    </div>
                                </div>
                                
                                ${hasAccess ? `
                                    <div class="key-stat">
                                        <div class="stat-icon win-rate">
                                            <i class="fas fa-percentage"></i>
                                        </div>
                                        <div class="stat-info">
                                            <span class="stat-label">Win Rate</span>
                                            <span class="stat-value">${Math.round(perf.winRate)}%</span>
                                        </div>
                                    </div>
                                    
                                    <div class="key-stat">
                                        <div class="stat-icon roi">
                                            <i class="fas fa-chart-line"></i>
                                        </div>
                                        <div class="stat-info">
                                            <span class="stat-label">ROI</span>
                                            <span class="stat-value ${perf.roi >= 0 ? 'positive' : 'negative'}">
                                                ${perf.roi >= 0 ? '+' : ''}${perf.roi}%
                                            </span>
                                        </div>
                                    </div>
                                ` : `
                                    <div class="key-stat locked-stat">
                                        <div class="stat-icon">
                                            <i class="fas fa-lock"></i>
                                        </div>
                                        <div class="stat-info">
                                            <span class="stat-label">Unlock to see</span>
                                            <span class="stat-value blurred">XX%</span>
                                        </div>
                                    </div>
                                `}
                            </div>

                            <!-- Strengths -->
                            <div class="coach-strengths">
                                <h4 class="strengths-title">
                                    <i class="fas fa-check-circle"></i>
                                    Best For:
                                </h4>
                                <ul class="strengths-list">
                                    ${coach.strengths.map(strength => `
                                        <li>${strength}</li>
                                    `).join('')}
                                </ul>
                            </div>

                            <!-- Description -->
                            <p class="coach-description">${coach.description}</p>

                            <!-- Action Button -->
                            ${this.renderActionButton(coach, hasAccess)}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // ============================================
    // PERFORMANCE COMPARISON
    // ============================================

    renderPerformanceComparison() {
        const coaches = Object.values(this.engine.coaches);
        
        return `
            <div class="performance-comparison">
                <!-- Performance Chart -->
                <div class="performance-chart-section">
                    <h3 class="section-title">
                        <i class="fas fa-chart-bar"></i>
                        Performance Overview
                    </h3>
                    <div class="performance-bars" id="performance-bars">
                        ${this.renderPerformanceBars(coaches)}
                    </div>
                </div>

                <!-- Detailed Stats Table -->
                <div class="stats-table-section">
                    <h3 class="section-title">
                        <i class="fas fa-table"></i>
                        Detailed Statistics
                    </h3>
                    <div class="stats-table-wrapper">
                        <table class="stats-comparison-table">
                            <thead>
                                <tr>
                                    <th>Coach</th>
                                    <th>Confidence</th>
                                    <th>Win Rate</th>
                                    <th>ROI</th>
                                    <th>Total Picks</th>
                                    <th>Profit (Units)</th>
                                    <th>Last 10</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${coaches.map(coach => this.renderPerformanceRow(coach)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Win Rate Comparison -->
                <div class="win-rate-section">
                    <h3 class="section-title">
                        <i class="fas fa-trophy"></i>
                        Win Rate Comparison
                    </h3>
                    <div class="win-rate-bars">
                        ${coaches.map(coach => {
                            const perf = this.engine.performance[coach.id];
                            const hasAccess = this.hasAccess(coach);
                            
                            return `
                                <div class="win-rate-bar-item">
                                    <div class="bar-header">
                                        <img src="${coach.avatar}" alt="${coach.name}" class="bar-avatar ${!hasAccess ? 'blurred' : ''}">
                                        <span class="bar-label">${coach.name}</span>
                                        <span class="bar-value ${!hasAccess ? 'blurred' : ''}">${hasAccess ? Math.round(perf.winRate) : 'XX'}%</span>
                                    </div>
                                    <div class="bar-track">
                                        <div class="bar-fill ${!hasAccess ? 'locked' : ''}" 
                                             style="width: ${hasAccess ? perf.winRate : 0}%;"
                                             data-value="${perf.winRate}">
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderPerformanceBars(coaches) {
        return coaches.map(coach => {
            const perf = this.engine.performance[coach.id];
            const hasAccess = this.hasAccess(coach);
            
            return `
                <div class="performance-bar-group">
                    <div class="coach-label">
                        <img src="${coach.avatar}" alt="${coach.name}" class="label-avatar ${!hasAccess ? 'blurred' : ''}">
                        <span>${coach.name}</span>
                    </div>
                    <div class="bars">
                        <div class="bar-item">
                            <span class="bar-label">Win Rate</span>
                            <div class="bar">
                                <div class="bar-fill win-rate ${!hasAccess ? 'locked' : ''}" style="width: ${hasAccess ? perf.winRate : 0}%"></div>
                            </div>
                            <span class="bar-value ${!hasAccess ? 'blurred' : ''}">${hasAccess ? Math.round(perf.winRate) : 'XX'}%</span>
                        </div>
                        <div class="bar-item">
                            <span class="bar-label">ROI</span>
                            <div class="bar">
                                <div class="bar-fill roi ${!hasAccess ? 'locked' : ''}" style="width: ${hasAccess ? Math.abs(perf.roi) : 0}%"></div>
                            </div>
                            <span class="bar-value ${!hasAccess ? 'blurred' : ''}">${hasAccess ? (perf.roi >= 0 ? '+' : '') + perf.roi : '+XX'}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderPerformanceRow(coach) {
        const perf = this.engine.performance[coach.id];
        const hasAccess = this.hasAccess(coach);
        
        return `
            <tr class="${!hasAccess ? 'locked-row' : ''}">
                <td class="coach-cell">
                    <img src="${coach.avatar}" alt="${coach.name}" class="table-avatar ${!hasAccess ? 'blurred' : ''}">
                    <span>${coach.name}</span>
                </td>
                <td>${Math.round(coach.confidence * 100)}%</td>
                <td class="${!hasAccess ? 'blurred' : ''}">${hasAccess ? Math.round(perf.winRate) : 'XX'}%</td>
                <td class="${!hasAccess ? 'blurred' : ''}">${hasAccess ? (perf.roi >= 0 ? '+' : '') + perf.roi : '+XX'}%</td>
                <td class="${!hasAccess ? 'blurred' : ''}">${hasAccess ? perf.totalPredictions : 'XX'}</td>
                <td class="${!hasAccess ? 'blurred' : ''}">${hasAccess ? (perf.profitUnits >= 0 ? '+' : '') + perf.profitUnits.toFixed(1) : '+XX.X'}u</td>
                <td class="last-10-cell">
                    ${hasAccess ? this.renderLast10(perf.last10) : '<span class="blurred">XXXXXXXXXX</span>'}
                </td>
            </tr>
        `;
    }

    renderLast10(results) {
        if (!results || results.length === 0) return '-';
        
        return results.slice(0, 10).map(result => {
            return `<span class="result-badge ${result ? 'win' : 'loss'}">${result ? '✓' : '✗'}</span>`;
        }).join('');
    }

    // ============================================
    // DETAILED COMPARISON
    // ============================================

    renderDetailedComparison() {
        const coaches = Object.values(this.engine.coaches);
        
        return `
            <div class="detailed-comparison">
                <div class="comparison-matrix">
                    <table class="detailed-table">
                        <thead>
                            <tr>
                                <th class="feature-col">Feature</th>
                                ${coaches.map(coach => `
                                    <th class="coach-col">
                                        <img src="${coach.avatar}" alt="${coach.name}" class="table-header-avatar">
                                        <span>${coach.name}</span>
                                    </th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderComparisonRows(coaches)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderComparisonRows(coaches) {
        const features = [
            { label: 'Access Tier', key: 'tier', type: 'badge' },
            { label: 'Specialty', key: 'specialty', type: 'text' },
            { label: 'Algorithm', key: 'algorithm', type: 'text' },
            { label: 'Confidence Level', key: 'confidence', type: 'percentage' },
            { label: 'Best For', key: 'strengths', type: 'list' },
            { label: 'Prediction Style', key: 'personality', type: 'text' },
            { label: 'Update Frequency', key: 'updateFrequency', type: 'text' },
            { label: 'Data Sources', key: 'dataSources', type: 'number' }
        ];

        return features.map(feature => `
            <tr>
                <td class="feature-label">
                    <strong>${feature.label}</strong>
                </td>
                ${coaches.map(coach => this.renderFeatureCell(coach, feature)).join('')}
            </tr>
        `).join('');
    }

    renderFeatureCell(coach, feature) {
        const hasAccess = this.hasAccess(coach);
        let content = '';

        switch (feature.key) {
            case 'tier':
                const tier = this.getTierName(coach);
                content = `<span class="tier-badge-small tier-${tier.toLowerCase()}">${tier}</span>`;
                break;
            case 'specialty':
                content = coach.specialty;
                break;
            case 'algorithm':
                content = this.formatAlgorithmName(coach.algorithm);
                break;
            case 'confidence':
                content = `${Math.round(coach.confidence * 100)}%`;
                break;
            case 'strengths':
                content = hasAccess 
                    ? `<ul class="inline-list">${coach.strengths.map(s => `<li>${s}</li>`).join('')}</ul>`
                    : '<span class="blurred">• • •</span>';
                break;
            case 'personality':
                content = hasAccess ? coach.personality : '<span class="blurred">Locked</span>';
                break;
            case 'updateFrequency':
                content = hasAccess ? 'Real-time' : '<span class="blurred">---</span>';
                break;
            case 'dataSources':
                content = hasAccess ? Math.floor(Math.random() * 5) + 10 : '<span class="blurred">XX</span>';
                break;
            default:
                content = '-';
        }

        return `<td class="${!hasAccess && feature.key !== 'tier' ? 'locked-cell' : ''}">${content}</td>`;
    }

    // ============================================
    // PRICING COMPARISON
    // ============================================

    renderPricingComparison() {
        const tiers = {
            free: {
                name: 'FREE',
                price: '$0',
                period: 'forever',
                color: '#10b981',
                icon: 'fa-gift',
                coaches: ['quantum'],
                features: [
                    '1 AI Coach (Quantum AI)',
                    'Basic predictions',
                    'Performance tracking',
                    'All game data',
                    'Bet tracking',
                    'Challenge system'
                ]
            },
            pro: {
                name: 'PRO',
                price: '$49.99',
                period: '/month',
                color: '#3b82f6',
                icon: 'fa-star',
                coaches: ['quantum', 'sharp', 'neural'],
                features: [
                    '3 AI Coaches',
                    'Sharp Edge AI',
                    'Neural Net AI',
                    'Line movement analysis',
                    'Advanced analytics',
                    'Priority picks',
                    'Everything in FREE'
                ],
                popular: true
            },
            vip: {
                name: 'VIP',
                price: '$99.99',
                period: '/month',
                color: '#8b5cf6',
                icon: 'fa-crown',
                coaches: ['quantum', 'sharp', 'neural', 'value', 'momentum'],
                features: [
                    'All 5 AI Coaches',
                    'Value Hunter AI',
                    'Momentum AI',
                    'Expected value optimization',
                    'Live betting specialist',
                    'Real-time alerts',
                    'Priority support',
                    'Everything in PRO'
                ]
            }
        };

        return `
            <div class="pricing-comparison">
                ${Object.entries(tiers).map(([key, tier]) => `
                    <div class="pricing-card ${tier.popular ? 'popular' : ''}">
                        ${tier.popular ? '<div class="popular-badge">Most Popular</div>' : ''}
                        
                        <div class="pricing-header" style="background: ${tier.color}20; border-top: 3px solid ${tier.color}">
                            <i class="fas ${tier.icon}" style="color: ${tier.color}; font-size: 36px;"></i>
                            <h3 class="tier-name">${tier.name}</h3>
                            <div class="pricing-amount">
                                <span class="price">${tier.price}</span>
                                <span class="period">${tier.period}</span>
                            </div>
                        </div>

                        <div class="pricing-coaches">
                            <h4 class="coaches-title">AI Coaches Included:</h4>
                            <div class="coaches-avatars">
                                ${tier.coaches.map(coachId => {
                                    const coach = this.engine.coaches[coachId];
                                    return `
                                        <div class="coach-avatar-item" title="${coach.name}">
                                            <img src="${coach.avatar}" alt="${coach.name}">
                                            <span>${coach.name}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <div class="pricing-features">
                            <ul>
                                ${tier.features.map(feature => `
                                    <li>
                                        <i class="fas fa-check" style="color: ${tier.color}"></i>
                                        <span>${feature}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <div class="pricing-action">
                            ${this.renderPricingButton(key, tier)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderPricingButton(tierKey, tier) {
        const currentTier = subscriptionHelper.getUserTier();
        
        if (currentTier === tierKey) {
            return `<button class="pricing-btn current" disabled>Current Plan</button>`;
        }
        
        if (tierKey === 'free') {
            return `<button class="pricing-btn free">Start Free</button>`;
        }
        
        return `
            <button class="pricing-btn upgrade" data-tier="${tierKey}">
                Upgrade to ${tier.name}
            </button>
        `;
    }

    // ============================================
    // RECOMMENDATION ENGINE
    // ============================================

    renderRecommendation() {
        const recommended = this.getRecommendedCoach();
        
        if (!recommended) return '';
        
        return `
            <div class="recommendation-card">
                <div class="recommendation-header">
                    <i class="fas fa-lightbulb"></i>
                    <h3>Recommended For You</h3>
                </div>
                
                <div class="recommendation-content">
                    <div class="recommended-coach">
                        <img src="${recommended.avatar}" alt="${recommended.name}" class="recommended-avatar">
                        <div class="recommended-info">
                            <h4>${recommended.name}</h4>
                            <p>${recommended.specialty}</p>
                        </div>
                    </div>
                    
                    <div class="recommendation-reason">
                        <p><strong>Why this coach?</strong></p>
                        <p>${this.getRecommendationReason(recommended)}</p>
                    </div>
                    
                    ${!this.hasAccess(recommended) ? `
                        <button class="recommendation-cta" data-coach-id="${recommended.id}">
                            <i class="fas fa-unlock"></i>
                            <span>Unlock ${recommended.name}</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getRecommendedCoach() {
        // Simple recommendation logic - can be enhanced based on user behavior
        const prefs = this.userPreferences;
        const coaches = Object.values(this.engine.coaches);
        
        // If user likes high confidence, recommend Neural Net
        if (prefs.prefersHighConfidence) {
            return coaches.find(c => c.id === 'neural');
        }
        
        // If user likes value betting, recommend Value Hunter
        if (prefs.prefersValue) {
            return coaches.find(c => c.id === 'value');
        }
        
        // Default to best performing available coach
        const available = coaches.filter(c => this.hasAccess(c));
        return available.sort((a, b) => {
            const perfA = this.engine.performance[a.id];
            const perfB = this.engine.performance[b.id];
            return perfB.roi - perfA.roi;
        })[0];
    }

    getRecommendationReason(coach) {
        const reasons = {
            quantum: 'Perfect for beginners with strong statistical analysis and consistent results.',
            sharp: 'Ideal if you like following professional money and line movement indicators.',
            neural: 'Best choice for data-driven bettors who want the highest confidence predictions.',
            value: 'Perfect for experienced bettors focused on long-term ROI and expected value.',
            momentum: 'Great for live bettors who can capitalize on in-game momentum shifts.'
        };
        
        return reasons[coach.id] || coach.description;
    }

    // ============================================
    // QUIZ MODAL
    // ============================================

    showQuiz() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active coach-quiz-modal';
        modal.innerHTML = `
            <div class="modal coach-quiz">
                <button class="modal-close" id="close-quiz">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="quiz-content">
                    <div class="quiz-header">
                        <i class="fas fa-question-circle"></i>
                        <h2>Find Your Perfect AI Coach</h2>
                        <p>Answer a few questions to get personalized recommendations</p>
                    </div>
                    
                    <div class="quiz-questions" id="quiz-questions">
                        ${this.renderQuizQuestions()}
                    </div>
                    
                    <div class="quiz-actions">
                        <button class="quiz-btn secondary" id="quiz-back" style="display: none;">
                            <i class="fas fa-arrow-left"></i>
                            Back
                        </button>
                        <button class="quiz-btn primary" id="quiz-next">
                            Next
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.initQuiz(modal);
    }

    renderQuizQuestions() {
        const questions = [
            {
                id: 'experience',
                question: 'What\'s your betting experience level?',
                options: [
                    { value: 'beginner', label: 'Beginner - Just starting out', icon: 'fa-seedling' },
                    { value: 'intermediate', label: 'Intermediate - Some experience', icon: 'fa-chart-line' },
                    { value: 'advanced', label: 'Advanced - Experienced bettor', icon: 'fa-star' }
                ]
            },
            {
                id: 'style',
                question: 'What\'s your betting style?',
                options: [
                    { value: 'conservative', label: 'Conservative - Steady wins', icon: 'fa-shield-alt' },
                    { value: 'balanced', label: 'Balanced - Mix of safe and risky', icon: 'fa-balance-scale' },
                    { value: 'aggressive', label: 'Aggressive - High risk/reward', icon: 'fa-fire' }
                ]
            },
            {
                id: 'focus',
                question: 'What matters most to you?',
                options: [
                    { value: 'winrate', label: 'Win Rate - Consistent wins', icon: 'fa-percentage' },
                    { value: 'roi', label: 'ROI - Long-term profit', icon: 'fa-dollar-sign' },
                    { value: 'confidence', label: 'Confidence - High certainty picks', icon: 'fa-brain' }
                ]
            },
            {
                id: 'timing',
                question: 'When do you prefer to bet?',
                options: [
                    { value: 'pregame', label: 'Pre-game - Before it starts', icon: 'fa-clock' },
                    { value: 'live', label: 'Live - During the game', icon: 'fa-broadcast-tower' },
                    { value: 'both', label: 'Both - Whenever value appears', icon: 'fa-random' }
                ]
            }
        ];

        return questions.map((q, index) => `
            <div class="quiz-question ${index === 0 ? 'active' : ''}" data-question-id="${q.id}">
                <h3 class="question-text">
                    <span class="question-number">${index + 1}/${questions.length}</span>
                    ${q.question}
                </h3>
                <div class="question-options">
                    ${q.options.map(opt => `
                        <label class="quiz-option">
                            <input type="radio" name="${q.id}" value="${opt.value}">
                            <div class="option-content">
                                <i class="fas ${opt.icon}"></i>
                                <span>${opt.label}</span>
                            </div>
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    initQuiz(modal) {
        let currentQuestion = 0;
        const questions = modal.querySelectorAll('.quiz-question');
        const answers = {};
        
        const nextBtn = modal.querySelector('#quiz-next');
        const backBtn = modal.querySelector('#quiz-back');
        const closeBtn = modal.querySelector('#close-quiz');
        
        const updateButtons = () => {
            backBtn.style.display = currentQuestion > 0 ? 'block' : 'none';
            nextBtn.innerHTML = currentQuestion === questions.length - 1 
                ? '<i class="fas fa-check"></i> See Results'
                : 'Next <i class="fas fa-arrow-right"></i>';
        };
        
        nextBtn.addEventListener('click', () => {
            const current = questions[currentQuestion];
            const selected = current.querySelector('input:checked');
            
            if (!selected) {
                alert('Please select an option');
                return;
            }
            
            answers[current.dataset.questionId] = selected.value;
            
            if (currentQuestion < questions.length - 1) {
                current.classList.remove('active');
                currentQuestion++;
                questions[currentQuestion].classList.add('active');
                updateButtons();
            } else {
                // Show results
                this.showQuizResults(answers, modal);
            }
        });
        
        backBtn.addEventListener('click', () => {
            questions[currentQuestion].classList.remove('active');
            currentQuestion--;
            questions[currentQuestion].classList.add('active');
            updateButtons();
        });
        
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showQuizResults(answers, modal) {
        const recommended = this.calculateRecommendation(answers);
        const tier = this.getTierName(recommended);
        
        modal.querySelector('.quiz-content').innerHTML = `
            <div class="quiz-results">
                <div class="results-header">
                    <i class="fas fa-trophy"></i>
                    <h2>Your Perfect Match!</h2>
                </div>
                
                <div class="recommended-coach-result">
                    <img src="${recommended.avatar}" alt="${recommended.name}" class="result-avatar">
                    <h3>${recommended.name}</h3>
                    <p class="result-specialty">${recommended.specialty}</p>
                    <div class="tier-badge tier-${tier.toLowerCase()}">${tier}</div>
                </div>
                
                <div class="result-description">
                    <h4>Why this coach is perfect for you:</h4>
                    <p>${this.getQuizResultReason(recommended, answers)}</p>
                </div>
                
                <div class="result-actions">
                    ${!this.hasAccess(recommended) ? `
                        <button class="result-btn primary" data-coach-id="${recommended.id}">
                            <i class="fas fa-unlock"></i>
                            Unlock ${recommended.name}
                        </button>
                    ` : `
                        <button class="result-btn primary" onclick="window.location.href='#coaching'">
                            <i class="fas fa-eye"></i>
                            View Predictions
                        </button>
                    `}
                    <button class="result-btn secondary" id="retake-quiz">
                        <i class="fas fa-redo"></i>
                        Retake Quiz
                    </button>
                </div>
            </div>
        `;
        
        // Attach event handlers
        const retakeBtn = modal.querySelector('#retake-quiz');
        if (retakeBtn) {
            retakeBtn.addEventListener('click', () => {
                modal.remove();
                this.showQuiz();
            });
        }
        
        const unlockBtn = modal.querySelector('[data-coach-id]');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => {
                const tier = this.getTierForCoach(recommended);
                paywallSystem.showUpgradePrompt(tier, recommended.name);
                modal.remove();
            });
        }
    }

    calculateRecommendation(answers) {
        const coaches = Object.values(this.engine.coaches);
        
        // Simple scoring based on answers
        if (answers.timing === 'live') {
            return coaches.find(c => c.id === 'momentum');
        }
        
        if (answers.focus === 'roi') {
            return coaches.find(c => c.id === 'value');
        }
        
        if (answers.focus === 'confidence' || answers.experience === 'beginner') {
            return coaches.find(c => c.id === 'neural');
        }
        
        if (answers.style === 'aggressive') {
            return coaches.find(c => c.id === 'sharp');
        }
        
        return coaches.find(c => c.id === 'quantum');
    }

    getQuizResultReason(coach, answers) {
        const reasons = {
            quantum: `Based on your answers, ${coach.name} is perfect because it provides solid statistical analysis ${answers.experience === 'beginner' ? 'ideal for beginners' : 'with proven results'}. ${answers.style === 'conservative' ? 'Its conservative approach matches your betting style.' : ''}`,
            
            sharp: `${coach.name} matches your ${answers.style} betting style perfectly. ${answers.focus === 'roi' ? 'Following sharp money indicators will help maximize your ROI.' : 'You\'ll benefit from seeing where professional money is going.'}`,
            
            neural: `With the highest confidence ratings, ${coach.name} is ideal ${answers.focus === 'confidence' ? 'since you prioritize high-certainty picks' : 'for data-driven decisions'}. ${answers.experience === 'beginner' ? 'Perfect for building confidence as you learn.' : ''}`,
            
            value: `${coach.name} aligns perfectly with your focus on ${answers.focus === 'roi' ? 'long-term ROI' : 'finding betting value'}. ${answers.experience === 'advanced' ? 'Its sophisticated EV calculations match your experience level.' : ''}`,
            
            momentum: `Since you prefer ${answers.timing} betting, ${coach.name} specializes in ${answers.timing === 'live' ? 'in-game momentum shifts and live opportunities' : 'identifying optimal betting moments'}. ${answers.style === 'aggressive' ? 'Perfect for your aggressive style.' : ''}`
        };
        
        return reasons[coach.id] || coach.description;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    hasAccess(coach) {
        if (!coach.premium) return true;
        return subscriptionHelper.canAccessCoach(coach.id);
    }

    getTierName(coach) {
        if (!coach.premium) return 'FREE';
        
        const tierMap = {
            'quantum': 'FREE',
            'sharp': 'PRO',
            'neural': 'PRO',
            'value': 'VIP',
            'momentum': 'VIP'
        };
        
        return tierMap[coach.id] || 'PRO';
    }

    getTierForCoach(coach) {
        return this.getTierName(coach).toLowerCase();
    }

    formatAlgorithmName(algorithm) {
        const names = {
            'quantum_neural': 'Quantum Neural Network',
            'market_dynamics': 'Market Dynamics',
            'deep_neural': 'Deep Neural Network',
            'value_optimization': 'Value Optimization',
            'momentum_tracking': 'Momentum Tracking'
        };
        
        return names[algorithm] || algorithm;
    }

    renderActionButton(coach, hasAccess) {
        if (hasAccess) {
            return `
                <button class="coach-action-btn view" data-coach-id="${coach.id}">
                    <i class="fas fa-eye"></i>
                    <span>View Predictions</span>
                </button>
            `;
        }
        
        const tier = this.getTierForCoach(coach);
        return `
            <button class="coach-action-btn unlock" data-tier="${tier}" data-coach-id="${coach.id}">
                <i class="fas fa-unlock"></i>
                <span>Unlock ${tier === 'pro' ? 'PRO' : 'VIP'}</span>
            </button>
        `;
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    attachEventHandlers(container) {
        // Tab switching
        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.comparisonMode = btn.dataset.mode;
                this.updateContent(container);
            });
        });

        // Quiz button
        const quizBtn = container.querySelector('#take-quiz-btn');
        if (quizBtn) {
            quizBtn.addEventListener('click', () => this.showQuiz());
        }

        // Unlock buttons
        container.addEventListener('click', (e) => {
            const unlockBtn = e.target.closest('.unlock, .recommendation-cta, [data-tier]');
            if (unlockBtn) {
                const tier = unlockBtn.dataset.tier || this.getTierForCoach(this.engine.coaches[unlockBtn.dataset.coachId]);
                paywallSystem.showUpgradePrompt(tier, 'AI Coach Access');
            }

            // View predictions
            const viewBtn = e.target.closest('.view');
            if (viewBtn) {
                window.location.hash = 'coaching';
            }
        });

        // Filters
        const accessFilter = container.querySelector('#access-filter');
        const sortFilter = container.querySelector('#sort-filter');
        
        if (accessFilter) {
            accessFilter.addEventListener('change', () => this.applyFilters(container));
        }
        
        if (sortFilter) {
            sortFilter.addEventListener('change', () => this.applySort(container));
        }
    }

    updateContent(container) {
        const contentDiv = container.querySelector('#comparison-content');
        contentDiv.innerHTML = this.renderComparisonContent();
    }

    applyFilters(container) {
        // Filter logic here
        this.updateContent(container);
    }

    applySort(container) {
        // Sort logic here
        this.updateContent(container);
    }

    loadUserPreferences() {
        const saved = localStorage.getItem('coach_preferences');
        return saved ? JSON.parse(saved) : {
            prefersHighConfidence: false,
            prefersValue: false,
            bettingStyle: 'balanced'
        };
    }

    saveUserPreferences(prefs) {
        localStorage.setItem('coach_preferences', JSON.stringify(prefs));
        this.userPreferences = prefs;
    }
}

// Export singleton
export const aiCoachComparison = new AICoachComparison();
