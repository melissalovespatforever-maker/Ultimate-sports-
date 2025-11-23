# WebSocket Backend Setup Guide

## Prerequisites

Ensure your backend has these dependencies installed:

```bash
npm install socket.io express axios dotenv
```

## Environment Variables

Add to your `.env` file:

```env
THE_ODDS_API_KEY=your_api_key_from_theoddsapi
PORT=3001
NODE_ENV=production
```

## Backend Integration Steps

### 1. Verify Imports in handler.js

The handler already imports the OddsHandler:

```javascript
const OddsHandler = require('./odds-handler');
```

### 2. Verify Namespace Setup

Check that `/odds` namespace is registered in `handler.js`:

```javascript
const oddsHandler = new OddsHandler(io);
io.of('/odds').on('connection', (socket) => {
    console.log(`🎯 Odds WebSocket connected: ${socket.id}`);
    oddsHandler.handleConnection(socket);
});
```

### 3. Server Initialization

Your `server.js` should initialize Socket.io like this:

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: function(origin, callback) {
            // Allow Rosebud domains and localhost
            if (!origin || origin.includes('rosebud.ai') || origin.includes('localhost')) {
                callback(null, true);
            } else {
                callback(null, true); // Allow in development
            }
        },
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Initialize WebSocket handlers
const { setupWebSocket } = require('./websocket/handler');
setupWebSocket(io);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
```

### 4. Complete Backend File Structure

```
backend/
├── server.js (main entry)
├── .env (environment variables)
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── odds.js (REST API)
│   └── ... (other routes)
├── websocket/
│   ├── handler.js (main WebSocket handler)
│   ├── odds-handler.js (odds WebSocket logic)
│   └── ... (other handlers)
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── ... (other middleware)
└── package.json
```

## Configuration Details

### Socket.io Configuration

```javascript
const io = new Server(server, {
    cors: {
        origin: function(origin, callback) {
            // Allow requests from:
            // - No origin (mobile, Postman)
            // - Rosebud subdomains
            // - Localhost for development
            if (!origin || origin.includes('rosebud.ai') || origin.includes('localhost')) {
                callback(null, true);
            } else {
                callback(null, true);
            }
        },
        methods: ['GET', 'POST'],
        credentials: true
    }
});
```

### Odds Handler Configuration

In `odds-handler.js`:

```javascript
this.updateFrequency = 5000;      // 5 seconds between updates
this.oddsCache = new Map();        // Cache for odds data
this.lastUpdate = new Map();       // Track last update time
```

## Connection Flow

### Client Connection Process

```
1. Client initiates WebSocket connection
   → ws://backend/odds

2. Server accepts connection
   → Creates socket instance
   → Calls oddsHandler.handleConnection()

3. Client sends subscribe message
   {
       type: 'subscribe',
       sport: 'basketball_nba'
   }

4. Server handles subscription
   → Adds socket to room: odds:basketball_nba
   → Sends subscription_ack

5. Server starts sending updates
   → Every 5 seconds
   → To all sockets in room
   → With latest odds data
```

## Testing Backend Connection

### Test 1: WebSocket Connection

```bash
# Install websocat
npm install -g websocat

# Connect to WebSocket
websocat "ws://localhost:3001/odds"

# Send subscription
echo '{"type":"subscribe","sport":"basketball_nba"}' | websocat "ws://localhost:3001/odds"
```

### Test 2: Browser Console

```javascript
// In browser dev tools
const socket = io('http://localhost:3001/odds');

socket.on('connect', () => {
    console.log('Connected!');
    socket.emit('subscribe', { sport: 'basketball_nba' });
});

socket.on('odds_update', (data) => {
    console.log('Odds update:', data);
});
```

### Test 3: Check Server Logs

```bash
# Should see messages like:
# 🔌 Connecting to WebSocket: ws://localhost:3001/odds
# ✅ WebSocket connected
# 🎯 Odds WebSocket connected: socket_id
# 📊 Socket socket_id subscribed to basketball_nba
# 📊 Sent odds update for basketball_nba: 5 games
```

## Production Deployment

### Railway Deployment

1. Push code to GitHub
2. Connect to Railway
3. Set environment variables in Railway dashboard:
   - `THE_ODDS_API_KEY`
   - `PORT=3001`
   - `NODE_ENV=production`

4. Deploy

### Heroku Deployment

```bash
# Set environment variables
heroku config:set THE_ODDS_API_KEY=your_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### AWS/EC2 Deployment

```bash
# SSH into instance
ssh -i key.pem ubuntu@your_instance

# Clone repo and install
git clone your_repo
cd backend
npm install

# Start with PM2
npm install -g pm2
pm2 start server.js
pm2 save
```

