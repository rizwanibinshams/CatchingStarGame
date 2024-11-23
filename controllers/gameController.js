const Score = require('../models/Score');
const User = require('../models/User');
const path = require('path');

// Get home page
exports.getHomePage = async (req, res) => {
    try {
        // Get top 5 scores for the home page
        const topScores = await Score.find()
            .sort({ score: -1 })
            .limit(5)
            .lean();
        
        res.render('home', { 
            user: req.session.user,
            topScores,
            error: null
        });
    } catch (error) {
        console.error('Error loading home page:', error);
        res.render('home', { 
            user: req.session.user,
            topScores: [],
            error: 'Error loading top scores'
        });
    }
};

// Get game page
exports.getGamePage = async (req, res) => {
    try {
        const scores = await Score.find()
            .sort({ score: -1 })
            .limit(10)
            .lean();
        
        res.render('game', { 
            scores,
            user: req.session.user,
            error: null
        });
    } catch (error) {
        console.error('Error fetching scores:', error);
        res.render('game', { 
            scores: [],
            user: req.session.user,
            error: 'Error loading scores'
        });
    }
};

// Get leaderboard page
exports.getLeaderboardPage = async (req, res) => {
    try {
        const scores = await Score.find()
            .sort({ score: -1 })
            .limit(100)
            .lean();
        
        res.render('leaderboard', { 
            scores,
            user: req.session.user,
            error: null
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.render('leaderboard', { 
            scores: [],
            user: req.session.user,
            error: 'Error loading leaderboard'
        });
    }
};

// Save score
exports.saveScore = async (req, res) => {
    try {
        const { username, score } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        // Save score with the provided username
        const newScore = new Score({
            username: username,
            score: parseInt(score),
            date: new Date()
        });

        await newScore.save();

        // If user is logged in, update their high score
        if (req.session.user) {
            const userId = req.session.user.id;
            const user = await User.findById(userId);
            
            if (user && score > user.highScore) {
                user.highScore = score;
                await user.save();
            }

            // Increment games played
            await User.findByIdAndUpdate(userId, {
                $inc: { gamesPlayed: 1 }
            });
        }

        res.status(201).json(newScore);
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ error: 'Error saving score' });
    }
};

// Get top scores
exports.getTopScores = async (req, res) => {
    try {
        const scores = await Score.find()
            .sort({ score: -1 })
            .limit(10)
            .lean();
        
        res.json(scores);
    } catch (error) {
        console.error('Error fetching scores:', error);
        res.status(500).json({ error: 'Error fetching scores' });
    }
};
