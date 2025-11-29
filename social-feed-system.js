// ============================================
// SOCIAL FEED SYSTEM MODULE
// User posts, comments, likes, and real-time interactions
// ============================================

class SocialFeedSystem {
    constructor() {
        this.posts = [];
        this.comments = {};
        this.likes = {};
        this.savedPosts = new Set();
        this.currentUser = null;
        this.sortMode = 'recent'; // recent, popular, following
        this.filterMode = 'all'; // all, picks, analysis, discussion
        this.eventListeners = {};
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.loadFromStorage();
        this.loadDemoData();
        console.log('✅ Social Feed System initialized');
    }

    // ============================================
    // USER MANAGEMENT
    // ============================================

    loadCurrentUser() {
        // Get from auth system or use demo user
        this.currentUser = {
            id: 'user_123',
            username: 'You',
            displayName: 'Your Name',
            avatar: '👤',
            tier: 'VIP', // FREE, PRO, VIP
            verified: true,
            followers: 1250,
            following: 340,
            totalPosts: 89,
            totalLikes: 2450
        };
    }

    // ============================================
    // POST MANAGEMENT
    // ============================================

    createPost(postData) {
        const post = {
            id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: this.currentUser.id,
            username: this.currentUser.username,
            displayName: this.currentUser.displayName,
            avatar: this.currentUser.avatar,
            tier: this.currentUser.tier,
            verified: this.currentUser.verified,
            content: postData.content,
            type: postData.type || 'discussion', // discussion, pick, analysis, milestone
            sport: postData.sport || null,
            game: postData.game || null,
            pick: postData.pick || null, // bet slip details if type is 'pick'
            media: postData.media || [], // images/videos
            tags: postData.tags || [],
            timestamp: Date.now(),
            edited: false,
            editedAt: null,
            likes: 0,
            comments: 0,
            shares: 0,
            saves: 0,
            likedBy: [],
            commentList: [],
            visibility: postData.visibility || 'public', // public, friends, private
            pinned: false
        };

        this.posts.unshift(post);
        this.saveToStorage();
        this.emit('postCreated', post);
        
        return post;
    }

    deletePost(postId) {
        const postIndex = this.posts.findIndex(p => p.id === postId);
        if (postIndex === -1) return false;

        const post = this.posts[postIndex];
        
        // Only allow deletion if user owns the post
        if (post.userId !== this.currentUser.id) {
            return false;
        }

        this.posts.splice(postIndex, 1);
        
        // Clean up related data
        delete this.comments[postId];
        delete this.likes[postId];
        this.savedPosts.delete(postId);
        
        this.saveToStorage();
        this.emit('postDeleted', postId);
        
        return true;
    }

    editPost(postId, newContent) {
        const post = this.posts.find(p => p.id === postId);
        if (!post || post.userId !== this.currentUser.id) return false;

        post.content = newContent;
        post.edited = true;
        post.editedAt = Date.now();

        this.saveToStorage();
        this.emit('postEdited', post);
        
        return true;
    }

    togglePin(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post || post.userId !== this.currentUser.id) return false;

        post.pinned = !post.pinned;
        this.saveToStorage();
        this.emit('postPinned', post);
        