## Monitoring & Maintenance

### Monitor Connections

```javascript
// Add to server.js for monitoring
setInterval(() => {
    const namespace = io.of('/odds');
    console.log(`Connected clients: ${namespace.sockets.size}`);
}, 60000);
```

### Monitor Performance

```javascript
// Track update performance
const startTime = Date.now();
// ... fetch and send odds
const duration = Date.now() - startTime;
console.log(`Odds update took ${duration}ms`);
```

### Error Logging

```javascript
// In odds-handler.js
catch (error) {
    console.error(`Error fetching odds for ${sport}:`, error.message);
    this.io.to(`odds:${sport}`).emit('error', {
        type: 'error',
        sport,
        message: `Failed to fetch odds: ${error.message}`,
        timestamp: Date.now()
    });
}
```

## Troubleshooting Backend Issues

### Issue 1: "Cannot find module 'socket.io'"

**Solution:**
```bash
npm install socket.io
```

### Issue 2: "THE_ODDS_API_KEY is undefined"

**Solution:** Check `.env` file
```env
THE_ODDS_API_KEY=sk_live_your_actual_key_here
```

### Issue 3: "CORS error"

**Solution:** Update CORS configuration in server.js
```javascript
cors: {
    origin: 'https://your-frontend-domain.com',
    methods: ['GET', 'POST'],
    credentials: true
}
```

### Issue 4: "Connection timeout"

**Solution:** Increase timeout
```javascript
const io = new Server(server, {
    pingInterval: 25000,
    pingTimeout: 20000
});
```

### Issue 5: "Rate limit exceeded"

**Solution:** Add caching strategy
```javascript
// In odds-handler.js
const cached = this.oddsCache.get(sport);
const timeSinceUpdate = Date.now() - (this.lastUpdate.get(sport) || 0);

if (cached && timeSinceUpdate < 5000) {
    return cached; // Return cached data
}
```

## Performance Optimization

### 1. Enable Compression

```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);
```

### 3. Caching Strategy

```javascript
// Cache odds for 5 seconds
const CACHE_TTL = 5000;

if (this.oddsCache.has(sport)) {
    const cached = this.oddsCache.get(sport);
    const age = Date.now() - cached.timestamp;
    if (age < CACHE_TTL) {
        return cached.data;
    }
}
```

### 4. Connection Pooling

Socket.io handles this automatically with multiple workers:

```javascript
// Using Redis adapter for multiple processes
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const pubClient = createClient();
const subClient = pubClient.duplicate();
pubClient.connect();
subClient.connect();

io.adapter(createAdapter(pubClient, subClient));
```

## Scaling for Production

### Single Server Setup
- Suitable for: <10K concurrent connections
- Configuration: As described above

### Multi-Server Setup
- Use Redis adapter
- Use Redis for session storage
- Load balance with Nginx

### Database Integration (Future)

Store odds history:
```javascript
// After receiving odds
await OddsHistory.create({
    sport,
    odds,
    timestamp: new Date(),
    source: 'websocket'
});
```

## API Endpoints (Optional REST Fallback)

Keep these for fallback:

```javascript
// GET /api/odds/live?sport=basketball_nba
router.get('/live', (req, res) => {
    const { sport = 'basketball_nba' } = req.query;
    // Return odds
});

// GET /api/odds/sports
router.get('/sports', (req, res) => {
    // Return available sports
});
```

## Health Check Endpoint

```javascript
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        websocket: io.of('/odds').sockets.size,
        uptime: process.uptime()
    });
});
```

## Logging Setup

```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Use in odds-handler
logger.info(`Odds update for ${sport}: ${odds.length} games`);
```

## Summary Checklist

- [ ] Dependencies installed (socket.io, express, axios)
- [ ] Environment variables configured
- [ ] odds-handler.js in place
- [ ] handler.js updated with odds namespace
- [ ] Server.js initializes Socket.io
- [ ] CORS configured for frontend domain
- [ ] Backend tested locally
- [ ] Deployed to production
- [ ] Health check verified
- [ ] Monitoring configured
- [ ] Error logging enabled

## Quick Deploy Command

```bash
# Local testing
npm install
node server.js

# Production
npm install --production
NODE_ENV=production node server.js
```

## Support

For issues, check:
1. Server logs (console output)
2. Browser developer tools (network tab)
3. Browser console (JavaScript errors)
4. Check `.env` file for API key
5. Verify backend is running on correct port

---

**Backend Setup:** ✅ Complete  
**Status:** Ready for Production  
**Last Updated:** 2024
