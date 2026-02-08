# How to Fix the 404 Error

## The Problem
You're getting a 404 error because the backend server was started **before** the chatbot route was added. The server needs to be restarted to load the new route.

## Solution: Restart the Backend Server

### Step 1: Stop the Current Server
1. Go to the terminal where your backend server is running
2. Press `Ctrl + C` to stop the server

### Step 2: Start the Server Again
1. Navigate to the backend directory:
   ```bash
   cd propzen-backend
   ```

2. Start the server:
   ```bash
   npm start
   ```
   OR
   ```bash
   node server.js
   ```

3. You should see:
   ```
   ✅ MongoDB Atlas Connected
   🚀 Server running on port 5000
   ```

### Step 3: Test the Chatbot
1. Go back to your browser
2. Try the chatbot query again: "houses in coimbatore"
3. It should work now! ✅

## Verify the Route is Loaded

After restarting, you can verify the route is available by checking:
- The server should start without errors
- No "Cannot find module" errors
- The chatbot should respond instead of showing 404

## Still Getting 404?

If you still get a 404 after restarting:

1. **Check the server console** for any errors when starting
2. **Verify the route file exists**: `propzen-backend/routes/chatbotRoutes.js`
3. **Check server.js** has this line:
   ```javascript
   app.use("/api/chatbot", require("./routes/chatbotRoutes"));
   ```
4. **Make sure you're calling the correct URL**: `http://localhost:5000/api/chatbot/query`

## Quick Test

After restarting, you can test the API directly in your browser console:
```javascript
fetch('http://localhost:5000/api/chatbot/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'houses in coimbatore' })
})
.then(r => r.json())
.then(console.log)
```

If this works, the chatbot should work too!
