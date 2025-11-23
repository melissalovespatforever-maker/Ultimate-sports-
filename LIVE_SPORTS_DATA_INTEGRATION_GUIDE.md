# 🏈 Live Sports Data Integration Guide

## Overview

This guide explains how to integrate real live sports data into Ultimate Sports AI Platform. We'll cover API options, implementation, and best practices.

---

## 🎯 Recommended Sports Data APIs

### 1. **The Odds API** ⭐ RECOMMENDED FOR ODDS
- **Website**: https://the-odds-api.com
- **Best For**: Live odds from multiple sportsbooks
- **Free Tier**: 500 requests/month
- **Paid Plans**: $29/month (10K requests), $79/month (50K), $179/month (150K)
- **Coverage**: 30+ sportsbooks, 20+ sports
- **Data**: Odds (moneyline, spread, totals), line movement
- **Update Frequency**: Every 5-10 minutes
- **Quality**: ⭐⭐⭐⭐⭐ (Industry standard)

**Perfect for:**
- Arbitrage detection
- Line movement tracking  
- Odds comparison
- Best line finder

### 2. **ESPN API** (Unofficial) - FREE
- **Website**: http://site.api.espn.com/apis/site/v2/sports/
- **Best For**: Scores, schedules, team stats
- **Cost**: FREE (unofficial, no auth required)
- **Coverage**: NFL, NBA, MLB, NHL, Soccer, etc.
- **Data**: Live scores, schedules, team info, standings
- **Quality**: ⭐⭐⭐⭐ (Reliable but unofficial)

**Perfect for:**
- Live scores
- Game schedules
- Team information
- Basic statistics

### 3. **SportsData.io** (formerly SportsDataIO)
- **Website**: https://sportsdata.io
- **Best For**: Comprehensive sports data
- **Free Tier**: 1,000 calls/month per sport
- **Paid Plans**: $19-$799/month depending on sport
- **Coverage**: NFL, NBA, MLB, NHL, Soccer, etc.
- **Data**: Scores, stats, projections, injuries, news
- **Quality**: ⭐⭐⭐⭐⭐ (Professional grade)

**Perfect for:**
- Detailed statistics
- Player data
- Injury reports
- Historical data

### 4. **API-FOOTBALL** / **API-NBA** / **API-MLB**
- **Website**: https://www.api-football.com (also api-basketball, api-baseball)
- **Best For**: Sport-specific detailed data
- **Free Tier**: 100 requests/day
- **Paid Plans**: $25-$120/month
- **Coverage**: Deep sport-specific data
- **Quality**: ⭐⭐⭐⭐

### 5. **Sportradar** (Enterprise)
- **Website**: https://sportradar.com
- **Best For**: Enterprise-level data
- **Cost**: Custom pricing ($$$$)
- **Coverage**: Official data partnerships
- **Quality**: ⭐⭐⭐⭐⭐ (Used by major sportsbooks)

**Only for:**
- Large-scale production
- Official partnerships
- High-volume applications

---

## 💡 Recommended Setup for Your Platform

### Optimal API Combination:

```
1. The Odds API (Primary) - $29/month
   - Live odds from 30+ sportsbooks
   - Arbitrage detection
   - Line movement tracking
   
2. ESPN API (Secondary) - FREE
   - Live scores
   - Game schedules
   - Team information
   
3. SportsData.io (Optional) - FREE tier
   - Player statistics
   - Injury reports
   - Advanced analytics
```

**Total Monthly Cost:** $29-50 (depending on usage)

---

## 🔧 Implementation Steps

### Step 1: Get API Keys

**The Odds API:**
1. Go to https://the-odds-api.com
2. Sign up for free account
3. Get API key from dashboard
4. Start with free tier (500 requests/month)
5. Upgrade to $29/month for production (10K requests)

**SportsData.io (Optional):**
1. Go to https://sportsdata.io
2. Sign up and select sport (NFL, NBA, etc.)
3. Get API key from dashboard
4. Free tier: 1,000 requests/month

### Step 2: Store API Keys Securely

**Never commit API keys to Git!**

Create `.env` file in your project root:
```bash
# .env (Add to .gitignore!)
THE_ODDS_API_KEY=your_odds_api_key_here
SPORTSDATA_API_KEY=your_sportsdata_key_here
```

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

### Step 3: Install Dependencies (if using Node.js backend)

```bash
npm install axios dotenv node-cache
```

For frontend-only (Rosebud environment):
- Use built-in `fetch()` API
- Store keys in environment variables (Rosebud platform settings)
- Implement CORS proxy if needed

---

