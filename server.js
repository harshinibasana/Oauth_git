require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;

const app = express();

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
}, (accessToken, refreshToken, profile, done) => {
    // You can perform actions like finding or creating a user in your database here.
    // For simplicity, we're directly returning the profile.
    return done(null, profile);
}));

// Serialize user info to session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user info from session
passport.deserializeUser((user, done) => {
    done(null, user);
});

// OAuth Routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect to dashboard.
        res.redirect('/dashboard');
    }
);

// Protected Route (Only for Authenticated Users)
app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }

    // If you're using GitHub via passport-github2, the avatar URL often appears in:
    // req.user.photos[0].value or req.user._json.avatar_url
    // Adjust this line based on your actual user object structure:
    const avatarUrl = req.user.photos?.[0]?.value || req.user._json?.avatar_url || '';

    res.send(`
        <h1>Welcome to Dashboard</h1>
        <p>Hello, ${req.user.username}!</p>
        <img src="${avatarUrl}" alt="User Avatar" width="100" />
        <br><br>
        <a href="/logout">Logout</a>
    `);
});


// Logout Route
app.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// Home Route (for demonstration)
app.get('/', (req, res) => {
    res.send('<h1>Welcome to Home created by harshini</h1><a href="/auth/github">Login with GitHub</a>');
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

