/**
 * Trophy Showcase System
 * Animated trophy display for user achievements
 */

class TrophyShowcaseSystem {
    constructor() {
        this.trophies = [];
        this.unlockedTrophies = new Set();
        this.showcaseTrophies = [];
        this.activeAnimation = null;
        this.init();
    }

    init() {
        this.loadTrophies();
        this.loadUserProgress();
        this.setupEventListeners();
    }

    /**
     * Define all available trophies
     */
    loadTrophies() {
        this.trophies = [
            {
                id: 'first_win',
                name: 'First Victory',
                description: 'Win your first prediction',
                icon: '🏆',
                image: 'https://play.rosebud.ai/assets/Ultimate sports ai trophy.png?REjH',
                rarity: 'common',
                category: 'predictions',
                points: 10,
                requirement: { type: 'wins', count: 1 }
            },
            {
                id: 'hot_streak',
                name: 'Hot Streak',
                description: 'Win 5 predictions in a row',
                icon: '🔥',
                image: 'https://play.rosebud.ai/assets/Football trophy icon.png?ok1w',
                rarity: 'rare',
                category: 'predictions',
                points: 50,
                requirement: { type: 'streak', count: 5 }
            },
            {
                id: 'basketball_master',
                name: 'Basketball Master',
                description: 'Win 10 basketball predictions',
                icon: '🏀',
                image: 'https://play.rosebud.ai/assets/Basketball trophy.png?28RZ',
                rarity: 'rare',
                category: 'sports',
                points: 50,
                requirement: { type: 'sport_wins', sport: 'basketball', count: 10 }
            },
            {
                id: 'baseball_legend',
                name: 'Baseball Legend',
                description: 'Win 10 baseball predictions',
                icon: '⚾',
                image: 'https://play.rosebud.ai/assets/Baseball trophy.png?ZPlR',
                rarity: 'rare',
                category: 'sports',
                points: 50,
                requirement: { type: 'sport_wins', sport: 'baseball', count: 10 }
            },
            {
                id: 'soccer_champion',
                name: 'Soccer Champion',
                description: 'Win 10 soccer predictions',
                icon: '⚽',
                image: 'https://play.rosebud.ai/assets/Soccer parlay trophy.png?ePTo',
                rarity: 'rare',
                category: 'sports',
                points: 50,
                requirement: { type: 'sport_wins', sport: 'soccer', count: 10 }
            },
            {
                id: 'parlay_king',
                name: 'Parlay King',
                description: 'Hit a 5-leg parlay',
                icon: '👑',
                image: 'https://play.rosebud.ai/assets/Ultimate sports trophy parlay king achievement icon.png?3cyb',
                rarity: 'epic',
                category: 'parlays',
                points: 100,
                requirement: { type: 'parlay_legs', count: 5 }
            },
            {
                id: 'money_maker',
                name: 'Money Maker',
                description: 'Reach +100 units profit',
                icon: '💰',
                image: 'https://play.rosebud.ai/assets/Money bag trophy.png?ELGp',
                rarity: 'epic',
                category: 'profit',
                points: 150,
                requirement: { type: 'units_profit', count: 100 }
            },
            {
                id: 'sharp_mind',
                name: 'Sharp Mind',
                description: 'Achieve 70% win rate (min 50 picks)',
                icon: '🧠',
                image: 'https://play.rosebud.ai/assets/Mind on money trophy.png?qggl',
                rarity: 'legendary',
                category: 'accuracy',
                points: 250,
                requirement: { type: 'win_rate', percentage: 70, minPicks: 50 }
            },
            {
                id: 'ultimate_champion',
                name: 'Ultimate Champion',
                description: 'Reach #1 on the leaderboard',
                icon: '⭐',
                image: 'https://play.rosebud.ai/assets/Super intelligent sports trophy.png?BVmz',
                rarity: 'legendary',
                category: 'leaderboard',
                points: 500,
                requirement: { type: 'leaderboard_rank', rank: 1 }
            },
            {
                id: 'vip_elite',
                name: 'VIP Elite',
                description: 'Subscribe to VIP tier',
                icon: '💎',
                image: 'https://play.rosebud.ai/assets/Vip trophy.png?q8fV',
                rarity: 'legendary',
                category: 'subscription',
                points: 300,
                requirement: { type: 'subscription', tier: 'VIP' }
            },
            {
                id: 'world_class',
                name: 'World Class',
                description: 'Win predictions across all 7 sports',
                icon: '🌍',
                image: 'https://play.rosebud.ai/assets/World trophy.png?7n3n',
                rarity: 'legendary',
                category: 'sports',
                points: 400,
                requirement: { type: 'all_sports', count: 7 }
            }
        ];
    }

