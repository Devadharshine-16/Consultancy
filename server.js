const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Login attempt tracking storage
const loginAttempts = {};
const BLOCK_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_ATTEMPTS = 3;

// Helper functions for login attempt management
function isUserBlocked(username) {
    const userAttempts = loginAttempts[username];
    if (!userAttempts) return false;
    
    const now = Date.now();
    return userAttempts.blockUntil && userAttempts.blockUntil > now;
}

function getRemainingBlockTime(username) {
    const userAttempts = loginAttempts[username];
    if (!userAttempts || !userAttempts.blockUntil) return 0;
    
    const now = Date.now();
    const remaining = userAttempts.blockUntil - now;
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0; // Return seconds
}

function recordFailedAttempt(username) {
    if (!loginAttempts[username]) {
        loginAttempts[username] = {
            attempts: 0,
            blockUntil: null
        };
    }
    
    loginAttempts[username].attempts++;
    
    // Block user if max attempts reached
    if (loginAttempts[username].attempts >= MAX_ATTEMPTS) {
        loginAttempts[username].blockUntil = Date.now() + BLOCK_DURATION;
        return true; // User is now blocked
    }
    
    return false; // User not blocked yet
}

function resetLoginAttempts(username) {
    if (loginAttempts[username]) {
        loginAttempts[username].attempts = 0;
        loginAttempts[username].blockUntil = null;
    }
}

// Simple user database (in production, use a proper database)
const users = {
    'admin': 'password123',
    'user': 'testpass',
    'demo': 'demo123'
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Check if user is currently blocked
    if (isUserBlocked(username)) {
        const remainingTime = getRemainingBlockTime(username);
        return res.status(429).json({
            success: false,
            message: 'Too many failed attempts. Please try again later',
            remainingTime: remainingTime
        });
    }
    
    // Check credentials
    if (users[username] && users[username] === password) {
        // Successful login - reset attempts
        resetLoginAttempts(username);
        return res.json({
            success: true,
            message: 'Login successful!'
        });
    } else {
        // Failed login - record attempt
        const isBlocked = recordFailedAttempt(username);
        const attemptsLeft = MAX_ATTEMPTS - loginAttempts[username].attempts;
        
        if (isBlocked) {
            return res.status(429).json({
                success: false,
                message: 'Too many failed attempts. Please try again later',
                blocked: true
            });
        } else {
            return res.status(401).json({
                success: false,
                message: `Invalid credentials. ${attemptsLeft} attempts remaining`,
                attemptsLeft: attemptsLeft
            });
        }
    }
});

// Route to check login status (for testing)
app.get('/status', (req, res) => {
    res.json({
        message: 'Login attempt restriction server is running',
        blockedUsers: Object.keys(loginAttempts).filter(username => isUserBlocked(username))
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
