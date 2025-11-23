// ============================================
// TEMPLATE PERFORMANCE TRACKER
// Track success rates and analytics for parlay templates
// ============================================

import { betHistoryTracker } from './bet-history-tracker.js';

export class TemplatePerformanceTracker {
    constructor() {
        this.storageKey = 'sports_ai_template_performance';
        this.templateStats = new Map();
        this.init();
    }

    init() {
        this.loadPerformanceData();
        this.listenForBets();
        console.log('📈 Template Performance Tracker initialized');
    }

    // ============================================
    // BET ATTRIBUTION
    // ============================================

    listenForBets() {
        // Listen for new bets being placed
        window.addEventListener('betPlaced', (e) => {
            const bet = e.detail;
            if (bet.templateId) {
                this.attributeBetToTemplate(bet.templateId, bet.id);
            }
        });

        // Listen for bet settlements
        window.addEventListener('betSettled', (e) => {
            const bet = e.detail;
            if (bet.templateId) {
                this.updateTemplatePerformance(bet.templateId, bet);
            }
        });
    }

    attributeBetToTemplate(templateId, betId) {
        if (!this.templateStats.has(templateId)) {
            this.initializeTemplate(templateId);
        }

        const stats = this.templateStats.get(templateId);
        stats.totalBets++;
        stats.betIds.push(betId);
        stats.lastUsed = Date.now();

        this.savePerformanceData();
        this.dispatchEvent('templateUsed', { templateId, stats });
    }

    updateTemplatePerformance(templateId, bet) {
        if (!this.templateStats.has(templateId)) {
            this.initializeTemplate(templateId);
        }

        const stats = this.templateStats.get(templateId);

        // Update settled counts
        stats.settledBets++;

        if (bet.status === 'won') {
            stats.wins++;
            stats.totalProfit += bet.profit || 0;
        } else if (bet.status === 'lost') {
            stats.losses++;
            stats.totalProfit += bet.profit || 0; // Negative profit
        } else if (bet.status === 'push') {
            stats.pushes++;
        }

        // Update wagered amount
        stats.totalWagered += bet.wager;

        // Update win rate
        stats.winRate = stats.settledBets > 0 
            ? (stats.wins / stats.settledBets) * 100 
            : 0;

        // Update ROI
        stats.roi = stats.totalWagered > 0 
            ? (stats.totalProfit / stats.totalWagered) * 100 
            : 0;

        // Update average profit per bet
        stats.avgProfitPerBet = stats.settledBets > 0 
            ? stats.totalProfit / stats.settledBets 
            : 0;

        // Track streak
        this.updateStreak(stats, bet.status);

        // Update last result
        stats.lastResult = {
            status: bet.status,
            profit: bet.profit,
            date: bet.settledDate || Date.now()
        };

        this.savePerformanceData();
        this.dispatchEvent('templateUpdated', { templateId, stats });
    }

    updateStreak(stats, status) {
        if (status === 'won') {
            stats.currentWinStreak++;
            stats.currentLoseStreak = 0;
            stats.longestWinStreak = Math.max(stats.longestWinStreak, stats.currentWinStreak);
        } else if (status === 'lost') {
            stats.currentLoseStreak++;
            stats.currentWinStreak = 0;
            stats.longestLoseStreak = Math.max(stats.longestLoseStreak, stats.currentLoseStreak);
        }
    }

    // ============================================
    // TEMPLATE INITIALIZATION
    // ============================================

    initializeTemplate(templateId) {
        this.templateStats.set(templateId, {
            templateId,
            totalBets: 0,
            settledBets: 0,
            wins: 0,
            losses: 0,
            pushes: 0,
            winRate: 0,
            totalWagered: 0,
            totalProfit: 0,
            roi: 0,
            avgProfitPerBet: 0,
            currentWinStreak: 0,
            currentLoseStreak: 0,
            longestWinStreak: 0,
            longestLoseStreak: 0,
            betIds: [],
            lastUsed: Date.now(),
            lastResult: null,
            createdAt: Date.now()
        });
    }

    // ============================================
    // DATA RETRIEVAL
    // ============================================

    getTemplateStats(templateId) {
        return this.templateStats.get(templateId) || this.initializeAndReturn(templateId);
    }

