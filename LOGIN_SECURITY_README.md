# Login Attempt Restriction Feature

A simple, beginner-friendly login security system that prevents brute force attacks by limiting failed login attempts.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## 📋 Features

- ✅ **Failed Attempt Tracking**: Tracks failed login attempts per username
- ✅ **Temporary Blocking**: Blocks users for 5 minutes after 3 failed attempts
- ✅ **Automatic Reset**: Resets attempt count after successful login
- ✅ **User-Friendly Messages**: Clear feedback for users
- ✅ **Simple Implementation**: No complex libraries or dependencies

## 🔧 How It Works

### Core Variables

```javascript
const MAX_ATTEMPTS = 3;           // Maximum failed attempts before blocking
const BLOCK_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const loginAttempts = {};         // In-memory storage for attempt tracking
```

### Attempt Tracking Structure

```javascript
loginAttempts = {
    "username": {
        attempts: 2,           // Current failed attempt count
        blockUntil: 1640995200000  // Timestamp when block expires (null if not blocked)
    }
}
```

## 🛡️ Security Logic

### 1. **Check if User is Blocked**
```javascript
function isUserBlocked(username) {
    const userAttempts = loginAttempts[username];
    if (!userAttempts) return false;
    
    const now = Date.now();
    return userAttempts.blockUntil && userAttempts.blockUntil > now;
}
```

### 2. **Record Failed Attempt**
```javascript
function recordFailedAttempt(username) {
    if (!loginAttempts[username]) {
        loginAttempts[username] = { attempts: 0, blockUntil: null };
    }
    
    loginAttempts[username].attempts++;
    
    if (loginAttempts[username].attempts >= MAX_ATTEMPTS) {
        loginAttempts[username].blockUntil = Date.now() + BLOCK_DURATION;
        return true; // User is now blocked
    }
    
    return false; // User not blocked yet
}
```

### 3. **Reset on Success**
```javascript
function resetLoginAttempts(username) {
    if (loginAttempts[username]) {
        loginAttempts[username].attempts = 0;
        loginAttempts[username].blockUntil = null;
    }
}
```

## 🌐 API Endpoints

### POST /login
```json
Request:
{
    "username": "admin",
    "password": "password123"
}

Success Response:
{
    "success": true,
    "message": "Login successful!"
}

Failed Response (attempts remaining):
{
    "success": false,
    "message": "Invalid credentials. 2 attempts remaining",
    "attemptsLeft": 2
}

Blocked Response:
{
    "success": false,
    "message": "Too many failed attempts. Please try again later",
    "remainingTime": 300
}
```

### GET /status
Check server status and view currently blocked users.

## 🎨 Frontend Integration

The login form automatically handles:
- **Error messages** with attempt count
- **Blocking UI** when user is temporarily blocked
- **Success feedback** on successful login
- **Form reset** after successful login

## 🧪 Testing Demo Accounts

| Username | Password | Purpose |
|----------|----------|---------|
| admin | password123 | Test successful login |
| user | testpass | Test successful login |
| demo | demo123 | Test successful login |

**To test blocking:**
1. Enter wrong password 3 times for any username
2. See the blocking message
3. Wait 5 minutes or use a different username

## 📁 File Structure

```
login-security-demo/
├── server.js              # Main server with security logic
├── package.json           # Dependencies and scripts
├── public/
│   └── login.html         # Login form with UI handling
└── LOGIN_SECURITY_README.md  # This documentation
```

## 🔒 Security Considerations

### ✅ What This Implementation Covers
- Brute force attack prevention
- Temporary account locking
- Clear user feedback
- Simple, maintainable code

### 🔄 Production Enhancements
- **Persistent Storage**: Use Redis or database instead of memory
- **IP-based Tracking**: Track attempts by IP address
- **Progressive Delays**: Increasing lockout durations
- **Email Notifications**: Alert users of suspicious activity
- **Logging**: Security event logging
- **Rate Limiting**: Additional API rate limiting

## 🚀 Integration with Existing Apps

### 1. **Add to Existing Express Server**
```javascript
// Copy the security functions and variables
const loginAttempts = {};
const BLOCK_DURATION = 5 * 60 * 1000;
const MAX_ATTEMPTS = 3;

// Add helper functions (isUserBlocked, recordFailedAttempt, etc.)

// Modify your existing login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Add security checks at the beginning
    if (isUserBlocked(username)) {
        return res.status(429).json({
            success: false,
            message: 'Too many failed attempts. Please try again later'
        });
    }
    
    // Your existing login logic here...
    // Add resetLoginAttempts(username) on success
    // Add recordFailedAttempt(username) on failure
});
```

### 2. **Frontend Integration**
```javascript
// Update your login form submission handler
async function handleLogin(username, password) {
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    const result = await response.json();
    
    if (result.success) {
        // Handle successful login
    } else {
        // Display error message
        // Handle blocking if result.blocked
    }
}
```

## 🎯 Key Benefits

1. **Simple to Understand**: Clear, readable code for beginners
2. **Effective Protection**: Stops basic brute force attacks
3. **User-Friendly**: Clear messages and reasonable time limits
4. **Easy Integration**: Works with existing login systems
5. **No Dependencies**: Uses only built-in Node.js features

## 📞 Support

This implementation is designed to be educational and easily customizable. Feel free to modify the constants, add features, or integrate it into your existing applications!
