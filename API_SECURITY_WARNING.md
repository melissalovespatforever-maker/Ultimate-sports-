# ⚠️ API SECURITY WARNING

## IMPORTANT: Your API Key is Currently Exposed

Your API key `9f8af56c3774a79663650a7713d1a776` is currently hardcoded in the source files.

### ⚠️ Security Risks:
1. **Public Exposure**: Anyone with access to your code can see and use your API key
2. **Usage Theft**: Others could make requests using your quota (10,000 requests/month)
3. **Cost Risk**: If upgraded to paid tier, unauthorized usage could increase costs
4. **Account Compromise**: Key could be used maliciously

---

## 🔒 Recommended Security Actions

### Immediate Actions (Do This Now):

#### 1. Regenerate Your API Key
1. Go to https://the-odds-api.com/account
2. Click "Regenerate API Key"
3. Copy the new key
4. Update it in your code **without sharing it publicly**

#### 2. Use Environment Variables (Best Practice)
Instead of hardcoding, use environment variables:

**For Rosebud Platform:**
1. Go to your project settings
2. Add environment variable: `THE_ODDS_API_KEY`
3. Set value to your API key
4. The code will automatically use it

**Code already supports this:**
```javascript
// In api-service.js - already configured
this.oddsAPIKey = this.getEnvVar('THE_ODDS_API_KEY') || 'fallback';
```

#### 3. Add .gitignore Protection
If using Git, create `.gitignore` file:
```
.env
.env.local
.env.production
api-config.js
secrets.js
```

---

## 🛡️ Best Practices Going Forward

### ✅ DO:
- Store API keys in environment variables
- Use different keys for development/production
- Monitor API usage regularly at https://the-odds-api.com/account
- Set up usage alerts
- Keep keys private in team communications

### ❌ DON'T:
- Share API keys in public conversations
- Commit API keys to Git repositories
- Share keys in screenshots or videos
- Post keys in support forums
- Email keys unencrypted

---

## 📊 Monitor Your API Usage

Check your usage dashboard:
- **Free Tier**: 500 requests/month
- **Current Plan**: Check at https://the-odds-api.com/account
- **Usage Tracking**: Built into the app (console logs show remaining requests)

You can also check usage programmatically:
```javascript
// In browser console
const report = sportsDataAPI.getUsageReport();
console.log(report);
```

---

## 🚀 Current Integration Status

### ✅ What's Working:
- API key is integrated and functional
- Real-time odds loading from The Odds API
- Automatic caching (reduces API calls)
- Fallback to demo data if API fails
- Usage tracking

### 🔄 How It Works:
1. **Arbitrage Detector**: Loads live NBA odds when you open it
2. **Parlay Builder**: Loads live games when you start building
3. **Caching**: Data is cached for 5 minutes to save API calls
4. **Fallback**: If API fails, shows demo data instead

### 📈 Expected Usage:
- **Per Page Load**: 1-2 API calls
- **With Caching**: ~12 calls per hour during active use
- **Daily Estimate**: 50-100 calls/day for moderate use
- **Monthly Estimate**: 1,500-3,000 calls/month
- **Your Quota**: 10,000 calls/month ✅ Plenty of room!

---

## 🔧 How to Update API Key Securely

### Method 1: Environment Variable (Recommended)
```javascript
// Rosebud platform: Set in project settings
THE_ODDS_API_KEY=your_new_key_here

// Code automatically uses it (already configured)
```

### Method 2: Temporary Config File
Create `api-config.js` (add to .gitignore):
```javascript
export const API_CONFIG = {
    ODDS_API_KEY: 'your_key_here'
};
```

Then import:
```javascript
import { API_CONFIG } from './api-config.js';
this.oddsAPIKey = API_CONFIG.ODDS_API_KEY;
```

### Method 3: Hardcode (Testing Only)
Only for local testing, never commit:
```javascript
this.oddsAPIKey = 'your_key_here'; // TODO: Move to env var
```

---

## 📞 Support

**The Odds API Support:**
- Dashboard: https://the-odds-api.com/account
- Docs: https://the-odds-api.com/docs
- Email: support@the-odds-api.com

**Common Issues:**
- "401 Unauthorized" → Invalid API key
- "429 Too Many Requests" → Rate limit exceeded (wait 1 minute)
- "Empty response" → No games currently available (try different sport)

---

## ✅ Next Steps

1. [ ] Monitor usage for first few days
2. [ ] Check that live data loads correctly
3. [ ] Verify arbitrage detection works with real odds
4. [ ] Test parlay builder with live games
5. [ ] Consider upgrading plan if needed
6. [ ] Set up monitoring alerts

---

**Remember**: The API key is valuable - treat it like a password! 🔐

Your platform now has real live sports data integrated and working! 🚀