    initializeAndReturn(templateId) {
        this.initializeTemplate(templateId);
        return this.templateStats.get(templateId);
    }

    getAllTemplateStats() {
        return Array.from(this.templateStats.values());
    }

    getTopPerformingTemplates(limit = 10) {
        return this.getAllTemplateStats()
            .filter(stats => stats.settledBets >= 3) // Minimum sample size
            .sort((a, b) => {
                // Sort by ROI, then win rate
                if (Math.abs(b.roi - a.roi) > 5) {
                    return b.roi - a.roi;
                }
                return b.winRate - a.winRate;
            })
            .slice(0, limit);
    }

    getWorstPerformingTemplates(limit = 5) {
        return this.getAllTemplateStats()
            .filter(stats => stats.settledBets >= 3)
            .sort((a, b) => a.roi - b.roi)
            .slice(0, limit);
    }

    getMostUsedTemplates(limit = 10) {
        return this.getAllTemplateStats()
            .sort((a, b) => b.totalBets - a.totalBets)
            .slice(0, limit);
    }

    getRecentlyUsedTemplates(limit = 5) {
        return this.getAllTemplateStats()
            .sort((a, b) => b.lastUsed - a.lastUsed)
            .slice(0, limit);
    }

    getTemplatesByWinRate(minBets = 3) {
        return this.getAllTemplateStats()
            .filter(stats => stats.settledBets >= minBets)
            .sort((a, b) => b.winRate - a.winRate);
    }

    getTemplatesByProfit(minBets = 3) {
        return this.getAllTemplateStats()
            .filter(stats => stats.settledBets >= minBets)
            .sort((a, b) => b.totalProfit - a.totalProfit);
    }

    // ============================================
    // ANALYTICS & INSIGHTS
    // ============================================

    getOverallTemplateStats() {
        const allStats = this.getAllTemplateStats();
        
        const totals = allStats.reduce((acc, stats) => ({
            totalTemplates: acc.totalTemplates + 1,
            totalBets: acc.totalBets + stats.totalBets,
            settledBets: acc.settledBets + stats.settledBets,
            wins: acc.wins + stats.wins,
            losses: acc.losses + stats.losses,
            totalWagered: acc.totalWagered + stats.totalWagered,
            totalProfit: acc.totalProfit + stats.totalProfit
        }), {
            totalTemplates: 0,
            totalBets: 0,
            settledBets: 0,
            wins: 0,
            losses: 0,
            totalWagered: 0,
            totalProfit: 0
        });

        return {
            ...totals,
            winRate: totals.settledBets > 0 ? (totals.wins / totals.settledBets) * 100 : 0,
            roi: totals.totalWagered > 0 ? (totals.totalProfit / totals.totalWagered) * 100 : 0,
            avgBetsPerTemplate: totals.totalTemplates > 0 ? totals.totalBets / totals.totalTemplates : 0
        };
    }

    getTemplateComparison(templateId1, templateId2) {
        const stats1 = this.getTemplateStats(templateId1);
        const stats2 = this.getTemplateStats(templateId2);

        return {
            template1: stats1,
            template2: stats2,
            comparison: {
                winRateDiff: stats1.winRate - stats2.winRate,
                roiDiff: stats1.roi - stats2.roi,
                profitDiff: stats1.totalProfit - stats2.totalProfit,
                betCountDiff: stats1.totalBets - stats2.totalBets
            }
        };
    }

    getTemplateRecommendations() {
        const recommendations = [];
        const allStats = this.getAllTemplateStats();

        // Find consistently winning templates
        const consistentWinners = allStats.filter(stats => 
            stats.settledBets >= 5 && 
            stats.winRate >= 60 && 
            stats.roi > 10
        );

        if (consistentWinners.length > 0) {
            recommendations.push({
                type: 'hot',
                title: 'Hot Templates',
                description: 'These templates have been performing exceptionally well',
                templates: consistentWinners.sort((a, b) => b.roi - a.roi).slice(0, 3)
            });
        }

        // Find templates to avoid
        const underperformers = allStats.filter(stats => 
            stats.settledBets >= 5 && 
            (stats.winRate < 40 || stats.roi < -20)
        );

        if (underperformers.length > 0) {
            recommendations.push({
                type: 'cold',
                title: 'Cold Templates',
                description: 'These templates have been underperforming recently',
                templates: underperformers.sort((a, b) => a.roi - b.roi).slice(0, 3)
            });
        }

        // Find templates on winning streaks
        const hotStreaks = allStats.filter(stats => 
            stats.currentWinStreak >= 3
        );

        if (hotStreaks.length > 0) {
            recommendations.push({
                type: 'streak',
                title: 'On Fire',
                description: 'These templates are currently on winning streaks',
                templates: hotStreaks.sort((a, b) => b.currentWinStreak - a.currentWinStreak).slice(0, 3)
            });
        }

        return recommendations;
    }

