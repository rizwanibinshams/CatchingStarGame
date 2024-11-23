const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

// Auth pages
router.get('/signin', auth.isGuest, authController.getSigninPage);
router.get('/signup', auth.isGuest, authController.getSignupPage);

// Auth actions
router.post('/signin', auth.isGuest, authController.signin);
router.post('/signup', auth.isGuest, authController.signup);
router.post('/logout', auth.isAuthenticated, authController.logout);

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Registration attempt:', { username, email }); // Log registration attempt

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ 
                message: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
            });
        }

        // Create new user
        const user = new User({ username, email, password });
        await user.save();
        console.log('User created successfully:', email);

        // Create token
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET || 'fallback_secret_key_123', 
            { expiresIn: '24h' }
        );
        
        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(201).json({ 
            message: 'User created successfully',
            user: { username: user.username, email: user.email }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Registration failed',
            error: error.message 
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'fallback_secret_key_123',
            { expiresIn: '24h' }
        );

        // Set HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        console.log('Login successful:', email);
        res.json({ 
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                highScore: user.highScore
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Logout user
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', auth.isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(401).json({ 
                message: 'User not found',
                redirect: '/signin'
            });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update high score
router.post('/update-score', auth.isAuthenticated, async (req, res) => {
    try {
        const { score } = req.body;
        const user = await User.findById(req.userId);
        
        if (score > user.highScore) {
            user.highScore = score;
            await user.save();
        }
        
        res.json({ highScore: user.highScore });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
