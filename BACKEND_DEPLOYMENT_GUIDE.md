# 🚀 Backend Deployment Guide

Complete step-by-step guide to deploy the Ultimate Sports AI backend to production.

---

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed
- [ ] Domain name (optional but recommended)
- [ ] API keys (The Odds API)
- [ ] Payment provider account (Stripe - optional)
- [ ] Email service (SendGrid/Mailgun - optional)

---

## 🏗️ Deployment Options

### Option 1: Railway (Recommended for Beginners) ⭐

**Pros:** Easy setup, free tier, automatic HTTPS, built-in PostgreSQL  
**Cons:** Free tier has limitations  
**Cost:** $0 (free tier) or $5-20/month

#### Steps:

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Navigate to backend folder
cd backend

# 4. Initialize Railway project
railway init

# 5. Add PostgreSQL database
railway add

# 6. Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -hex 32)
railway variables set THE_ODDS_API_KEY=your_api_key

# 7. Deploy
railway up

# 8. Run migrations
railway run psql $DATABASE_URL -f database/schema.sql

# 9. Get URL
railway domain
```

Your API will be available at: `https://your-app.up.railway.app`

---

### Option 2: Render.com (Great for Production)

**Pros:** Free tier, auto-scaling, built-in monitoring  
**Cons:** Cold starts on free tier  
**Cost:** $0 (free tier) or $7-25/month

#### Steps:

1. **Create Account** at https://render.com
2. **Connect GitHub** repository
3. **Create PostgreSQL** database
   - Go to Dashboard → New → PostgreSQL
   - Name: `ultimate-sports-ai-db`
   - Plan: Free (256MB) or Starter ($7/mo)
   - Copy `Internal Database URL`

4. **Create Web Service**
   - New → Web Service
   - Connect your repo
   - Name: `ultimate-sports-ai-api`
   - Root Directory: `backend`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Add Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=[your-internal-db-url]
   JWT_SECRET=[generate-random-string]
   JWT_REFRESH_SECRET=[generate-random-string]
   THE_ODDS_API_KEY=[your-api-key]
   FRONTEND_URL=https://your-frontend-url.com
   ```

6. **Deploy** - Click "Create Web Service"

7. **Run Migrations**
   - Go to Shell tab
   - Run: `psql $DATABASE_URL -f database/schema.sql`

Your API will be available at: `https://your-app.onrender.com`

---

### Option 3: Heroku (Popular, Reliable)

**Pros:** Mature platform, lots of add-ons  
**Cons:** Paid after November 2022  
**Cost:** $7-25/month (no free tier)

#### Steps:

```bash
# 1. Install Heroku CLI
brew install heroku/brew/heroku  # Mac
# or
curl https://cli-assets.heroku.com/install.sh | sh  # Linux

# 2. Login
heroku login

# 3. Create app
cd backend
heroku create ultimate-sports-ai-api

# 4. Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# 5. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
heroku config:set JWT_REFRESH_SECRET=$(openssl rand -hex 32)
heroku config:set THE_ODDS_API_KEY=your_api_key

# 6. Deploy
git push heroku main

# 7. Run migrations
heroku pg:psql < database/schema.sql

# 8. Open app
heroku open
```

Your API will be available at: `https://ultimate-sports-ai-api.herokuapp.com`

---

### Option 4: DigitalOcean/AWS/VPS (Full Control)

**Pros:** Complete control, scalable, no platform lock-in  
**Cons:** More complex setup, requires DevOps knowledge  
**Cost:** $5-50/month

#### Steps:

```bash
# 1. Create Droplet/EC2 instance
# Ubuntu 22.04, 1GB RAM minimum

# 2. SSH into server
ssh root@your-server-ip

# 3. Install dependencies
apt update
apt install -y nodejs npm postgresql nginx certbot python3-certbot-nginx

# 4. Setup PostgreSQL
sudo -u postgres psql
CREATE DATABASE ultimate_sports_ai;
CREATE USER sports_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ultimate_sports_ai TO sports_user;
\q

# 5. Clone repository
cd /var/www
git clone https://github.com/your-username/ultimate-sports-ai.git
cd ultimate-sports-ai/backend

# 6. Install dependencies
npm install --production

# 7. Create .env file
nano .env
# Add your environment variables

# 8. Run migrations
psql -U sports_user -d ultimate_sports_ai -f database/schema.sql

# 9. Install PM2 (process manager)
npm install -g pm2
pm2 start server.js --name sports-api
pm2 startup
pm2 save

# 10. Configure Nginx
nano /etc/nginx/sites-available/sports-api

# Add configuration:
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
ln -s /etc/nginx/sites-available/sports-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 11. Setup SSL (HTTPS)
certbot --nginx -d api.yourdomain.com

# 12. Setup firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

Your API will be available at: `https://api.yourdomain.com`

---

## 🔐 Environment Variables Setup

Generate secure secrets:

```bash
# JWT Secret (32 bytes)
openssl rand -hex 32

# JWT Refresh Secret (32 bytes)
openssl rand -hex 32
```