    getPerformanceTrend(templateId, days = 30) {
        const stats = this.getTemplateStats(templateId);
        const bets = stats.betIds
            .map(betId => betHistoryTracker.getBetById(betId))
            .filter(bet => bet && bet.settledDate)
            .filter(bet => {
                const daysSinceSettled = (Date.now() - bet.settledDate) / (1000 * 60 * 60 * 24);
                return daysSinceSettled <= days;
            });

        // Group by day
        const trendData = [];
        for (let i = days - 1; i >= 0; i--) {
            const dayStart = Date.now() - (i * 24 * 60 * 60 * 1000);
            const dayEnd = dayStart + (24 * 60 * 60 * 1000);
            
            const dayBets = bets.filter(bet => 
                bet.settledDate >= dayStart && bet.settledDate < dayEnd
            );

            const dayWins = dayBets.filter(b => b.status === 'won').length;
            const dayProfit = dayBets.reduce((sum, b) => sum + (b.profit || 0), 0);

            trendData.push({
                date: new Date(dayStart).toISOString().split('T')[0],
                bets: dayBets.length,
                wins: dayWins,
                profit: dayProfit,
                winRate: dayBets.length > 0 ? (dayWins / dayBets.length) * 100 : 0
            });
        }

        return trendData;
    }

    // ============================================
    // CUSTOM TEMPLATES
    // ============================================

    saveCustomTemplate(templateName, templateData) {
        const customId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const customTemplate = {
            id: customId,
            name: templateName,
            isCustom: true,
            createdAt: Date.now(),
            ...templateData
        };

        // Initialize stats for this custom template
        this.initializeTemplate(customId);

        // Save to templates storage
        const customTemplates = this.loadCustomTemplates();
        customTemplates.push(customTemplate);
        this.saveCustomTemplates(customTemplates);

        return customTemplate;
    }

    loadCustomTemplates() {
        try {
            const saved = localStorage.getItem('sports_ai_custom_templates');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load custom templates:', error);
            return [];
        }
    }

    saveCustomTemplates(templates) {
        try {
            localStorage.setItem('sports_ai_custom_templates', JSON.stringify(templates));
        } catch (error) {
            console.error('Failed to save custom templates:', error);
        }
    }

    deleteCustomTemplate(templateId) {
        const customTemplates = this.loadCustomTemplates();
        const filtered = customTemplates.filter(t => t.id !== templateId);
        this.saveCustomTemplates(filtered);
        
        // Also remove performance data
        this.templateStats.delete(templateId);
        this.savePerformanceData();
    }

    // ============================================
    // PERSISTENCE
    // ============================================

    savePerformanceData() {
        try {
            const data = {
                version: 1,
                lastUpdated: Date.now(),
                stats: Array.from(this.templateStats.entries())
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save template performance data:', error);
        }
    }

    loadPerformanceData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.templateStats = new Map(data.stats);
                console.log(`📦 Loaded performance data for ${this.templateStats.size} templates`);
            }
        } catch (error) {
            console.error('Failed to load template performance data:', error);
            this.templateStats = new Map();
        }
    }

    clearPerformanceData() {
        this.templateStats.clear();
        this.savePerformanceData();
        this.dispatchEvent('performanceCleared', null);
    }

    exportPerformanceData() {
        return {
            exportDate: new Date().toISOString(),
            totalTemplates: this.templateStats.size,
            overallStats: this.getOverallTemplateStats(),
            templateStats: this.getAllTemplateStats()
        };
    }

    // ============================================
    // UTILITIES
    // ============================================

    dispatchEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }

    formatPercentage(value) {
        return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
}

// Export singleton instance
export const templatePerformanceTracker = new TemplatePerformanceTracker();
