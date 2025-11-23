// ============================================
// BET SLIP TEMPLATES
// Pre-built parlay templates for quick betting
// ============================================

export class BetSlipTemplates {
    constructor() {
        this.templates = this.loadTemplates();
        this.categories = ['popular', 'safe', 'risky', 'favorites', 'underdogs', 'totals'];
    }

    // ============================================
    // TEMPLATE DEFINITIONS
    // ============================================

    loadTemplates() {
        return [
            {
                id: 'favorites-parlay',
                name: 'Favorites Parlay',
                category: 'favorites',
                description: 'All favorites to win - safe but lower payout',
                picks: [
                    {
                        id: 'g1-ml-home',
                        type: 'moneyline',
                        selection: 'Lakers ML',
                        odds: -150,
                        context: 'Warriors @ Lakers',
                        league: 'NBA'
                    },
                    {
                        id: 'g2-ml-home',
                        type: 'moneyline',
                        selection: 'Celtics ML',
                        odds: -180,
                        context: 'Heat @ Celtics',
                        league: 'NBA'
                    },
                    {
                        id: 'g3-ml-home',
                        type: 'moneyline',
                        selection: 'Chiefs ML',
                        odds: -240,
                        context: '49ers @ Chiefs',
                        league: 'NFL'
                    }
                ],
                wagerAmount: 50,
                expectedOdds: -110,
                confidence: 75,
                icon: '🛡️'
            },
            {
                id: 'underdog-special',
                name: 'Underdog Special',
                category: 'underdogs',
                description: 'High risk, high reward underdog picks',
                picks: [
                    {
                        id: 'g1-ml-away',
                        type: 'moneyline',
                        selection: 'Warriors ML',
                        odds: +130,
                        context: 'Warriors @ Lakers',
                        league: 'NBA'
                    },
                    {
                        id: 'g2-ml-away',
                        type: 'moneyline',
                        selection: 'Heat ML',
                        odds: +155,
                        context: 'Heat @ Celtics',
                        league: 'NBA'
                    }
                ],
                wagerAmount: 25,
                expectedOdds: +420,
                confidence: 35,
                icon: '🎲'
            },
            {
                id: 'spread-master',
                name: 'Spread Master',
                category: 'popular',
                description: 'Point spreads for balanced action',
                picks: [
                    {
                        id: 'g1-spread-home',
                        type: 'spread',
                        selection: 'Lakers -3.5',
                        odds: -110,
                        context: 'Warriors @ Lakers',
                        league: 'NBA'
                    },
                    {
                        id: 'g2-spread-away',
                        type: 'spread',
                        selection: 'Heat +4.5',
                        odds: -110,
                        context: 'Heat @ Celtics',
                        league: 'NBA'
                    },
                    {
                        id: 'g3-spread-home',
                        type: 'spread',
                        selection: 'Chiefs -6.5',
                        odds: -110,
                        context: '49ers @ Chiefs',
                        league: 'NFL'
                    }
                ],
                wagerAmount: 40,
                expectedOdds: +595,
                confidence: 60,
                icon: '📊'
            },
            {
                id: 'over-under-combo',
                name: 'Over/Under Combo',
                category: 'totals',
                description: 'Mix of overs and unders for variety',
                picks: [
                    {
                        id: 'g1-over',
                        type: 'total',
                        selection: 'Over 225.5',
                        odds: -110,
                        context: 'Warriors @ Lakers',
                        league: 'NBA'
                    },
                    {
                        id: 'g2-under',
                        type: 'total',
                        selection: 'Under 218.5',
                        odds: -110,
                        context: 'Heat @ Celtics',
                        league: 'NBA'
                    },
                    {
                        id: 'g3-over',
                        type: 'total',
                        selection: 'Over 47.5',
                        odds: -110,
                        context: '49ers @ Chiefs',
                        league: 'NFL'
                    }
                ],
                wagerAmount: 30,
                expectedOdds: +595,
                confidence: 55,
                icon: '🎯'
            },
            {
                id: 'safe-2-pick',
                name: 'Safe 2-Pick',
                category: 'safe',
                description: 'Conservative two-team parlay',
                picks: [
                    {
                        id: 'g1-ml-home',
                        type: 'moneyline',
                        selection: 'Lakers ML',
                        odds: -150,
                        context: 'Warriors @ Lakers',
                        league: 'NBA'
                    },
                    {
                        id: 'g3-ml-home',
                        type: 'moneyline',
                        selection: 'Chiefs ML',
                        odds: -240,
                        context: '49ers @ Chiefs',
                        league: 'NFL'
                    }
                ],
                wagerAmount: 100,
                expectedOdds: -105,
                confidence: 80,
                icon: '✅'
            },
            {
                id: 'high-roller',
                name: 'High Roller',
                category: 'risky',
                description: '5-leg parlay for maximum payout',
                picks: [
                    {
                        id: 'g1-ml-home',
                        type: 'moneyline',
                        selection: 'Lakers ML',
                        odds: -150,
                        context: 'Warriors @ Lakers',
                        league: 'NBA'
                    },
                    {
                        id: 'g1-over',
                        type: 'total',
                        selection: 'Over 225.5',
                        odds: -110,
                        context: 'Warriors @ Lakers',
                        league: 'NBA'
                    },
                    {
                        id: 'g2-spread-home',
                        type: 'spread',
                        selection: 'Celtics -4.5',
                        odds: -110,
                        context: 'Heat @ Celtics',
                        league: 'NBA'
                    },
                    {
                        id: 'g3-ml-home',
                        type: 'moneyline',
                        selection: 'Chiefs ML',
                        odds: -240,
                        context: '49ers @ Chiefs',
                        league: 'NFL'
                    },
                    {
                        id: 'g3-over',
                        type: 'total',
                        selection: 'Over 47.5',
                        odds: -110,
                        context: '49ers @ Chiefs',
                        league: 'NFL'
                    }
                ],
                wagerAmount: 20,
                expectedOdds: +850,
                confidence: 45,
                icon: '💎'
            },
            {
                id: 'nba-only',
                name: 'NBA Only',
                category: 'popular',
                description: 'All NBA games parlay',
                picks: [
                    {
                        id: 'g1-ml-home',
                        type: 'moneyline',
                        selection: 'Lakers ML',
                        odds: -150,
                        context: 'Warriors @ Lakers',
                        league: 'NBA'
                    },
                    {
                        id: 'g1-over',
                        type: 'total',
                        selection: 'Over 225.5',
                        odds: -110,
                        context: 'Warriors @ Lakers',
                        league: 'NBA'
                    },
                    {
                        id: 'g2-ml-home',
                        type: 'moneyline',
                        selection: 'Celtics ML',
                        odds: -180,
                        context: 'Heat @ Celtics',
                        league: 'NBA'
                    }
                ],
                wagerAmount: 50,
                expectedOdds: +285,
                confidence: 65,
                icon: '🏀'
            },
            {
                id: 'balanced-mix',
                name: 'Balanced Mix',
                category: 'popular',
                description: 'Mix of favorites and spreads',
                picks: [
                    {
                        id: 'g1-ml-home',
                        type: 'moneyline',
                        selection: 'Lakers ML',
                        odds: -150,
                        context: 'Warriors @ Lakers',
                        league: 'NBA'
                    },
                    {
                        id: 'g2-spread-home',
                        type: 'spread',
                        selection: 'Celtics -4.5',
                        odds: -110,
                        context: 'Heat @ Celtics',
                        league: 'NBA'
                    },
                    {
                        id: 'g3-over',
                        type: 'total',
                        selection: 'Over 47.5',
                        odds: -110,
                        context: '49ers @ Chiefs',
                        league: 'NFL'
                    }
                ],
                wagerAmount: 40,
                expectedOdds: +445,
                confidence: 58,
                icon: '⚖️'
            },
            {
                id: 'totals-only',
                name: 'Totals Only',
                category: 'totals',
                description: 'All overs for high-scoring games',
                picks: [
                    {
                        id: 'g1-over',
                        type: 'total',
                        selection: 'Over 225.5',
                        odds: -110,
                        context: 'Warriors @ Lakers',
                        league: 'NBA'
                    },
                    {
                        id: 'g2-over',
                        type: 'total',
                        selection: 'Over 218.5',
                        odds: -110,
                        context: 'Heat @ Celtics',
                        league: 'NBA'
                    },
                    {
                        id: 'g3-over',
                        type: 'total',
                        selection: 'Over 47.5',
                        odds: -110,
                        context: '49ers @ Chiefs',
                        league: 'NFL'
                    }
                ],
                wagerAmount: 35,
                expectedOdds: +595,
                confidence: 50,
                icon: '📈'
            },
            {
                id: 'quick-double',
                name: 'Quick Double',
                category: 'safe',
                description: 'Simple 2-pick for beginners',
                picks: [
                    {
                        id: 'g1-ml-home',
                        type: 'moneyline',
                        selection: 'Lakers ML',
                        odds: -150,
                        context: 'Warriors @ Lakers',
                        league: 'NBA'
                    },
                    {
                        id: 'g2-ml-home',
                        type: 'moneyline',
                        selection: 'Celtics ML',
                        odds: -180,
                        context: 'Heat @ Celtics',
                        league: 'NBA'
                    }
                ],
                wagerAmount: 50,
                expectedOdds: +110,
                confidence: 70,
                icon: '⚡'
            }
        ];
    }

