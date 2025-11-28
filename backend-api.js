// ============================================
// BACKEND API SERVICE
// Centralized API calls to Railway backend
// ============================================

const BackendAPI = {
    apiUrl: null,
    
    init() {
        this.apiUrl = window.APP_CONFIG?.API?.BASE_URL || 'https://ultimate-sports-ai-backend-production.up.railway.app';
        console.log('📡 Backend API initialized:', this.apiUrl);
    },
    
    // Test backend connection
    async testConnection() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch(`${this.apiUrl}/health`, {
                signal: controller.signal,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                console.warn(`⚠️ Backend health check returned ${response.status}`);
                return { status: 'unknown', statusCode: response.status };
            }
            
            const data = await response.json();
            console.log('✅ Backend connection successful:', data);
            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('⚠️ Backend connection timeout - backend may be starting');
            } else {
                console.warn('⚠️ Backend connection failed (will use demo data):', error.message);
            }
            // Return a safe fallback instead of throwing
            return { status: 'disconnected', message: 'Using demo data' };
        }
    },
    
    // Get AI Coaches (mock data for now - will be real later)
    async getAICoaches() {
        try {
            console.log('📊 Fetching AI coaches...');
            
            // For now, return demo data since backend doesn't have coaches endpoint yet
            // TODO: Create /api/ai-coaches endpoint on backend later
            return this.getDemoAICoaches();
        } catch (error) {
            console.error('❌ Error fetching AI coaches:', error);
            return this.getDemoAICoaches(); // Fallback to demo
        }
    },
    
    // Get live games
    async getLiveGames() {
        try {
            const response = await fetch(`${this.apiUrl}/api/test/games`);
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Live games fetched:', data.data.games.length);
                return data.data.games;
            }
            
            throw new Error('Failed to fetch games');
        } catch (error) {
            console.error('❌ Error fetching live games:', error);
            return [];
        }
    },
    
    // Get user analytics (requires auth)
    async getUserAnalytics() {
        try {
            if (!window.AuthService?.isAuthenticated()) {
                console.log('⚠️ Not authenticated - skipping analytics');
                return null;
            }
            
            const data = await window.AuthService.authenticatedFetch('/api/analytics/summary');
            console.log('✅ User analytics fetched');
            return data.summary;
        } catch (error) {
            console.error('❌ Error fetching analytics:', error);
            return null;
        }
    },
    
    // Demo AI coaches data (fallback)
    getDemoAICoaches() {
        return [
            {
                id: 1,
                name: 'The Analyst',
                specialty: 'NBA',
                avatar: '🤖',
                tier: 'PRO',
                accuracy: 68.5,
                totalPicks: 247,
                streak: 5,
                description: 'Data-driven NBA predictions using advanced analytics',
                recentPicks: [
                    {
                        game: 'Lakers vs Warriors',
                        pick: 'Lakers -4.5',
                        odds: -110,
                        confidence: 85,
                        reasoning: 'Lakers have won 7 of last 10 home games. Warriors missing key defender.'
                    }
                ]
            },
            {
                id: 2,
                name: 'Sharp Shooter',
                specialty: 'NFL',
                avatar: '🏈',
                tier: 'VIP',
                accuracy: 72.3,
                totalPicks: 189,
                streak: 8,
                description: 'Elite NFL betting expert with proven track record',
                recentPicks: [
                    {
                        game: 'Chiefs vs Bills',
                        pick: 'Chiefs ML',
                        odds: +145,
                        confidence: 91,
                        reasoning: 'Mahomes 14-2 ATS as underdog. Elite playoff experience edge.'
                    }
                ]
            },
            {
                id: 3,
                name: 'Data Dragon',
                specialty: 'MLB',
                avatar: '⚾',
                tier: 'PRO',
                accuracy: 65.8,
                totalPicks: 412,
                streak: 3,
                description: 'Statistical analysis for baseball betting',
                recentPicks: [
                    {
                        game: 'Yankees vs Red Sox',
                        pick: 'Yankees -1.5',
                        odds: +155,
                        confidence: 73,
                        reasoning: 'Yankees pitcher has 0.98 ERA in last 4 starts vs Red Sox.'
                    }
                ]
            },
            {
                id: 4,
                name: 'Ice Breaker',
                specialty: 'NHL',
                avatar: '🏒',
                tier: 'VIP',
                accuracy: 70.1,
                totalPicks: 298,
                streak: 6,
                description: 'Hockey insider with real-time injury intel',
                recentPicks: [
                    {
                        game: 'Avalanche vs Golden Knights',
                        pick: 'Over 6.5',
                        odds: -120,
                        confidence: 82,
                        reasoning: 'Both teams top 5 in goals per game. High-scoring rivalry history.'
                    }
                ]
            },
            {
                id: 5,
                name: 'Court Vision',
                specialty: 'Tennis',
                avatar: '🎾',
                tier: 'PRO',
                accuracy: 67.2,
                totalPicks: 156,
                streak: 4,
                description: 'Tennis match predictions with surface analysis',
                recentPicks: [
                    {
                        game: 'Djokovic vs Alcaraz',
                        pick: 'Djokovic ML',
                        odds: -145,
                        confidence: 79,
                        reasoning: 'Djokovic dominant on clay courts. 18-2 record in Grand Slam finals.'
                    }
                ]
            },
            {
                id: 6,
                name: 'Goal Getter',
                specialty: 'Soccer',
                avatar: '⚽',
                tier: 'VIP',
                accuracy: 71.5,
                totalPicks: 334,
                streak: 7,
                description: 'European soccer expert with tactical insights',
                recentPicks: [
                    {
                        game: 'Man City vs Liverpool',
                        pick: 'Both Teams Score',
                        odds: -135,
                        confidence: 88,
                        reasoning: 'Both teams scored in 9 of last 10 meetings. Elite attacking sides.'
                    }
                ]
            }
        ];
    }
};

// Initialize
BackendAPI.init();

// Export globally
window.BackendAPI = BackendAPI;

console.log('📦 Backend API loaded');
