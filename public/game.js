class Game {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.isPlaying = false;
        this.moveInterval = null;
        this.timerInterval = null;
        
        // Get DOM elements
        this.gameArea = document.getElementById('gameArea');
        this.star = document.getElementById('star');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.highScoresElement = document.getElementById('highScores');
        this.gameOverModal = document.getElementById('gameOverModal');
        
        // Initial star position
        this.star.style.left = '0px';
        this.star.style.top = '0px';
        
        // Bind methods
        this.handleStarClick = this.handleStarClick.bind(this);
        this.moveStar = this.moveStar.bind(this);
        this.updateTimer = this.updateTimer.bind(this);
        this.endGame = this.endGame.bind(this);
        this.startGame = this.startGame.bind(this);
        
        // Initialize
        this.init();
    }

    init() {
        this.star.addEventListener('click', this.handleStarClick);
        this.star.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleStarClick(e);
        });
        this.startGame();
        this.fetchHighScores();
    }

    startGame() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.score = 0;
        this.timeLeft = 30;
        this.updateScore();
        this.updateTimer();
        
        // Move star immediately and start interval
        this.moveStar();
        this.moveInterval = setInterval(this.moveStar, 1500);
        this.timerInterval = setInterval(this.updateTimer, 1000);
    }

    getRandomPosition() {
        const gameRect = this.gameArea.getBoundingClientRect();
        const starRect = this.star.getBoundingClientRect();
        
        // Calculate maximum positions while keeping the star fully visible
        const maxX = gameRect.width - starRect.width;
        const maxY = gameRect.height - starRect.height;
        
        // Generate random positions within the game area
        return {
            x: Math.max(0, Math.floor(Math.random() * maxX)),
            y: Math.max(0, Math.floor(Math.random() * maxY))
        };
    }

    moveStar() {
        if (!this.isPlaying) return;
        
        const pos = this.getRandomPosition();
        
        // Update star position using left/top instead of transform
        this.star.style.left = `${pos.x}px`;
        this.star.style.top = `${pos.y}px`;
        
        // Add animation effect
        this.star.classList.remove('animate__wobble');
        void this.star.offsetWidth; // Trigger reflow
        this.star.classList.add('animate__wobble');
    }

    handleStarClick(e) {
        if (!this.isPlaying) return;
        
        e.preventDefault();
        this.score += 1;
        this.updateScore();
        
        // Create burst effect
        const rect = this.star.getBoundingClientRect();
        const burst = document.createElement('div');
        burst.className = 'star-burst text-yellow-300';
        burst.innerHTML = '';
        burst.style.left = `${rect.left}px`;
        burst.style.top = `${rect.top}px`;
        document.body.appendChild(burst);
        
        setTimeout(() => {
            document.body.removeChild(burst);
        }, 500);
        
        // Move star immediately
        this.moveStar();
        
        // Reset move interval
        clearInterval(this.moveInterval);
        this.moveInterval = setInterval(this.moveStar, 1500);
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    updateTimer() {
        this.timeLeft -= 1;
        this.timerElement.textContent = this.timeLeft;
        
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }

    async endGame() {
        this.isPlaying = false;
        clearInterval(this.moveInterval);
        clearInterval(this.timerInterval);
        
        // Show game over modal with name input
        this.gameOverModal.innerHTML = `
            <div class="bg-gray-800 rounded-2xl p-8 max-w-md mx-4">
                <h2 class="text-3xl font-bold text-yellow-300 mb-4">Game Over!</h2>
                <p class="text-xl mb-4">Your score: ${this.score}</p>
                <div class="mb-6">
                    <label for="playerName" class="block text-sm font-medium text-gray-300 mb-2">Enter your name:</label>
                    <input type="text" id="playerName" 
                           class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                           placeholder="Your name">
                </div>
                <div class="flex space-x-4">
                    <button id="saveScoreBtn" 
                            class="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold transition-colors">
                        Save Score
                    </button>
                    <button onclick="location.reload()" 
                            class="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-bold transition-colors">
                        Play Again
                    </button>
                </div>
            </div>
        `;
        this.gameOverModal.classList.remove('hidden');
        
        // Add event listener for save score button
        document.getElementById('saveScoreBtn').addEventListener('click', async () => {
            const playerName = document.getElementById('playerName').value.trim() || 'Anonymous';
            
            try {
                const response = await fetch('/api/scores', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        username: playerName,
                        score: this.score 
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to save score');
                }
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'text-green-500 mt-4 text-center';
                successMsg.textContent = 'Score saved successfully!';
                document.querySelector('.bg-gray-800').appendChild(successMsg);
                
                // Refresh high scores
                await this.fetchHighScores();
                
                // Redirect to leaderboard after 1 second
                setTimeout(() => {
                    window.location.href = '/leaderboard';
                }, 1000);
                
            } catch (error) {
                console.error('Error saving score:', error);
                const errorMsg = document.createElement('div');
                errorMsg.className = 'text-red-500 mt-4 text-center';
                errorMsg.textContent = 'Failed to save score. Please try again.';
                document.querySelector('.bg-gray-800').appendChild(errorMsg);
            }
        });
    }

    async fetchHighScores() {
        try {
            const response = await fetch('/api/scores');
            if (!response.ok) {
                throw new Error('Failed to fetch high scores');
            }
            
            const scores = await response.json();
            this.highScoresElement.innerHTML = scores
                .map((score, index) => `
                    <div class="flex justify-between items-center p-2 ${index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-750'} rounded">
                        <span class="font-bold ${index < 3 ? 'text-yellow-300' : 'text-gray-300'}">${score.username}</span>
                        <span class="text-white">${score.score}</span>
                    </div>
                `)
                .join('');
                
        } catch (error) {
            console.error('Error fetching high scores:', error);
            this.highScoresElement.innerHTML = '<p class="text-red-500">Error loading scores</p>';
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});