    /**
     * Load user's unlocked trophies from storage
     */
    loadUserProgress() {
        try {
            const saved = localStorage.getItem('ultimate_sports_trophies');
            if (saved) {
                const data = JSON.parse(saved);
                this.unlockedTrophies = new Set(data.unlocked || []);
                this.showcaseTrophies = data.showcase || [];
            }
        } catch (error) {
            console.error('Error loading trophy progress:', error);
        }
    }

    /**
     * Save user's trophy progress
     */
    saveProgress() {
        try {
            const data = {
                unlocked: Array.from(this.unlockedTrophies),
                showcase: this.showcaseTrophies,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('ultimate_sports_trophies', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving trophy progress:', error);
        }
    }

    /**
     * Check if user unlocked a new trophy
     */
    checkTrophyUnlock(userStats) {
        const newlyUnlocked = [];

        this.trophies.forEach(trophy => {
            if (this.unlockedTrophies.has(trophy.id)) return;

            const requirement = trophy.requirement;
            let unlocked = false;

            switch (requirement.type) {
                case 'wins':
                    unlocked = userStats.totalWins >= requirement.count;
                    break;
                case 'streak':
                    unlocked = userStats.currentStreak >= requirement.count;
                    break;
                case 'sport_wins':
                    const sportWins = userStats.sportWins?.[requirement.sport] || 0;
                    unlocked = sportWins >= requirement.count;
                    break;
                case 'parlay_legs':
                    unlocked = userStats.maxParlayLegs >= requirement.count;
                    break;
                case 'units_profit':
                    unlocked = userStats.unitsProfit >= requirement.count;
                    break;
                case 'win_rate':
                    if (userStats.totalPicks >= requirement.minPicks) {
                        const winRate = (userStats.totalWins / userStats.totalPicks) * 100;
                        unlocked = winRate >= requirement.percentage;
                    }
                    break;
                case 'leaderboard_rank':
                    unlocked = userStats.leaderboardRank === requirement.rank;
                    break;
                case 'subscription':
                    unlocked = userStats.subscriptionTier === requirement.tier;
                    break;
                case 'all_sports':
                    const sportsWithWins = Object.keys(userStats.sportWins || {}).length;
                    unlocked = sportsWithWins >= requirement.count;
                    break;
            }

            if (unlocked) {
                this.unlockedTrophies.add(trophy.id);
                newlyUnlocked.push(trophy);
            }
        });

        if (newlyUnlocked.length > 0) {
            this.saveProgress();
            newlyUnlocked.forEach(trophy => this.showUnlockAnimation(trophy));
        }

        return newlyUnlocked;
    }

    /**
     * Show trophy unlock animation
     */
    showUnlockAnimation(trophy) {
        // Create unlock modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'trophy-unlock-overlay';
        overlay.innerHTML = `
            <div class="trophy-unlock-modal">
                <div class="trophy-unlock-particles"></div>
                
                <div class="trophy-unlock-content">
                    <div class="trophy-unlock-title">🎉 ACHIEVEMENT UNLOCKED! 🎉</div>
                    
                    <div class="trophy-unlock-trophy ${trophy.rarity}">
                        <div class="trophy-glow"></div>
                        <div class="trophy-image-container">
                            <img src="${trophy.image}" alt="${trophy.name}" class="trophy-image">
                        </div>
                        <div class="trophy-shine"></div>
                    </div>
                    
                    <div class="trophy-unlock-info">
                        <div class="trophy-unlock-name">${trophy.name}</div>
                        <div class="trophy-unlock-description">${trophy.description}</div>
                        <div class="trophy-unlock-rarity ${trophy.rarity}">
                            ${this.getRarityLabel(trophy.rarity)}
                        </div>
                        <div class="trophy-unlock-points">+${trophy.points} Points</div>
                    </div>
                    
                    <button class="trophy-unlock-close">
                        <i class="fas fa-check"></i> Awesome!
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Generate particles
        this.generateParticles(overlay.querySelector('.trophy-unlock-particles'));

        // Play sound
        this.playUnlockSound(trophy.rarity);

        // Close button
        overlay.querySelector('.trophy-unlock-close').addEventListener('click', () => {
            overlay.classList.add('closing');
            setTimeout(() => overlay.remove(), 300);
        });

        // Auto-close after 8 seconds
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                overlay.classList.add('closing');
                setTimeout(() => overlay.remove(), 300);
            }
        }, 8000);

        // Trigger animation
        setTimeout(() => overlay.classList.add('active'), 10);
    }

    /**
     * Generate particle effects
     */
    generateParticles(container) {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'trophy-particle';
            
            const size = Math.random() * 8 + 4;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = Math.random() * 2 + 1;
            const delay = Math.random() * 0.5;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}%;
                top: ${y}%;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
            `;
            
            container.appendChild(particle);
        }
    }

    /**
     * Play unlock sound based on rarity
     */
    playUnlockSound(rarity) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const frequencies = {
                common: [523.25, 659.25, 783.99],
                rare: [659.25, 783.99, 987.77],
                epic: [783.99, 987.77, 1174.66],
                legendary: [987.77, 1174.66, 1396.91]
            };
            
            const notes = frequencies[rarity] || frequencies.common;
            
            notes.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                const startTime = audioContext.currentTime + (index * 0.15);
                gainNode.gain.setValueAtTime(0.1, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.5);
            });
        } catch (error) {
            console.log('Audio playback not available');
        }
    }

    /**
     * Get rarity label with emoji
     */
    getRarityLabel(rarity) {
        const labels = {
            common: '⚪ COMMON',
            rare: '🔵 RARE',
            epic: '🟣 EPIC',
            legendary: '🟡 LEGENDARY'
        };
        return labels[rarity] || labels.common;
    }

    /**
     * Add trophy to showcase
     */
    addToShowcase(trophyId) {
        if (!this.unlockedTrophies.has(trophyId)) return false;
        if (this.showcaseTrophies.includes(trophyId)) return false;
        if (this.showcaseTrophies.length >= 6) {
            // Remove oldest trophy
            this.showcaseTrophies.shift();
        }
        
        this.showcaseTrophies.push(trophyId);
        this.saveProgress();
        return true;
    }

    /**
     * Remove trophy from showcase
     */
    removeFromShowcase(trophyId) {
        const index = this.showcaseTrophies.indexOf(trophyId);
        if (index > -1) {
            this.showcaseTrophies.splice(index, 1);
            this.saveProgress();
            return true;
        }
        return false;
    }

    /**
     * Get trophy by ID
     */
    getTrophy(trophyId) {
        return this.trophies.find(t => t.id === trophyId);
    }

    /**
     * Get all unlocked trophies
     */
    getUnlockedTrophies() {
        return this.trophies.filter(t => this.unlockedTrophies.has(t.id));
    }

    /**
     * Get showcase trophies
     */
    getShowcaseTrophies() {
        return this.showcaseTrophies
            .map(id => this.getTrophy(id))
            .filter(t => t);
    }

    /**
     * Get trophy statistics
     */
    getStats() {
        const unlocked = this.unlockedTrophies.size;
        const total = this.trophies.length;
        const percentage = Math.round((unlocked / total) * 100);
        
        const points = this.getUnlockedTrophies().reduce((sum, t) => sum + t.points, 0);
        
        const byRarity = {
            common: 0,
            rare: 0,
            epic: 0,
            legendary: 0
        };
        
        this.getUnlockedTrophies().forEach(trophy => {
            byRarity[trophy.rarity]++;
        });

        return {
            unlocked,
            total,
            percentage,
            points,
            byRarity
        };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        window.addEventListener('trophy:check', (event) => {
            if (event.detail?.userStats) {
                this.checkTrophyUnlock(event.detail.userStats);
            }
        });
    }

    /**
     * Manually unlock trophy (for testing)
     */
    unlockTrophy(trophyId) {
        const trophy = this.getTrophy(trophyId);
        if (trophy && !this.unlockedTrophies.has(trophyId)) {
            this.unlockedTrophies.add(trophyId);
            this.saveProgress();
            this.showUnlockAnimation(trophy);
            return true;
        }
        return false;
    }
}

// Initialize system
const trophyShowcase = new TrophyShowcaseSystem();

// Export for use in other modules
export default trophyShowcase;
