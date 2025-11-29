// ============================================
// USER PROFILE PAGE SYSTEM
// User profiles with post history, stats, followers
// ============================================

class UserProfilePageSystem {
    constructor() {
        this.users = new Map();
        this.currentViewingProfile = null;
        this.currentUser = null;
        this.followers = new Map(); // userId -> Set of follower IDs
        this.following = new Map(); // userId -> Set of following IDs
        this.eventListeners = {};
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.loadDemoUsers();
        this.loadFollowData();
        console.log('✅ User Profile Page System initialized');
    }

    // ============================================
    // USER MANAGEMENT
    // ============================================

    loadCurrentUser() {
        // Get from social feed system or create default
        if (window.socialFeedSystem && window.socialFeedSystem.currentUser) {
            this.currentUser = window.socialFeedSystem.currentUser;
        } else {
            this.currentUser = {
                id: 'user_123',
                username: 'You',
                displayName: 'Your Name',
                avatar: '👤',
                tier: 'VIP',
                verified: true,
                bio: 'Sports betting enthusiast. Specializing in NBA and NFL. Data-driven approach with 5+ years experience.',
                location: 'New York, NY',
                website: 'https://example.com',
                joinedDate: Date.now() - 365 * 24 * 60 * 60 * 1000, // 1 year ago
                followers: 1250,
                following: 340,
                totalPosts: 89,
                totalLikes: 2450,
                totalComments: 567
            };
        }

        this.users.set(this.currentUser.id, this.currentUser);
    }