## 📝 Code Implementation

### A. Basic API Service (api-service.js)

```javascript
// api-service.js
class SportsDataAPI {
    constructor() {
        // In production, these would come from environment variables
        this.oddsAPIKey = process.env.THE_ODDS_API_KEY || 'demo_key';
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    // Get live odds from The Odds API
    async getLiveOdds(sport = 'basketball_nba') {
        const cacheKey = `odds_${sport}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(
                `https://api.the-odds-api.com/v4/sports/${sport}/odds/?` +
                `apiKey=${this.oddsAPIKey}&` +
                `regions=us&` +
                `markets=h2h,spreads,totals&` +
                `oddsFormat=american`
            );

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            this.setCache(cacheKey, data);
            
            // Log remaining requests (in response headers)
            const remaining = response.headers.get('x-requests-remaining');
            console.log(`Odds API requests remaining: ${remaining}`);
            
            return data;
        } catch (error) {
            console.error('Error fetching odds:', error);
            return this.getFallbackData(sport);
        }
    }

    // Get live scores from ESPN API (free)
    async getLiveScores(sport = 'basketball', league = 'nba') {
        const cacheKey = `scores_${sport}_${league}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(
                `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`
            );

            const data = await response.json();
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching scores:', error);
            return null;
        }
    }

    // Get upcoming games schedule
    async getSchedule(sport = 'basketball_nba') {
        // Similar to getLiveOdds but for schedule endpoint
        try {
            const response = await fetch(
                `https://api.the-odds-api.com/v4/sports/${sport}/events/?` +
                `apiKey=${this.oddsAPIKey}`
            );

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            return [];
        }
    }

    // Cache management
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        const now = Date.now();
        if (now - cached.timestamp > this.cacheExpiry) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }

    // Fallback to demo data if API fails
    getFallbackData(sport) {
        console.warn('Using fallback demo data');
        // Return your existing demo data
        return [];
    }
}

export const sportsDataAPI = new SportsDataAPI();
```

### B. Data Transformer (data-transformer.js)

```javascript
// data-transformer.js
// Converts API responses to your app's format

class DataTransformer {
    // Transform The Odds API response to your game format
    transformOddsAPIToGames(oddsData) {
        return oddsData.map(game => {
            const bookmakers = game.bookmakers || [];
            
            // Extract odds from each bookmaker
            const oddsMap = {};
            bookmakers.forEach(book => {
                const bookId = this.normalizeBookmakerName(book.key);
                oddsMap[bookId] = this.extractOddsFromBookmaker(book);
            });

            return {
                id: game.id,
                sport: this.normalizeSportName(game.sport_key),
                homeTeam: game.home_team,
                awayTeam: game.away_team,
                commenceTime: new Date(game.commence_time),
                time: this.formatGameTime(game.commence_time),
                odds: oddsMap,
                status: this.getGameStatus(game.commence_time)
            };
        });
    }

    extractOddsFromBookmaker(bookmaker) {
        const odds = {
            homeML: null,
            awayML: null,
            homeSpread: null,
            awaySpread: null,
            homeSpreadOdds: null,
            awaySpreadOdds: null,
            total: null,
            overOdds: null,
            underOdds: null
        };

        bookmaker.markets?.forEach(market => {
            if (market.key === 'h2h') {
                // Moneyline
                market.outcomes.forEach(outcome => {
                    if (outcome.name === bookmaker.home_team) {
                        odds.homeML = outcome.price;
                    } else {
                        odds.awayML = outcome.price;
                    }
                });
            } else if (market.key === 'spreads') {
                // Spread
                market.outcomes.forEach(outcome => {
                    if (outcome.name === bookmaker.home_team) {
                        odds.homeSpread = outcome.point;
                        odds.homeSpreadOdds = outcome.price;
                    } else {
                        odds.awaySpread = outcome.point;
                        odds.awaySpreadOdds = outcome.price;
                    }
                });
            } else if (market.key === 'totals') {
                // Totals
                market.outcomes.forEach(outcome => {
                    odds.total = outcome.point;
                    if (outcome.name === 'Over') {
                        odds.overOdds = outcome.price;
                    } else {
                        odds.underOdds = outcome.price;
                    }
                });
            }
        });

        return odds;
    }

