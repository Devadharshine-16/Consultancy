# MongoDB Local Setup Guide

## Option 1: Install MongoDB Community Server (Recommended)

1. **Download MongoDB**: https://www.mongodb.com/try/download/community
2. **Install MongoDB**: Run the installer with default settings
3. **Start MongoDB Service**:
   ```bash
   # Windows
   net start MongoDB

   # Or manually start from Services
   # Press Win + R, type "services.msc", find MongoDB and start it
   ```

## Option 2: Use MongoDB Atlas (Cloud)

If you prefer cloud database:

1. Go to: https://cloud.mongodb.com/
2. Create a free account
3. Create a new cluster (free tier)
4. Add your IP to whitelist (0.0.0.0/0 for any IP)
5. Get connection string and update .env file

## Option 3: Use Docker (Fastest)

1. Install Docker Desktop
2. Run this command:
   ```bash
   docker run --name mongodb -p 27017:27017 -d mongo:latest
   ```

## Test Connection

After setup, test with:
```bash
node server.js
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

## Troubleshooting

**If MongoDB fails to start:**
- Check if port 27017 is free
- Run as Administrator
- Restart your computer

**If connection still fails:**
- Verify MongoDB service is running
- Check firewall settings
- Try `mongodb://127.0.0.1:27017/propzenDB` instead
