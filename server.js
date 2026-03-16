const express = require('express');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Login attempt tracking storage
const loginAttempts = {};
const BLOCK_DURATION = 5 * 60 * 1000;
const MAX_ATTEMPTS = 3;

// Helper functions
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
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

function recordFailedAttempt(username) {
    if (!loginAttempts[username]) {
        loginAttempts[username] = { attempts: 0, blockUntil: null };
    }

    loginAttempts[username].attempts++;

    if (loginAttempts[username].attempts >= MAX_ATTEMPTS) {
        loginAttempts[username].blockUntil = Date.now() + BLOCK_DURATION;
        return true;
    }

    return false;
}

function resetLoginAttempts(username) {
    if (loginAttempts[username]) {
        loginAttempts[username].attempts = 0;
        loginAttempts[username].blockUntil = null;
    }
}

// Simple user database
const users = {
    admin: "password123",
    user: "testpass",
    demo: "demo123"
};

// Root route (important for Render)
app.get("/", (req, res) => {
    res.send("Consultancy Backend API Running 🚀");
});

// Login API
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (isUserBlocked(username)) {
        const remainingTime = getRemainingBlockTime(username);
        return res.status(429).json({
            success: false,
            message: "Too many failed attempts. Please try again later",
            remainingTime
        });
    }

    if (users[username] && users[username] === password) {
        resetLoginAttempts(username);
        return res.json({
            success: true,
            message: "Login successful!"
        });
    } else {
        const isBlocked = recordFailedAttempt(username);
        const attemptsLeft = MAX_ATTEMPTS - loginAttempts[username].attempts;

        if (isBlocked) {
            return res.status(429).json({
                success: false,
                message: "Too many failed attempts. Please try again later",
                blocked: true
            });
        } else {
            return res.status(401).json({
                success: false,
                message: `Invalid credentials. ${attemptsLeft} attempts remaining`,
                attemptsLeft
            });
        }
    }
});

// Status route
app.get("/status", (req, res) => {
    res.json({
        message: "Login attempt restriction server is running",
        blockedUsers: Object.keys(loginAttempts).filter(username =>
            isUserBlocked(username)
        )
    });
});

// Render port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});