    // Transform ESPN API response to game format
    transformESPNToGames(espnData) {
        const events = espnData.events || [];
        
        return events.map(event => {
            const competition = event.competitions[0];
            const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
            const awayTeam = competition.competitors.find(c => c.homeAway === 'away');

            return {
                id: event.id,
                sport: this.normalizeSportName(espnData.leagues[0]?.abbreviation),
                homeTeam: homeTeam.team.displayName,
                awayTeam: awayTeam.team.displayName,
                homeScore: parseInt(homeTeam.score) || 0,
                awayScore: parseInt(awayTeam.score) || 0,
                status: competition.status.type.state,
                period: competition.status.period,
                clock: competition.status.displayClock,
                commenceTime: new Date(event.date),
                venue: competition.venue?.fullName
            };
        });
    }

    normalizeBookmakerName(apiKey) {
        const mapping = {
            'draftkings': 'draftkings',
            'fanduel': 'fanduel',
            'betmgm': 'betmgm',
            'caesars': 'caesars',
            'pointsbet': 'pointsbet',
            'wynnbet': 'wynnbet',
            'barstool': 'barstool',
            'unibet': 'unibet'
        };
        return mapping[apiKey] || apiKey;
    }

    normalizeSportName(apiSport) {
        const mapping = {
            'basketball_nba': 'NBA',
            'americanfootball_nfl': 'NFL',
            'baseball_mlb': 'MLB',
            'icehockey_nhl': 'NHL',
            'soccer_epl': 'EPL'
        };
        return mapping[apiSport] || apiSport.toUpperCase();
    }

    formatGameTime(isoTime) {
        const date = new Date(isoTime);
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === now.toDateString()) {
            return `Today ${date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
            })}`;
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow ${date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
            })}`;
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
        }
    }

    getGameStatus(commenceTime) {
        const now = new Date();
        const gameTime = new Date(commenceTime);
        
        if (gameTime > now) return 'upcoming';
        
        const hoursSince = (now - gameTime) / (1000 * 60 * 60);
        if (hoursSince < 4) return 'live';
        
        return 'final';
    }
}

export const dataTransformer = new DataTransformer();
```

### C. Integration with Existing Systems

```javascript
// Update arbitrage-detector-engine.js

import { sportsDataAPI } from './api-service.js';
import { dataTransformer } from './data-transformer.js';

class ArbitrageDetectorEngine {
    // ... existing code ...

    async loadGamesWithOdds() {
        try {
            // Try to get real data first
            const oddsData = await sportsDataAPI.getLiveOdds('basketball_nba');
            const games = dataTransformer.transformOddsAPIToGames(oddsData);
            
            if (games.length > 0) {
                return games;
            }
        } catch (error) {
            console.error('Failed to load live data, using demo:', error);
        }

        // Fallback to demo data
        return this.generateDemoGames();
    }

    // Keep existing demo method as fallback
    generateDemoGames() {
        // Your existing demo game generation
    }
}
```

---

## 📊 API Response Examples

### The Odds API Response:
```json
[
  {
    "id": "abc123",
    "sport_key": "basketball_nba",
    "sport_title": "NBA",
    "commence_time": "2024-01-15T19:30:00Z",
    "home_team": "Los Angeles Lakers",
    "away_team": "Golden State Warriors",
    "bookmakers": [
      {
        "key": "draftkings",
        "title": "DraftKings",
        "markets": [
          {
            "key": "h2h",
            "outcomes": [
              {
                "name": "Los Angeles Lakers",
                "price": -150
              },
              {
                "name": "Golden State Warriors",
                "price": 130
              }
            ]
          },
          {
            "key": "spreads",
            "outcomes": [
              {
                "name": "Los Angeles Lakers",
                "price": -110,
                "point": -3.5
              },
              {
                "name": "Golden State Warriors",
                "price": -110,
                "point": 3.5
              }
            ]
          },
          {
            "key": "totals",
            "outcomes": [
              {
                "name": "Over",
                "price": -110,
                "point": 225.5
              },
              {
                "name": "Under",
                "price": -110,
                "point": 225.5
              }
            ]
          }
        ]
      },
      {
        "key": "fanduel",
        "title": "FanDuel",
        "markets": [...]
      }
    ]
  }
]
```

### ESPN API Response:
```json
{
  "events": [
    {
      "id": "401584901",
      "date": "2024-01-15T19:30:00Z",
      "name": "Golden State Warriors at Los Angeles Lakers",
      "competitions": [
        {
          "competitors": [
            {
              "id": "13",
              "team": {
                "displayName": "Los Angeles Lakers",
                "abbreviation": "LAL"
              },
              "score": "112",
              "homeAway": "home"
            },
            {
              "id": "9",
              "team": {
                "displayName": "Golden State Warriors",
                "abbreviation": "GSW"
              },
              "score": "108",
              "homeAway": "away"
            }
          ],
          "status": {
            "type": {
              "state": "in",
              "description": "In Progress"
            },
            "period": 4,
            "displayClock": "2:45"
          }
        }
      ]
    }
  ]
}
```

