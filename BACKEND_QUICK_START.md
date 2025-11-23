# ⚡ Backend Quick Start - 5 Minutes

Get your backend running in 5 minutes!

---

## 🚀 Fastest Way (Railway)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Go to backend folder
cd backend

# 3. Initialize
railway init

# 4. Add database
railway add postgresql

# 5. Deploy
railway up
```

✅ **Done!** Your API is live at: `https://your-app.up.railway.app`

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Create .env file
cp .env.example .env

# 3. Edit .env with your database credentials
nano .env

# 4. Create database
createdb ultimate_sports_ai

# 5. Run migrations
psql -d ultimate_sports_ai -f database/schema.sql

# 6. Start server
npm run dev
```

✅ **Done!** API running at: `http://localhost:3001`

---

## 🧪 Test It Works

```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Test1234!"}'
```

---

## 📝 What You Get

- ✅ User authentication (JWT)
- ✅ PostgreSQL database
- ✅ 30+ API endpoints
- ✅ WebSocket support
- ✅ Production-ready code
- ✅ Auto-scaling ready

---

## 🔗 Connect Frontend

Update your frontend `.env`:

```env
REACT_APP_API_URL=https://your-api-url.com
REACT_APP_WS_URL=wss://your-api-url.com
```

In your frontend code:

```javascript
// Before
const API_URL = 'http://localhost:3001';

// After
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

---

## 📊 Production Checklist

- [ ] Database running
- [ ] Environment variables set
- [ ] API deployed
- [ ] Health check passing
- [ ] Can register/login
- [ ] Frontend can connect

---

## 🆘 Problems?

**Database connection error:**
```bash
# Check your DATABASE_URL
echo $DATABASE_URL
```

**Can't connect from frontend:**
```bash
# Check CORS settings in .env
FRONTEND_URL=https://your-frontend.com
```

**Port already in use:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

---

## 📚 Next Steps

1. Read `/backend/README.md` for full documentation
2. See `/BACKEND_DEPLOYMENT_GUIDE.md` for production deployment
3. Check `/backend/database/schema.sql` for database structure
4. Explore `/backend/routes/` for API endpoints

---

**Need help?** Check the full guides or open an issue on GitHub!

🎉 **Happy coding!**