        return post.pinned;
    }

    // ============================================
    // COMMENT MANAGEMENT
    // ============================================

    addComment(postId, content, parentCommentId = null) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return null;

        const comment = {
            id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            postId: postId,
            parentId: parentCommentId,
            userId: this.currentUser.id,
            username: this.currentUser.username,
            displayName: this.currentUser.displayName,
            avatar: this.currentUser.avatar,
            tier: this.currentUser.tier,
            verified: this.currentUser.verified,
            content: content,
            timestamp: Date.now(),
            edited: false,
            editedAt: null,
            likes: 0,
            replies: 0,
            likedBy: []
        };

        if (!this.comments[postId]) {
            this.comments[postId] = [];
        }
        
        this.comments[postId].push(comment);
        post.comments++;
        
        // Update parent comment reply count
        if (parentCommentId) {
            const parentComment = this.comments[postId].find(c => c.id === parentCommentId);
            if (parentComment) {
                parentComment.replies++;
            }
        }

        this.saveToStorage();
        this.emit('commentAdded', { post, comment });
        
        return comment;
    }

    deleteComment(postId, commentId) {
        if (!this.comments[postId]) return false;

        const commentIndex = this.comments[postId].findIndex(c => c.id === commentId);
        if (commentIndex === -1) return false;

        const comment = this.comments[postId][commentIndex];
        
        // Only allow deletion if user owns the comment
        if (comment.userId !== this.currentUser.id) {
            return false;
        }

        // Remove comment
        this.comments[postId].splice(commentIndex, 1);

        // Update post comment count
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.comments--;
            
            // Update parent reply count if this was a reply
            if (comment.parentId) {
                const parentComment = this.comments[postId].find(c => c.id === comment.parentId);
                if (parentComment) {
                    parentComment.replies--;
                }
            }
        }

        this.saveToStorage();
        this.emit('commentDeleted', { postId, commentId });
        
        return true;
    }

    editComment(postId, commentId, newContent) {
        if (!this.comments[postId]) return false;

        const comment = this.comments[postId].find(c => c.id === commentId);
        if (!comment || comment.userId !== this.currentUser.id) return false;

        comment.content = newContent;
        comment.edited = true;
        comment.editedAt = Date.now();

        this.saveToStorage();
        this.emit('commentEdited', { postId, comment });
        
        return true;
    }

    // ============================================
    // LIKE MANAGEMENT
    // ============================================

    toggleLike(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return false;

        if (!this.likes[postId]) {
            this.likes[postId] = new Set();
        }

        const isLiked = this.likes[postId].has(this.currentUser.id);

        if (isLiked) {
            this.likes[postId].delete(this.currentUser.id);
            post.likes--;
            const index = post.likedBy.indexOf(this.currentUser.id);
            if (index > -1) post.likedBy.splice(index, 1);
        } else {
            this.likes[postId].add(this.currentUser.id);
            post.likes++;
            post.likedBy.push(this.currentUser.id);
        }

        this.saveToStorage();
        this.emit('postLikeToggled', { post, isLiked: !isLiked });
        
        return !isLiked;
    }

    toggleCommentLike(postId, commentId) {
        if (!this.comments[postId]) return false;

        const comment = this.comments[postId].find(c => c.id === commentId);
        if (!comment) return false;

        const isLiked = comment.likedBy.includes(this.currentUser.id);

        if (isLiked) {
            const index = comment.likedBy.indexOf(this.currentUser.id);
            if (index > -1) comment.likedBy.splice(index, 1);
            comment.likes--;
        } else {
            comment.likedBy.push(this.currentUser.id);
            comment.likes++;
        }

        this.saveToStorage();
        this.emit('commentLikeToggled', { postId, comment, isLiked: !isLiked });
        
        return !isLiked;
    }

    // ============================================
    // SAVE MANAGEMENT
    // ============================================

    toggleSave(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return false;

        const isSaved = this.savedPosts.has(postId);

        if (isSaved) {
            this.savedPosts.delete(postId);
            post.saves--;
        } else {
            this.savedPosts.add(postId);
            post.saves++;
        }

        this.saveToStorage();
        this.emit('postSaveToggled', { post, isSaved: !isSaved });
        
        return !isSaved;
    }

    // ============================================
    // SHARE MANAGEMENT
    // ============================================

    sharePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return false;

        post.shares++;
        this.saveToStorage();
        this.emit('postShared', post);
        
        return true;
    }

    // ============================================
    // FILTERING & SORTING
    // ============================================

    setSortMode(mode) {
        this.sortMode = mode;
        this.emit('sortChanged', mode);
    }

    setFilterMode(mode) {
        this.filterMode = mode;
        this.emit('filterChanged', mode);
    }

    getFilteredPosts() {
        let filtered = [...this.posts];

        // Apply filter
        if (this.filterMode !== 'all') {
            filtered = filtered.filter(post => post.type === this.filterMode);
        }

        // Apply sort
        if (this.sortMode === 'recent') {
            filtered.sort((a, b) => {
                // Pinned posts always on top
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return b.timestamp - a.timestamp;
            });
        } else if (this.sortMode === 'popular') {
            filtered.sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                const scoreA = a.likes * 2 + a.comments * 3 + a.shares * 5;
                const scoreB = b.likes * 2 + b.comments * 3 + b.shares * 5;
                return scoreB - scoreA;
            });
        } else if (this.sortMode === 'following') {
            // TODO: Filter by followed users
            filtered.sort((a, b) => b.timestamp - a.timestamp);
        }

        return filtered;
    }

    getSavedPosts() {
        return this.posts.filter(post => this.savedPosts.has(post.id));
    }

    getUserPosts(userId) {
        return this.posts.filter(post => post.userId === userId);
    }

    getPostComments(postId) {
        if (!this.comments[postId]) return [];
        
        // Build comment tree
        const comments = this.comments[postId];
        const topLevel = comments.filter(c => !c.parentId);
        
        topLevel.forEach(comment => {
            comment.repliesList = comments.filter(c => c.parentId === comment.id);
        });
        
        return topLevel;
    }

    // ============================================
    // SEARCH & DISCOVERY
    // ============================================

    searchPosts(query) {
        const lowerQuery = query.toLowerCase();
        return this.posts.filter(post => 
            post.content.toLowerCase().includes(lowerQuery) ||
            post.username.toLowerCase().includes(lowerQuery) ||
            post.displayName.toLowerCase().includes(lowerQuery) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );
    }

    getPostsBySport(sport) {
        return this.posts.filter(post => post.sport === sport);
    }

    getPostsByTag(tag) {
        return this.posts.filter(post => 
            post.tags && post.tags.includes(tag)
        );
    }

    getTrendingTags() {
        const tagCounts = {};
        
        this.posts.forEach(post => {
            if (post.tags) {
                post.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        return Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));
    }

    // ============================================
    // STATISTICS
    // ============================================

    getPostStats(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return null;

        return {
            likes: post.likes,
            comments: post.comments,
            shares: post.shares,
            saves: post.saves,
            engagement: post.likes + post.comments + post.shares,
            engagementRate: ((post.likes + post.comments + post.shares) / Math.max(1, this.currentUser.followers)) * 100
        };
    }

    getUserStats() {
        return {
            totalPosts: this.currentUser.totalPosts,
            totalLikes: this.currentUser.totalLikes,
            followers: this.currentUser.followers,
            following: this.currentUser.following,
            engagementRate: (this.currentUser.totalLikes / Math.max(1, this.currentUser.totalPosts)).toFixed(2)
        };
    }

    // ============================================
    // DEMO DATA
    // ============================================

    loadDemoData() {
        if (this.posts.length > 0) return; // Already have data

        const demoUsers = [
            { id: 'user_1', username: 'BettingKing', displayName: 'Mike Johnson', avatar: '👑', tier: 'VIP', verified: true },
            { id: 'user_2', username: 'SportsMaster', displayName: 'Sarah Chen', avatar: '🏆', tier: 'PRO', verified: true },
            { id: 'user_3', username: 'PropWizard', displayName: 'James Davis', avatar: '🎯', tier: 'VIP', verified: true },
            { id: 'user_4', username: 'DataNinja', displayName: 'Alex Kim', avatar: '📊', tier: 'PRO', verified: false },
            { id: 'user_5', username: 'SharpBettor', displayName: 'Emily Brown', avatar: '💎', tier: 'FREE', verified: false },
            { id: 'user_6', username: 'OddsHunter', displayName: 'Chris Wilson', avatar: '🔍', tier: 'PRO', verified: true }
        ];

        const demoPosts = [
            {
                user: demoUsers[0],
                content: '🔥 HUGE WIN! Hit a 6-leg parlay at +2800 odds! Lakers ML, Celtics spread, Warriors O226.5, Suns -3.5, Heat ML, and Nuggets O220. Sometimes you just gotta trust your gut! Who else had Lakers tonight? 💰',
                type: 'pick',
                sport: 'NBA',
                pick: {
                    legs: 6,
                    odds: 2800,
                    stake: 50,
                    payout: 1400,
                    status: 'won'
                },
                tags: ['NBA', 'Parlay', 'BigWin'],
                timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
                likes: 234,
                comments: 45,
                shares: 18,
                saves: 67
            },
            {
                user: demoUsers[1],
                content: 'My analysis on tonight\'s Lakers vs Celtics game:\n\nLakers are 8-2 ATS in their last 10 home games against Eastern Conference teams. LeBron averaging 28.5 PPG in last 6 games. Celtics missing Porzingis (injury). Line movement suggests sharp money on Lakers +4.5.\n\nI\'m taking Lakers +4.5 and OVER 225.5. Thoughts?',
                type: 'analysis',
                sport: 'NBA',
                game: { home: 'Lakers', away: 'Celtics', time: 'Today 7:30 PM' },
                tags: ['NBA', 'Analysis', 'Lakers', 'Celtics'],
                timestamp: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
                likes: 156,
                comments: 38,
                shares: 12,
                saves: 89
            },
            {
                user: demoUsers[2],
                content: '📊 Weekly Player Props Report:\n\nTop performers this week:\n• Stephen Curry OVER 4.5 3PM (7-1 record)\n• LeBron James OVER 26.5 pts (6-2)\n• Nikola Jokic Triple Double YES (+200) hit 3 times!\n\nTonight I\'m targeting Curry O4.5 3PM again. Warriors face bottom-ranked 3PT defense. He\'s averaging 6.2 3PM in last 5 games. Line is a gift! 🎁',
                type: 'analysis',
                sport: 'NBA',
                tags: ['NBA', 'Props', 'PlayerProps', 'Curry'],
                timestamp: Date.now() - 8 * 60 * 60 * 1000, // 8 hours ago
                likes: 189,
                comments: 52,
                shares: 24,
                saves: 134
            },
            {
                user: demoUsers[3],
                content: 'Just crossed 1,000 tracked bets on the platform! 🎉\n\nFinal Stats:\n📈 58.7% Win Rate\n💰 +47.3 Units Profit\n🎯 ROI: 12.4%\n📊 Best Sport: NBA (62% WR)\n\nThis platform\'s analytics tools have been game-changing. The AI coach predictions helped me avoid several bad bets. Big thanks to the community for all the insights! On to the next 1,000! 🚀',
                type: 'milestone',
                tags: ['Milestone', 'Stats', 'Community'],
                timestamp: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
                likes: 412,
                comments: 78,
                shares: 34,
                saves: 23
            },
            {
                user: demoUsers[4],
                content: 'Quick question for the pros here: When tracking bankroll, do you count pending bets as part of your available balance or do you subtract them immediately? I\'ve been subtracting but wondering what\'s the better practice. Thanks!',
                type: 'discussion',
                tags: ['BankrollManagement', 'Question'],
                timestamp: Date.now() - 18 * 60 * 60 * 1000, // 18 hours ago
                likes: 67,
                comments: 42,
                shares: 3,
                saves: 15
            },
            {
                user: demoUsers[5],
                content: '⚠️ Arbitrage Alert! Found a 4.2% ROI opportunity:\n\nLakers vs Celtics\n• Lakers +4.5 at -110 (DraftKings)\n• Celtics -4.5 at +105 (FanDuel)\n\nStake $546 on Lakers, $454 on Celtics = guaranteed $23 profit! Moving fast though, get in quick! ⏰',
                type: 'pick',
                sport: 'NBA',
                pick: {
                    type: 'arbitrage',
                    roi: 4.2,
                    profit: 23
                },
                tags: ['Arbitrage', 'NBA', 'FreeMoney'],
                timestamp: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
                likes: 203,
                comments: 34,
                shares: 56,
                saves: 178
            },
            {
                user: demoUsers[0],
                content: 'Loving the new Injury Impact Tracker! Just saw that Embiid is doubtful for tonight - the tracker shows a 7.8 point line movement expected. Immediately adjusted my 76ers bet. This feature is seriously a game-changer! Who else is using it? 🏥📊',
                type: 'discussion',
                tags: ['InjuryTracker', 'Features', 'NBA'],
                timestamp: Date.now() - 30 * 60 * 60 * 1000, // 1.25 days ago
                likes: 145,
                comments: 29,
                shares: 11,
                saves: 45
            },
            {
                user: demoUsers[1],
                content: 'Sunday Morning Betting Tips 🌅\n\n1. Never chase losses - stick to your unit size\n2. Track EVERYTHING - you can\'t improve what you don\'t measure\n3. Line shopping is free money - always compare odds\n4. Trust the process, not individual bets\n5. Community insights > solo research\n\nWhat\'s your #1 betting rule? Drop it below! 👇',
                type: 'discussion',
                tags: ['Tips', 'BettingStrategy', 'Community'],
                timestamp: Date.now() - 36 * 60 * 60 * 1000, // 1.5 days ago
                likes: 298,
                comments: 67,
                shares: 45,
                saves: 234
            }
        ];

        // Create posts
        demoPosts.forEach(demoPost => {
            const post = {
                id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: demoPost.user.id,
                username: demoPost.user.username,
                displayName: demoPost.user.displayName,
                avatar: demoPost.user.avatar,
                tier: demoPost.user.tier,
                verified: demoPost.user.verified,
                content: demoPost.content,
                type: demoPost.type,
                sport: demoPost.sport || null,
                game: demoPost.game || null,
                pick: demoPost.pick || null,
                media: demoPost.media || [],
                tags: demoPost.tags || [],
                timestamp: demoPost.timestamp,
                edited: false,
                editedAt: null,
                likes: demoPost.likes || 0,
                comments: demoPost.comments || 0,
                shares: demoPost.shares || 0,
                saves: demoPost.saves || 0,
                likedBy: [],
                commentList: [],
                visibility: 'public',
                pinned: false
            };

            this.posts.push(post);

            // Add some demo likes
            const likeCount = Math.floor(Math.random() * 50);
            this.likes[post.id] = new Set();
            for (let i = 0; i < likeCount; i++) {
                const userId = `user_${Math.floor(Math.random() * 100)}`;
                this.likes[post.id].add(userId);
                post.likedBy.push(userId);
            }
        });

        // Add some demo comments
        const demoComments = [
            { postIndex: 0, content: 'Congrats! What made you confident in that Warriors over? 🤔', user: demoUsers[1] },
            { postIndex: 0, content: 'Insane hit! I had 5 legs but missed on the Suns spread 😭', user: demoUsers[2] },
            { postIndex: 0, content: 'That\'s the dream! Did you hedge at all?', user: demoUsers[3] },
            { postIndex: 1, content: 'Great analysis! I\'m on Celtics -4 though. Think they bounce back strong.', user: demoUsers[0] },
            { postIndex: 1, content: 'Love the statistical approach. Following your picks!', user: demoUsers[3] },
            { postIndex: 2, content: 'Been following your props! That Curry line is printing money 💰', user: demoUsers[4] },
            { postIndex: 2, content: 'What site do you use for prop research?', user: demoUsers[5] },
            { postIndex: 3, content: 'Incredible stats! What was your biggest winning streak?', user: demoUsers[2] },
            { postIndex: 4, content: 'I subtract immediately. Helps me stay disciplined and not over-bet.', user: demoUsers[0] },
            { postIndex: 4, content: 'Same here - treat pending as gone. Keeps me honest with bankroll management.', user: demoUsers[1] }
        ];

        demoComments.forEach(dc => {
            const post = this.posts[dc.postIndex];
            if (post) {
                const comment = {
                    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    postId: post.id,
                    parentId: null,
                    userId: dc.user.id,
                    username: dc.user.username,
                    displayName: dc.user.displayName,
                    avatar: dc.user.avatar,
                    tier: dc.user.tier,
                    verified: dc.user.verified,
                    content: dc.content,
                    timestamp: post.timestamp + Math.floor(Math.random() * 3600000), // Within 1 hour of post
                    edited: false,
                    editedAt: null,
                    likes: Math.floor(Math.random() * 20),
                    replies: 0,
                    likedBy: []
                };

                if (!this.comments[post.id]) {
                    this.comments[post.id] = [];
                }
                this.comments[post.id].push(comment);
            }
        });

        this.saveToStorage();
    }

    // ============================================
    // STORAGE
    // ============================================

    saveToStorage() {
        try {
            localStorage.setItem('social_feed_posts', JSON.stringify(this.posts));
            localStorage.setItem('social_feed_comments', JSON.stringify(
                Object.fromEntries(
                    Object.entries(this.comments).map(([k, v]) => [k, v])
                )
            ));
            localStorage.setItem('social_feed_likes', JSON.stringify(
                Object.fromEntries(
                    Object.entries(this.likes).map(([k, v]) => [k, Array.from(v)])
                )
            ));
            localStorage.setItem('social_feed_saved', JSON.stringify(Array.from(this.savedPosts)));
        } catch (error) {
            console.error('Failed to save social feed data:', error);
        }
    }

    loadFromStorage() {
        try {
            const postsData = localStorage.getItem('social_feed_posts');
            const commentsData = localStorage.getItem('social_feed_comments');
            const likesData = localStorage.getItem('social_feed_likes');
            const savedData = localStorage.getItem('social_feed_saved');

            if (postsData) this.posts = JSON.parse(postsData);
            if (commentsData) {
                const parsed = JSON.parse(commentsData);
                this.comments = parsed;
            }
            if (likesData) {
                const parsed = JSON.parse(likesData);
                this.likes = Object.fromEntries(
                    Object.entries(parsed).map(([k, v]) => [k, new Set(v)])
                );
            }
            if (savedData) this.savedPosts = new Set(JSON.parse(savedData));
        } catch (error) {
            console.error('Failed to load social feed data:', error);
        }
    }

    clearAllData() {
        this.posts = [];
        this.comments = {};
        this.likes = {};
        this.savedPosts = new Set();
        localStorage.removeItem('social_feed_posts');
        localStorage.removeItem('social_feed_comments');
        localStorage.removeItem('social_feed_likes');
        localStorage.removeItem('social_feed_saved');
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
window.socialFeedSystem = new SocialFeedSystem();