    // ============================================
    // TEMPLATE RETRIEVAL
    // ============================================

    getAllTemplates() {
        return this.templates;
    }

    getTemplatesByCategory(category) {
        if (category === 'all') return this.templates;
        return this.templates.filter(t => t.category === category);
    }

    getTemplateById(id) {
        return this.templates.find(t => t.id === id);
    }

    getCategories() {
        return [
            { id: 'all', name: 'All Templates', icon: '📋' },
            { id: 'popular', name: 'Popular', icon: '🔥' },
            { id: 'safe', name: 'Safe Bets', icon: '✅' },
            { id: 'risky', name: 'High Risk', icon: '🎲' },
            { id: 'favorites', name: 'Favorites', icon: '🛡️' },
            { id: 'underdogs', name: 'Underdogs', icon: '🚀' },
            { id: 'totals', name: 'Totals', icon: '📊' }
        ];
    }

    // ============================================
    // TEMPLATE OPERATIONS
    // ============================================

    calculateTemplateOdds(template) {
        if (template.picks.length === 0) return 0;
        
        let decimalOdds = 1;
        for (const pick of template.picks) {
            const decimal = pick.odds > 0 
                ? (pick.odds / 100) + 1 
                : (100 / Math.abs(pick.odds)) + 1;
            decimalOdds *= decimal;
        }

        const american = decimalOdds >= 2 
            ? Math.round((decimalOdds - 1) * 100)
            : Math.round(-100 / (decimalOdds - 1));

        return american;
    }

