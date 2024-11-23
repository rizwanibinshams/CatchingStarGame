const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/catchthestar', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/catchthestar',
        collectionName: 'sessions'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Make user available to all templates
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});

// Import routes
const gameRoutes = require('./routes/game');
const authRoutes = require('./routes/auth');

// Auth routes
app.use('/auth', authRoutes);

// Redirect auth pages
app.get('/signin', (req, res) => res.redirect('/auth/signin'));
app.get('/signup', (req, res) => res.redirect('/auth/signup'));

// Game routes
app.use('/', gameRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).render('error', {
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {},
        user: req.session.user || null
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Page Not Found',
        error: { status: 404 },
        user: req.session.user || null
    });
});

const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
