const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const auth = require('../middleware/auth');

// Home route
router.get('/', gameController.getHomePage);

// Game routes
router.get('/game', auth.isAuthenticated, gameController.getGamePage);
router.get('/leaderboard', gameController.getLeaderboardPage);

// API routes
router.post('/api/scores', gameController.saveScore);
router.get('/api/scores', gameController.getTopScores);

module.exports = router;