---

## ⚡ Best Practices

### 1. Rate Limiting
```javascript
class RateLimiter {
    constructor(requestsPerMinute) {
        this.limit = requestsPerMinute;
        this.requests = [];
    }

    async throttle() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < 60000);
        
        if (this.requests.length >= this.limit) {
            const oldestRequest = Math.min(...this.requests);
            const waitTime = 60000 - (now - oldestRequest);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.requests.push(now);
    }
}
```

### 2. Caching Strategy
- Cache for 5-10 minutes for odds (they don't change that fast)
- Cache for 30 seconds for live scores
- Cache for 1 hour for schedules
- Clear cache on user refresh action

### 3. Error Handling
```javascript
async fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) return await response.json();
            
            if (response.status === 429) {
                // Rate limited, wait longer
                await new Promise(resolve => setTimeout(resolve, 5000 * (i + 1)));
                continue;
            }
            
            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}
```

### 4. Cost Optimization
- **Batch requests**: Get all sports in one call if possible
- **Aggressive caching**: Don't fetch more than needed
- **Monitor usage**: Track API calls in logs
- **Fallback data**: Always have demo data as backup
- **Lazy loading**: Only fetch data when user views that section

---

## 📈 Monitoring API Usage

```javascript
class APIUsageTracker {
    constructor() {
        this.calls = {
            total: 0,
            byEndpoint: {},
            byDay: {}
        };
    }

    trackCall(endpoint) {
        this.calls.total++;
        this.calls.byEndpoint[endpoint] = (this.calls.byEndpoint[endpoint] || 0) + 1;
        
        const today = new Date().toISOString().split('T')[0];
        this.calls.byDay[today] = (this.calls.byDay[today] || 0) + 1;
        
        this.saveToStorage();
    }

    getUsageReport() {
        return {
            total: this.calls.total,
            today: this.calls.byDay[new Date().toISOString().split('T')[0]] || 0,
            breakdown: this.calls.byEndpoint
        };
    }

    saveToStorage() {
        localStorage.setItem('api_usage', JSON.stringify(this.calls));
    }
}
```

---

## 🚀 Implementation Checklist

### Phase 1: Setup (Day 1)
- [ ] Sign up for The Odds API (free tier)
- [ ] Get API key
- [ ] Test API with Postman/curl
- [ ] Create api-service.js
- [ ] Test connection with console.log

### Phase 2: Integration (Day 2-3)
- [ ] Create data-transformer.js
- [ ] Update arbitrage-detector-engine.js
- [ ] Update parlay-builder-engine.js
- [ ] Add caching layer
- [ ] Test with real data

### Phase 3: Error Handling (Day 4)
- [ ] Add fallback to demo data
- [ ] Implement retry logic
- [ ] Add loading states in UI
- [ ] Handle rate limits
- [ ] Add error messages

### Phase 4: Optimization (Day 5)
- [ ] Implement aggressive caching
- [ ] Add usage tracking
- [ ] Optimize API calls
- [ ] Test cost per day
- [ ] Monitor performance

### Phase 5: Production (Day 6-7)
- [ ] Move to paid tier if needed
- [ ] Add monitoring dashboard
- [ ] Set up alerts for API failures
- [ ] Document API usage for users
- [ ] Add admin panel for API stats

---

## 💰 Cost Estimation

### Conservative Usage (Free Tier - 500 requests/month):
- Refresh odds every 10 minutes during peak hours (8 hours/day)
- 48 refreshes × 30 days = 1,440 refreshes
- **Exceeds free tier** - Need paid plan

### Recommended ($29/month - 10,000 requests):
- Refresh odds every 5 minutes during peak hours
- 12 refreshes/hour × 8 hours × 30 days = 2,880 requests
- Plus user-triggered refreshes: ~1,000/month
- **Total: ~4,000 requests/month** ✅ Well within limit

### With Growth ($79/month - 50,000 requests):
- Support 100+ concurrent users
- Real-time updates every minute
- Multiple sports simultaneously
- Room for 10x growth

---

## 🎓 Next Steps

1. **Start with The Odds API free tier** to test integration
2. **Use ESPN API** for live scores (completely free)
3. **Upgrade to $29/month** when ready for production
4. **Add SportsData.io** later for advanced features (injuries, stats)

**Total First Month Cost:** $0 (testing) → $29 (production)

This setup gives you professional-grade live data for less than $1/day! 🚀