    loadDemoUsers() {
        const demoUsers = [
            {
                id: 'user_1',
                username: 'BettingKing',
                displayName: 'Mike Johnson',
                avatar: '👑',
                tier: 'VIP',
                verified: true,
                bio: 'Professional sports analyst. 10+ years experience. Specializing in NBA, NFL, and MLB. Follow for daily picks and analysis.',
                location: 'Las Vegas, NV',
                website: 'https://bettingking.com',
                joinedDate: Date.now() - 730 * 24 * 60 * 60 * 1000, // 2 years ago
                followers: 5420,
                following: 890,
                totalPosts: 342,
                totalLikes: 12580,
                totalComments: 1450,
                stats: {
                    winRate: 0.635,
                    roi: 14.2,
                    avgOdds: 180,
                    totalWagered: 45200,
                    totalProfit: 6418,
                    bestStreak: 12,
                    currentStreak: 4,
                    favoriteSport: 'NBA',
                    mostProfitableSport: 'NFL'
                }
            },
            {
                id: 'user_2',
                username: 'SportsMaster',
                displayName: 'Sarah Chen',
                avatar: '🏆',
                tier: 'PRO',
                verified: true,
                bio: 'Data scientist turned sports bettor. Machine learning models for picks. Stats don\'t lie! 📊',
                location: 'San Francisco, CA',
                website: null,
                joinedDate: Date.now() - 547 * 24 * 60 * 60 * 1000, // 1.5 years ago
                followers: 3280,
                following: 456,
                totalPosts: 234,
                totalLikes: 8920,
                totalComments: 890,
                stats: {
                    winRate: 0.612,
                    roi: 11.8,
                    avgOdds: 165,
                    totalWagered: 28900,
                    totalProfit: 3410,
                    bestStreak: 9,
                    currentStreak: 2,
                    favoriteSport: 'MLB',
                    mostProfitableSport: 'NBA'
                }
            },
            {
                id: 'user_3',
                username: 'PropWizard',
                displayName: 'James Davis',
                avatar: '🎯',
                tier: 'VIP',
                verified: true,
                bio: 'Player props specialist. Finding edges in prop markets since 2018. DM for private picks.',
                location: 'Chicago, IL',
                website: 'https://propwizard.net',
                joinedDate: Date.now() - 912 * 24 * 60 * 60 * 1000, // 2.5 years ago
                followers: 4150,
                following: 234,
                totalPosts: 567,
                totalLikes: 15640,
                totalComments: 2340,
                stats: {
                    winRate: 0.648,
                    roi: 16.5,
                    avgOdds: 195,
                    totalWagered: 56700,
                    totalProfit: 9355,
                    bestStreak: 15,
                    currentStreak: 7,
                    favoriteSport: 'NBA',
                    mostProfitableSport: 'NBA'
                }
            },
            {
                id: 'user_4',
                username: 'DataNinja',
                displayName: 'Alex Kim',
                avatar: '📊',
                tier: 'PRO',
                verified: false,
                bio: 'Analytics enthusiast. Breaking down the numbers. Always learning, always improving.',
                location: 'Seattle, WA',
                website: null,
                joinedDate: Date.now() - 183 * 24 * 60 * 60 * 1000, // 6 months ago
                followers: 890,
                following: 567,
                totalPosts: 123,
                totalLikes: 2340,
                totalComments: 456,
                stats: {
                    winRate: 0.578,
                    roi: 8.4,
                    avgOdds: 150,
                    totalWagered: 12400,
                    totalProfit: 1042,
                    bestStreak: 6,
                    currentStreak: 3,
                    favoriteSport: 'NFL',
                    mostProfitableSport: 'NHL'
                }
            },
            {
                id: 'user_5',
                username: 'SharpBettor',
                displayName: 'Emily Brown',
                avatar: '💎',
                tier: 'FREE',
                verified: false,
                bio: 'Learning the ropes. Following sharp bettors and trying to improve. Any tips welcome!',
                location: 'Austin, TX',
                website: null,
                joinedDate: Date.now() - 45 * 24 * 60 * 60 * 1000, // 1.5 months ago
                followers: 234,
                following: 890,
                totalPosts: 34,
                totalLikes: 567,
                totalComments: 123,
                stats: {
                    winRate: 0.512,
                    roi: 2.1,
                    avgOdds: 110,
                    totalWagered: 3200,
                    totalProfit: 67,
                    bestStreak: 4,
                    currentStreak: 1,
                    favoriteSport: 'NBA',
                    mostProfitableSport: 'NBA'
                }
            },
            {
                id: 'user_6',
                username: 'OddsHunter',
                displayName: 'Chris Wilson',
                avatar: '🔍',
                tier: 'PRO',
                verified: true,
                bio: 'Line shopping expert. Finding the best odds across all sportsbooks. Value is everything.',
                location: 'Miami, FL',
                website: 'https://oddshunter.io',
                joinedDate: Date.now() - 456 * 24 * 60 * 60 * 1000, // 1.25 years ago
                followers: 2340,
                following: 678,
                totalPosts: 289,
                totalLikes: 6780,
                totalComments: 1120,
                stats: {
                    winRate: 0.595,
                    roi: 10.2,
                    avgOdds: 172,
                    totalWagered: 34500,
                    totalProfit: 3519,
                    bestStreak: 8,
                    currentStreak: 5,
                    favoriteSport: 'NFL',
                    mostProfitableSport: 'NFL'
                }
            }
        ];

        demoUsers.forEach(user => {
            this.users.set(user.id, user);
        });
    }

    loadFollowData() {
        // Demo follow relationships
        const relationships = [
            { userId: 'user_123', follows: ['user_1', 'user_2', 'user_3'] },
            { userId: 'user_1', follows: ['user_2', 'user_3', 'user_6'] },
            { userId: 'user_2', follows: ['user_1', 'user_3', 'user_4'] },
            { userId: 'user_3', follows: ['user_1', 'user_2'] },
            { userId: 'user_4', follows: ['user_1', 'user_2', 'user_3', 'user_6'] },
            { userId: 'user_5', follows: ['user_1', 'user_2', 'user_3', 'user_4', 'user_6'] },
            { userId: 'user_6', follows: ['user_1', 'user_3'] }
        ];

        relationships.forEach(rel => {
            this.following.set(rel.userId, new Set(rel.follows));
            
            // Build followers map
            rel.follows.forEach(followedUserId => {
                if (!this.followers.has(followedUserId)) {
                    this.followers.set(followedUserId, new Set());
                }
                this.followers.get(followedUserId).add(rel.userId);
            });
        });

        // Ensure current user has entries
        if (!this.followers.has(this.currentUser.id)) {
            this.followers.set(this.currentUser.id, new Set());
        }
        if (!this.following.has(this.currentUser.id)) {
            this.following.set(this.currentUser.id, new Set(['user_1', 'user_2', 'user_3']));
        }
    }