**Required Variables:**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your_generated_secret
JWT_REFRESH_SECRET=your_generated_refresh_secret
FRONTEND_URL=https://your-frontend.com
THE_ODDS_API_KEY=your_api_key
```

**Optional Variables:**
```env
REDIS_URL=redis://...
STRIPE_SECRET_KEY=sk_live_...
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

---

## 🗄️ Database Migration

### Initial Setup

```bash
# Connect to your production database
psql $DATABASE_URL

# Or if you have separate credentials
psql -h hostname -U username -d database_name

# Run schema
\i database/schema.sql

# Verify tables
\dt

# Check data
SELECT COUNT(*) FROM users;
```

### Backup Database

```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

---

## 🔌 Frontend Integration

Update your frontend API calls:

```javascript
// Before (development)
const API_URL = 'http://localhost:3001';

// After (production)
const API_URL = process.env.REACT_APP_API_URL || 'https://api.yourdomain.com';

// Example API call
fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
});
```

**CORS Configuration:**
Make sure your backend `FRONTEND_URL` matches your frontend domain!

---

## 🧪 Testing Production

### Health Check

```bash
curl https://your-api-url.com/health
```

Expected response:
```json
{
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": 12345,
    "environment": "production"
}
```

### Test Authentication

```bash
# Register
curl -X POST https://your-api-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test1234!"}'

# Login
curl -X POST https://your-api-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'

# Get Profile
curl https://your-api-url.com/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Monitoring

### Add Logging

Use winston for structured logging:

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

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}
```

### Add Error Tracking

Use Sentry:

```bash
npm install @sentry/node
```

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Monitor Performance

Use services like:
- **New Relic** - Application performance monitoring
- **Datadog** - Infrastructure monitoring
- **Uptime Robot** - Uptime monitoring (free)

---

## 🔒 Security Checklist

Before going live:

- [ ] All environment variables set
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Database connection secure
- [ ] JWT secrets are random and secure
- [ ] Password requirements enforced
- [ ] SQL injection protected (parameterized queries)
- [ ] XSS protection enabled
- [ ] CSRF protection (if needed)
- [ ] API keys not in code
- [ ] Error messages don't leak sensitive info
- [ ] Database backups configured
- [ ] Logs don't contain sensitive data

---

## 📈 Scaling Tips

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_picks_user_created ON picks(user_id, created_at DESC);
CREATE INDEX idx_activity_feed_composite ON activity_feed(user_id, created_at DESC);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM picks WHERE user_id = 'some-id';
```

### Caching with Redis

```javascript
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });

// Cache user profile
app.get('/api/users/profile', async (req, res) => {
    const cacheKey = `user:${req.user.id}`;
    
    // Check cache
    const cached = await client.get(cacheKey);
    if (cached) {
        return res.json(JSON.parse(cached));
    }
    
    // Fetch from database
    const user = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    
    // Store in cache (5 minutes)
    await client.setEx(cacheKey, 300, JSON.stringify(user.rows[0]));
    
    res.json(user.rows[0]);
});
```

### Load Balancing

For high traffic, use multiple instances:

```bash
# PM2 cluster mode
pm2 start server.js -i max --name sports-api
```

---

## 💰 Cost Estimation

### Minimal Setup (Free Tier)
- **Hosting:** Railway/Render Free - $0
- **Database:** PostgreSQL Free - $0
- **APIs:** The Odds API - $29/month
- **Total:** $29/month

### Recommended Production
- **Hosting:** Render Starter - $7/month
- **Database:** Render PostgreSQL - $7/month
- **APIs:** The Odds API - $29/month
- **Monitoring:** Sentry Free - $0
- **Total:** $43/month

### High Traffic
- **Hosting:** Render Standard - $25/month
- **Database:** Render PostgreSQL Pro - $45/month
- **Redis:** Upstash - $5/month
- **APIs:** The Odds API Premium - $99/month
- **Monitoring:** Sentry Team - $26/month
- **Total:** $200/month

---

## 🆘 Troubleshooting

### Database Connection Error

```bash
# Check DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:pass@host:5432/dbname

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Port Already in Use

```bash
# Find process
lsof -ti:3001

# Kill process
kill -9 <PID>
```

### JWT Errors

```bash
# Generate new secrets
openssl rand -hex 32

# Update environment variables
```

### CORS Errors

Check `FRONTEND_URL` matches your actual frontend domain exactly (including https://)

---

## 📞 Support

- Documentation: `/backend/README.md`
- Issues: GitHub Issues
- Email: support@ultimatesportsai.com

---

## ✅ Post-Deployment Checklist

- [ ] Health endpoint returns 200
- [ ] Can register new user
- [ ] Can login and get token
- [ ] Can access protected endpoints with token
- [ ] WebSocket connects successfully
- [ ] Database queries work
- [ ] External APIs (Odds API) work
- [ ] HTTPS certificate valid
- [ ] CORS allows frontend domain
- [ ] Error tracking configured
- [ ] Monitoring dashboard setup
- [ ] Database backups configured
- [ ] Documentation updated with production URL

---

**🎉 Congratulations! Your backend is now live in production!**

Next step: Connect your frontend and launch! 🚀
