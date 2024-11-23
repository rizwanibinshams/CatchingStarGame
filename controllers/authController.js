const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getSigninPage = (req, res) => {
    if (req.session.user) {
        return res.redirect('/game');
    }
    res.render('signin', { 
        error: null,
        user: null
    });
};

exports.getSignupPage = (req, res) => {
    if (req.session.user) {
        return res.redirect('/game');
    }
    res.render('signup', { 
        error: null,
        user: null
    });
};

exports.signin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('signin', { 
                error: 'Invalid username or password',
                user: null
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('signin', { 
                error: 'Invalid username or password',
                user: null
            });
        }

        // Set session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            highScore: user.highScore,
            gamesPlayed: user.gamesPlayed
        };

        res.redirect('/game');
    } catch (error) {
        console.error('Signin error:', error);
        res.render('signin', { 
            error: 'An error occurred during sign in',
            user: null
        });
    }
};

exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.render('signup', { 
                error: existingUser.username === username ? 
                    'Username already exists' : 
                    'Email already registered',
                user: null
            });
        }

        // Create user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Set session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            highScore: user.highScore,
            gamesPlayed: user.gamesPlayed
        };

        res.redirect('/game');
    } catch (error) {
        console.error('Signup error:', error);
        res.render('signup', { 
            error: error.message || 'An error occurred during sign up',
            user: null
        });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
};