    // ============================================
    // PROFILE OPERATIONS
    // ============================================

    getUserProfile(userId) {
        return this.users.get(userId);
    }

    viewProfile(userId, silent = false) {
        const profile = this.getUserProfile(userId);
        if (!profile) {
            console.error('User not found:', userId);
            return null;
        }

        this.currentViewingProfile = profile;
        
        // Only emit if not silent (to avoid infinite loops during render)
        if (!silent) {
            this.emit('profileViewed', profile);
        }
        
        return profile;
    }

    updateProfile(userId, updates) {
        const user = this.users.get(userId);
        if (!user) return false;

        // Only allow user to update their own profile
        if (userId !== this.currentUser.id) {
            console.error('Cannot update other user profiles');
            return false;
        }

        Object.assign(user, updates);
        this.users.set(userId, user);
        
        // Update in social feed system if exists
        if (window.socialFeedSystem && userId === this.currentUser.id) {
            Object.assign(window.socialFeedSystem.currentUser, updates);
        }

        this.saveToStorage();
        this.emit('profileUpdated', user);
        return true;
    }

    // ============================================
    // FOLLOW SYSTEM
    // ============================================

    isFollowing(userId) {
        const following = this.following.get(this.currentUser.id);
        return following ? following.has(userId) : false;
    }

    getFollowerCount(userId) {
        const followers = this.followers.get(userId);
        return followers ? followers.size : 0;
    }

    getFollowingCount(userId) {
        const following = this.following.get(userId);
        return following ? following.size : 0;
    }

    toggleFollow(userId) {
        if (userId === this.currentUser.id) {
            console.error('Cannot follow yourself');
            return false;
        }

        const following = this.following.get(this.currentUser.id) || new Set();
        const isCurrentlyFollowing = following.has(userId);

        if (isCurrentlyFollowing) {
            // Unfollow
            following.delete(userId);
            const followers = this.followers.get(userId);
            if (followers) {
                followers.delete(this.currentUser.id);
            }
            
            // Update counts
            const user = this.users.get(userId);
            if (user) user.followers--;
            const currentUser = this.users.get(this.currentUser.id);
            if (currentUser) currentUser.following--;
            
            this.emit('unfollowed', userId);
        } else {
            // Follow
            following.add(userId);
            if (!this.followers.has(userId)) {
                this.followers.set(userId, new Set());
            }
            this.followers.get(userId).add(this.currentUser.id);
            
            // Update counts
            const user = this.users.get(userId);
            if (user) user.followers++;
            const currentUser = this.users.get(this.currentUser.id);
            if (currentUser) currentUser.following++;
            
            this.emit('followed', userId);
        }

        this.following.set(this.currentUser.id, following);
        this.saveToStorage();
        
        return !isCurrentlyFollowing;
    }

    getFollowers(userId) {
        const followerIds = this.followers.get(userId);
        if (!followerIds) return [];

        return Array.from(followerIds)
            .map(id => this.users.get(id))
            .filter(user => user);
    }

    getFollowing(userId) {
        const followingIds = this.following.get(userId);
        if (!followingIds) return [];

        return Array.from(followingIds)
            .map(id => this.users.get(id))
            .filter(user => user);
    }

    getMutualFollowers(userId) {
        const userFollowers = this.followers.get(userId) || new Set();
        const currentUserFollowing = this.following.get(this.currentUser.id) || new Set();
        
        const mutual = new Set([...userFollowers].filter(id => currentUserFollowing.has(id)));
        return Array.from(mutual)
            .map(id => this.users.get(id))
            .filter(user => user);
    }

    // ============================================
    // POST INTEGRATION
    // ============================================

    getUserPosts(userId) {
        if (!window.socialFeedSystem) return [];
        return window.socialFeedSystem.getUserPosts(userId);
    }

    getUserLikedPosts(userId) {
        if (!window.socialFeedSystem) return [];
        
        // Get all posts where user has liked
        return window.socialFeedSystem.posts.filter(post => 
            post.likedBy && post.likedBy.includes(userId)
        );
    }

