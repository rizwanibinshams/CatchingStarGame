const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        if (!req.session.user) {
            console.log('No user found in session, redirecting to login');
            return res.status(401).json({ 
                message: 'Authentication required',
                redirect: '/signin'
            });
        }

        req.userId = req.session.user.userId;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/signin');
    }
    next();
};

const isGuest = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/game');
    }
    next();
};

module.exports = {
    auth,
    isAuthenticated,
    isGuest
};