    calculatePotentialPayout(template) {
        const odds = this.calculateTemplateOdds(template);
        const wager = template.wagerAmount;

        if (odds > 0) {
            return wager * (odds / 100) + wager;
        } else {
            return wager * (100 / Math.abs(odds)) + wager;
        }
    }

    // ============================================
    // CUSTOM TEMPLATES
    // ============================================

    saveCustomTemplate(name, picks, wagerAmount) {
        const customTemplate = {
            id: `custom-${Date.now()}`,
            name: name,
            category: 'custom',
            description: 'Custom template',
            picks: picks,
            wagerAmount: wagerAmount,
            expectedOdds: this.calculateTemplateOdds({ picks }),
            confidence: 50,
            icon: '⭐',
            isCustom: true,
            createdAt: Date.now()
        };

        // Save to localStorage
        const customTemplates = this.loadCustomTemplates();
        customTemplates.push(customTemplate);
        localStorage.setItem('custom_bet_templates', JSON.stringify(customTemplates));

        return customTemplate;
    }

    loadCustomTemplates() {
        try {
            const stored = localStorage.getItem('custom_bet_templates');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load custom templates:', error);
            return [];
        }
    }

    deleteCustomTemplate(id) {
        const customTemplates = this.loadCustomTemplates();
        const filtered = customTemplates.filter(t => t.id !== id);
        localStorage.setItem('custom_bet_templates', JSON.stringify(filtered));
    }

    getAllTemplatesWithCustom() {
        return [...this.templates, ...this.loadCustomTemplates()];
    }

    // ============================================
    // SEARCH & FILTER
    // ============================================

    searchTemplates(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllTemplatesWithCustom().filter(t => 
            t.name.toLowerCase().includes(lowerQuery) ||
            t.description.toLowerCase().includes(lowerQuery) ||
            t.picks.some(p => p.selection.toLowerCase().includes(lowerQuery))
        );
    }

    filterByPickCount(min, max) {
        return this.getAllTemplatesWithCustom().filter(t => 
            t.picks.length >= min && t.picks.length <= max
        );
    }

    filterByConfidence(minConfidence) {
        return this.getAllTemplatesWithCustom().filter(t => 
            t.confidence >= minConfidence
        );
    }

    filterByLeague(league) {
        return this.getAllTemplatesWithCustom().filter(t =>
            t.picks.some(p => p.league === league)
        );
    }
}

// Create singleton instance
export const betSlipTemplates = new BetSlipTemplates();

// Make available globally for testing
if (typeof window !== 'undefined') {
    window.betSlipTemplates = betSlipTemplates;
}