    getUserCommentedPosts(userId) {
        if (!window.socialFeedSystem) return [];
        
        const commentedPostIds = new Set();
        
        // Find all posts where user has commented
        Object.entries(window.socialFeedSystem.comments).forEach(([postId, comments]) => {
            const hasCommented = comments.some(comment => comment.userId === userId);
            if (hasCommented) {
                commentedPostIds.add(postId);
            }
        });
        
        return window.socialFeedSystem.posts.filter(post => 
            commentedPostIds.has(post.id)
        );
    }

    getUserSavedPosts(userId) {
        if (!window.socialFeedSystem || userId !== this.currentUser.id) return [];
        return window.socialFeedSystem.getSavedPosts();
    }

    // ============================================
    // STATISTICS
    // ============================================

    calculateUserStats(userId) {
        const user = this.users.get(userId);
        if (!user) return null;

        const posts = this.getUserPosts(userId);
        const totalEngagement = posts.reduce((sum, post) => 
            sum + post.likes + post.comments + post.shares, 0
        );

        const avgEngagement = posts.length > 0 ? totalEngagement / posts.length : 0;
        const engagementRate = user.followers > 0 ? (totalEngagement / user.followers) * 100 : 0;

        // Post type breakdown
        const postTypes = {
            discussion: posts.filter(p => p.type === 'discussion').length,
            pick: posts.filter(p => p.type === 'pick').length,
            analysis: posts.filter(p => p.type === 'analysis').length,
            milestone: posts.filter(p => p.type === 'milestone').length
        };

        // Activity timeline
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const activity = {
            last24h: posts.filter(p => now - p.timestamp < dayMs).length,
            last7d: posts.filter(p => now - p.timestamp < 7 * dayMs).length,
            last30d: posts.filter(p => now - p.timestamp < 30 * dayMs).length
        };

        return {
            totalPosts: posts.length,
            totalEngagement: totalEngagement,
            avgEngagement: Math.round(avgEngagement * 10) / 10,
            engagementRate: Math.round(engagementRate * 10) / 10,
            postTypes: postTypes,
            activity: activity,
            mostLikedPost: posts.sort((a, b) => b.likes - a.likes)[0] || null,
            followers: this.getFollowerCount(userId),
            following: this.getFollowingCount(userId)
        };
    }

    // ============================================
    // BADGES & ACHIEVEMENTS
    // ============================================

    getUserBadges(userId) {
        const stats = this.calculateUserStats(userId);
        const user = this.users.get(userId);
        if (!stats || !user) return [];

        const badges = [];

        // Verified badge
        if (user.verified) {
            badges.push({
                id: 'verified',
                name: 'Verified',
                icon: '✅',
                color: '#10b981',
                description: 'Verified community member'
            });
        }

        // Tier badges
        if (user.tier === 'VIP') {
            badges.push({
                id: 'vip',
                name: 'VIP Member',
                icon: '👑',
                color: '#a855f7',
                description: 'VIP tier member'
            });
        } else if (user.tier === 'PRO') {
            badges.push({
                id: 'pro',
                name: 'PRO Member',
                icon: '⭐',
                color: '#fbbf24',
                description: 'PRO tier member'
            });
        }

        // Post count badges
        if (stats.totalPosts >= 100) {
            badges.push({
                id: 'prolific',
                name: 'Prolific Poster',
                icon: '📝',
                color: '#6366f1',
                description: '100+ posts created'
            });
        }

        // Engagement badges
        if (stats.totalEngagement >= 1000) {
            badges.push({
                id: 'influencer',
                name: 'Influencer',
                icon: '🌟',
                color: '#ec4899',
                description: '1000+ total engagement'
            });
        }

        // Follower badges
        if (stats.followers >= 1000) {
            badges.push({
                id: 'popular',
                name: 'Popular',
                icon: '🔥',
                color: '#ef4444',
                description: '1000+ followers'
            });
        }

        // Betting stats badges (if available)
        if (user.stats) {
            if (user.stats.winRate >= 0.6) {
                badges.push({
                    id: 'sharp',
                    name: 'Sharp Bettor',
                    icon: '🎯',
                    color: '#10b981',
                    description: '60%+ win rate'
                });
            }

            if (user.stats.roi >= 10) {
                badges.push({
                    id: 'profitable',
                    name: 'Profitable',
                    icon: '💰',
                    color: '#10b981',
                    description: '10%+ ROI'
                });
            }

            if (user.stats.bestStreak >= 10) {
                badges.push({
                    id: 'streak',
                    name: 'Streak Master',
                    icon: '🔥',
                    color: '#f59e0b',
                    description: '10+ win streak'
                });
            }
        }

        // Early adopter
        const accountAge = Date.now() - user.joinedDate;
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        if (accountAge >= oneYear) {
            badges.push({
                id: 'veteran',
                name: 'Veteran',
                icon: '🛡️',
                color: '#6366f1',
                description: '1+ year member'
            });
        }

        return badges;
    }

