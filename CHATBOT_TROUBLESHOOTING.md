# Chatbot Troubleshooting Guide

## Issue: All queries showing "Sorry, I encountered an error"

### Step 1: Check if Backend Server is Running

1. Open a terminal in the `propzen-backend` directory
2. Run: `npm start` or `node server.js`
3. You should see:
   - ✅ MongoDB Atlas Connected
   - 🚀 Server running on port 5000

### Step 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages when you send a chatbot query
4. Check for:
   - Network errors (CORS, connection refused)
   - API errors (404, 500, etc.)

### Step 3: Check Backend Console

1. Look at the terminal where the backend is running
2. You should see logs like:
   - "Parsed query: ..."
   - "Parsed filters: ..."
   - "Executing MongoDB query: ..."
   - "Found X properties"

### Step 4: Test API Directly

Open browser and go to:
- http://localhost:5000/api/chatbot/query

Or use Postman/curl to test:
```bash
curl -X POST http://localhost:5000/api/chatbot/query \
  -H "Content-Type: application/json" \
  -d '{"message": "Properties under 20000"}'
```

### Step 5: Common Issues

#### Issue: "Network Error" or "Connection Refused"
- **Solution**: Make sure backend server is running on port 5000

#### Issue: "CORS Error"
- **Solution**: Check that `cors()` middleware is enabled in `server.js`

#### Issue: "404 Not Found"
- **Solution**: Verify the route is registered in `server.js`:
  ```javascript
  app.use("/api/chatbot", require("./routes/chatbotRoutes"));
  ```

#### Issue: "500 Internal Server Error"
- **Solution**: Check backend console for detailed error messages
- Common causes:
  - MongoDB connection issue
  - Property model not found
  - Query syntax error

### Step 6: Verify MongoDB Connection

1. Check `.env` file has `MONGO_URI`
2. Verify MongoDB connection string is correct
3. Test connection in backend console

### Step 7: Test Parsing Logic

The chatbot should parse:
- ✅ "Properties under 20000" → budget max: 20000
- ✅ "under 15,000" → budget max: 15000
- ✅ "2BHK apartments" → bhk: 2BHK, type: Apartment
- ✅ "Villas for rent" → type: Villa, purpose: Rent

### Debug Mode

The backend now logs:
- Parsed query object
- Parsed filters
- MongoDB query being executed
- Number of properties found

Check these logs to see what's happening.

## Quick Fix Checklist

- [ ] Backend server is running
- [ ] MongoDB is connected
- [ ] Route is registered in server.js
- [ ] CORS is enabled
- [ ] No syntax errors in chatbotRoutes.js
- [ ] Port 5000 is not blocked
- [ ] Frontend is calling correct URL (http://localhost:5000/api/chatbot/query)

## Still Having Issues?

1. Check the browser Network tab to see the actual HTTP request/response
2. Check backend console for error stack traces
3. Verify Property model exists and is correct
4. Test with a simple query first: "houses in Coimbatore"
