// ============================================
// AI COACHES - DEMO DATA & UI RENDERER
// Displays AI coach predictions with live data
// ============================================

// Demo AI coaches data (fallback if backend is unavailable)
const DEMO_AI_COACHES = [
    {
        id: 1,
        name: 'The Analyst',
        specialty: 'NBA',
        avatar: '🤖',
        tier: 'PRO',
        accuracy: 68.5,
        totalPicks: 247,
        streak: 5,
        recentPicks: [
            {
                game: 'Lakers vs Warriors',
                pick: 'Lakers -4.5',
                odds: -110,
                confidence: 85,
                reasoning: 'Lakers have won 7 of last 10 home games. Warriors missing key defender.'
            },
            {
                game: 'Celtics vs Heat',
                pick: 'Over 218.5',
                odds: -105,
                confidence: 78,
                reasoning: 'Both teams averaging 115+ PPG in last 5 games. Fast-paced matchup.'
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

// Render AI Coaches UI
async function renderAICoaches(coaches = null) {
    // Fetch coaches from backend if not provided
    if (!coaches && window.BackendAPI) {
        try {
            coaches = await window.BackendAPI.getAICoaches();
        } catch (error) {
            console.error('Failed to fetch coaches, using demo data');
            coaches = DEMO_AI_COACHES;
        }
    }
    
    if (!coaches) {
        coaches = DEMO_AI_COACHES;
    }
    const coachingPage = document.getElementById('coaching-page');
    if (!coachingPage) return;
    
    const html = `
        <div class="page-header">
            <h1><i class="fas fa-robot"></i> AI Coaches</h1>
            <p class="page-subtitle">Expert AI predictions across all major sports</p>
        </div>
        
        <div class="ai-coaches-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; padding: 20px;">
            ${coaches.map(coach => `
                <div class="coach-card" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 16px;
                    padding: 24px;
                    color: white;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                    transition: transform 0.3s ease;
                    cursor: pointer;
                " onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                    
                    <!-- Coach Header -->
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 16px;">
                        <div style="font-size: 48px;">${coach.avatar}</div>
                        <div style="flex: 1;">
                            <h3 style="margin: 0; font-size: 20px; font-weight: 700;">${coach.name}</h3>
                            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">
                                ${coach.specialty} Specialist
                                <span style="
                                    background: rgba(255,255,255,0.2);
                                    padding: 2px 8px;
                                    border-radius: 12px;
                                    font-size: 11px;
                                    margin-left: 8px;
                                ">${coach.tier}</span>
                            </p>
                        </div>
                    </div>
                    
                    <!-- Stats -->
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 12px;
                        margin-bottom: 16px;
                        background: rgba(0,0,0,0.2);
                        padding: 12px;
                        border-radius: 12px;
                    ">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: #10b981;">
                                ${coach.accuracy}%
                            </div>
                            <div style="font-size: 11px; opacity: 0.8;">Accuracy</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: 700;">
                                ${coach.totalPicks}
                            </div>
                            <div style="font-size: 11px; opacity: 0.8;">Total Picks</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">
                                ${coach.streak}
                                <i class="fas fa-fire" style="font-size: 16px;"></i>
                            </div>
                            <div style="font-size: 11px; opacity: 0.8;">Win Streak</div>
                        </div>
                    </div>
                    
                    <!-- Recent Pick -->
                    <div style="
                        background: rgba(255,255,255,0.15);
                        padding: 12px;
                        border-radius: 12px;
                        backdrop-filter: blur(10px);
                    ">
                        <div style="font-size: 12px; opacity: 0.9; margin-bottom: 8px;">Latest Pick:</div>
                        <div style="font-weight: 600; margin-bottom: 4px;">${coach.recentPicks[0].game}</div>
                        <div style="
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            margin-bottom: 8px;
                        ">
                            <span style="font-size: 18px; font-weight: 700; color: #10b981;">
                                ${coach.recentPicks[0].pick}
                            </span>
                            <span style="
                                background: rgba(16, 185, 129, 0.2);
                                padding: 4px 12px;
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: 600;
                            ">
                                ${coach.recentPicks[0].confidence}% confidence
                            </span>
                        </div>
                        <div style="font-size: 12px; opacity: 0.8; line-height: 1.4;">
                            ${coach.recentPicks[0].reasoning}
                        </div>
                    </div>
                    
                    <!-- Action Button -->
                    <button style="
                        width: 100%;
                        margin-top: 16px;
                        padding: 12px;
                        background: white;
                        color: #667eea;
                        border: none;
                        border-radius: 12px;
                        font-weight: 700;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        View All ${coach.name}'s Picks
                    </button>
                </div>
            `).join('')}
        </div>
        
        <div style="padding: 20px; text-align: center; color: #6b7280;">
            <p style="font-size: 14px;">
                <i class="fas fa-info-circle"></i> 
                AI coaches analyze thousands of data points to generate predictions. 
                <strong>For educational purposes only.</strong>
            </p>
        </div>
    `;
    
    coachingPage.innerHTML = html;
    console.log('✅ AI Coaches rendered');
}

// Render Live Games
function renderLiveGames() {
    const liveGamesPage = document.getElementById('live-games-page');
    if (!liveGamesPage) return;
    
    const demoGames = [
        {
            id: 1,
            sport: 'NBA',
            homeTeam: 'Lakers',
            awayTeam: 'Warriors',
            homeScore: 98,
            awayScore: 102,
            quarter: '4th',
            time: '2:34',
            status: 'LIVE'
        },
        {
            id: 2,
            sport: 'NFL',
            homeTeam: 'Chiefs',
            awayTeam: 'Bills',
            homeScore: 24,
            awayScore: 21,
            quarter: '3rd',
            time: '8:12',
            status: 'LIVE'
        },
        {
            id: 3,
            sport: 'NHL',
            homeTeam: 'Avalanche',
            awayTeam: 'Golden Knights',
            homeScore: 3,
            awayScore: 2,
            quarter: '2nd',
            time: '12:45',
            status: 'LIVE'
        }
    ];
    
    const html = `
        <div class="page-header">
            <h1><i class="fas fa-play-circle"></i> Live Games</h1>
            <p class="page-subtitle">Real-time scores and updates</p>
        </div>
        
        <div style="padding: 20px;">
            ${demoGames.map(game => `
                <div style="
                    background: white;
                    border-radius: 16px;
                    padding: 20px;
                    margin-bottom: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <span style="
                            background: #ef4444;
                            color: white;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: 700;
                            animation: pulse 2s infinite;
                        ">
                            🔴 ${game.status}
                        </span>
                        <span style="color: #6b7280; font-size: 14px; font-weight: 600;">
                            ${game.sport} • ${game.quarter} ${game.time}
                        </span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px; align-items: center;">
                        <div style="text-align: right;">
                            <div style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${game.awayTeam}</div>
                            <div style="color: #6b7280; font-size: 14px;">Away</div>
                        </div>
                        
                        <div style="text-align: center;">
                            <div style="font-size: 36px; font-weight: 800; color: #111827;">
                                ${game.awayScore} - ${game.homeScore}
                            </div>
                        </div>
                        
                        <div style="text-align: left;">
                            <div style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${game.homeTeam}</div>
                            <div style="color: #6b7280; font-size: 14px;">Home</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <style>
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
        </style>
    `;
    
    liveGamesPage.innerHTML = html;
    console.log('✅ Live Games rendered');
}

// Auto-render when coaching page becomes active
function setupAutoRender() {
    // Render when navigation happens
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('active')) {
                const pageId = mutation.target.id;
                
                if (pageId === 'coaching-page') {
                    renderAICoaches();
                } else if (pageId === 'live-games-page') {
                    renderLiveGames();
                }
            }
        });
    });
    
    // Observe all pages for class changes
    document.querySelectorAll('.page').forEach(page => {
        observer.observe(page, {
            attributes: true,
            attributeFilter: ['class']
        });
    });
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupAutoRender();
        // Render coaching page if it's the active page
        if (document.getElementById('coaching-page')?.classList.contains('active')) {
            renderAICoaches();
        }
    });
} else {
    setupAutoRender();
}

console.log('📦 Demo AI Coaches module loaded');