    // ============================================
    // SEARCH & DISCOVERY
    // ============================================

    searchUsers(query) {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.users.values()).filter(user =>
            user.username.toLowerCase().includes(lowerQuery) ||
            user.displayName.toLowerCase().includes(lowerQuery) ||
            (user.bio && user.bio.toLowerCase().includes(lowerQuery))
        );
    }

    getSuggestedUsers(userId, limit = 5) {
        const user = this.users.get(userId);
        if (!user) return [];

        const following = this.following.get(userId) || new Set();
        
        // Get users not currently followed
        const suggestions = Array.from(this.users.values())
            .filter(u => u.id !== userId && !following.has(u.id))
            .map(u => ({
                ...u,
                mutualFollowers: this.getMutualFollowers(u.id).length,
                relevanceScore: this.calculateRelevanceScore(userId, u.id)
            }))
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, limit);

        return suggestions;
    }

    calculateRelevanceScore(userId, targetUserId) {
        let score = 0;
        
        const targetUser = this.users.get(targetUserId);
        if (!targetUser) return 0;

        // Mutual followers boost
        const mutualCount = this.getMutualFollowers(targetUserId).length;
        score += mutualCount * 10;

        // Verified boost
        if (targetUser.verified) score += 5;

        // Tier boost
        if (targetUser.tier === 'VIP') score += 3;
        if (targetUser.tier === 'PRO') score += 2;

        // Activity boost
        const posts = this.getUserPosts(targetUserId);
        score += Math.min(posts.length / 10, 5); // Max 5 points for posts

        // Follower count boost (logarithmic)
        score += Math.log10(Math.max(1, targetUser.followers));

        return score;
    }

    // ============================================
    // STORAGE
    // ============================================

    saveToStorage() {
        try {
            localStorage.setItem('user_profiles', JSON.stringify(
                Array.from(this.users.entries())
            ));
            localStorage.setItem('user_followers', JSON.stringify(
                Array.from(this.followers.entries()).map(([k, v]) => [k, Array.from(v)])
            ));
            localStorage.setItem('user_following', JSON.stringify(
                Array.from(this.following.entries()).map(([k, v]) => [k, Array.from(v)])
            ));
        } catch (error) {
            console.error('Failed to save user profile data:', error);
        }
    }

    loadFromStorage() {
        try {
            const usersData = localStorage.getItem('user_profiles');
            const followersData = localStorage.getItem('user_followers');
            const followingData = localStorage.getItem('user_following');

            if (usersData) {
                this.users = new Map(JSON.parse(usersData));
            }
            if (followersData) {
                this.followers = new Map(
                    JSON.parse(followersData).map(([k, v]) => [k, new Set(v)])
                );
            }
            if (followingData) {
                this.following = new Map(
                    JSON.parse(followingData).map(([k, v]) => [k, new Set(v)])
                );
            }
        } catch (error) {
            console.error('Failed to load user profile data:', error);
        }
    }

    // ============================================
    // EVENT SYSTEM
    // ============================================

    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event].forEach(callback => callback(data));
    }
}

// ============================================
// EXPORT
// ============================================

// Create global instance
window.userProfilePageSystem = new UserProfilePageSystem();
