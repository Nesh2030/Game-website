const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const gameContainer = document.getElementById('game-container');
const scoreboardContainer = document.getElementById('scoreboard-container');
const scoreboard = document.getElementById('scoreboard');

const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const playBtn = document.getElementById('play-btn');
const logoutBtn = document.getElementById('logout-btn');
const welcomeUsername = document.getElementById('welcome-username');
const scoreDisplay = document.getElementById('score-display'); // Score display

let users = [];

// Load users from session storage
const loadUsers = () => {
    const storedUsers = sessionStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : [];
};

// Save users to session storage
const saveUsers = () => {
    sessionStorage.setItem('users', JSON.stringify(users));
};

// Display scoreboard
const displayScoreboard = () => {
    scoreboard.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.username}: ${user.score}`;
        scoreboard.appendChild(li);
    });
};

// Login event
loginBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const user = users.find(u => u.username === username);
    if (user) {
        welcomeUsername.textContent = username;
        gameContainer.style.display = 'block';
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'none';
        scoreboardContainer.style.display = 'block';
        displayScoreboard();
        alert('Login successful!');
    } else {
        alert('User not found. Please register first.');
    }
});

// Register event
registerBtn.addEventListener('click', () => {
    const registerUsername = document.getElementById('register-username').value;
    if (!users.some(u => u.username === registerUsername)) {
        const newUser = { username: registerUsername, score: 0 };
        users.push(newUser);
        saveUsers();
        alert('User registered successfully! You can now log in.');
    } else {
        alert('Username already taken.');
    }
});

// Pilot Game Functionality
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let planeY = canvas.height / 2; // Start position of the plane
let planeSpeed = 2; // Slower speed of the plane
let isGamePaused = false; // Is the game paused
let obstacles = []; // Array to hold obstacles
let score = 0; // Score for the game

// Music control
const backgroundMusic = document.getElementById('background-music');

// Function to create obstacles
const createObstacle = () => {
    const obstacleHeight = Math.random() * (canvas.height - 150) + 20; // Random height
    const gap = 150; // Gap between obstacles
    obstacles.push({
        x: canvas.width,
        upperHeight: obstacleHeight,
        lowerHeight: canvas.height - obstacleHeight - gap
    }); // Add a new obstacle with a gap
};

// Function to draw obstacles
const drawObstacles = () => {
    ctx.fillStyle = 'orange'; // Color of the obstacles
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, 0, 20, obstacle.upperHeight); // Upper obstacle
        ctx.fillRect(obstacle.x, canvas.height - obstacle.lowerHeight, 20, obstacle.lowerHeight); // Lower obstacle
    });
};

// Function to check for collisions
const checkCollisions = () => {
    obstacles.forEach(obstacle => {
        if (planeY < obstacle.upperHeight || planeY + 30 > canvas.height - obstacle.lowerHeight) {
            if (obstacle.x < 70 && obstacle.x + 20 > 50) {
                alert('Game Over! Your score: ' + score);
                saveScore(); // Save score
                resetGame();
            }
        }
    });
};

// Reset game function
const resetGame = () => {
    obstacles = [];
    score = 0;
    planeY = canvas.height / 2; // Reset plane position
    planeSpeed = 2; // Reset speed
    isGamePaused = true; // Pause the game
    scoreDisplay.textContent = 'Score: ' + score; // Reset score display
};

// Function to save score
const saveScore = () => {
    const username = welcomeUsername.textContent;
    const user = users.find(u => u.username === username);
    if (user) {
        user.score = score; // Update score
        saveUsers(); // Save users with the updated score
        displayScoreboard(); // Update scoreboard
    }
};

// Function to draw the plane
const drawPlane = () => {
    ctx.fillStyle = 'blue'; // Color of the plane
    ctx.beginPath();
    ctx.moveTo(50, planeY); // Point A
    ctx.lineTo(80, planeY + 15); // Point B (bottom right wing)
    ctx.lineTo(50, planeY + 30); // Point C (bottom of the plane)
    ctx.lineTo(20, planeY + 15); // Point D (bottom left wing)
    ctx.closePath();
    ctx.fill(); // Fill the plane shape
};

// Game loop
const gameLoop = () => {
    if (isGamePaused) return; // Stop the loop if paused

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawPlane(); // Draw the plane
    drawObstacles(); // Draw obstacles
    checkCollisions(); // Check for collisions

    // Move obstacles
    obstacles.forEach(obstacle => {
        obstacle.x -= planeSpeed; // Move the obstacle left
    });

    // Remove off-screen obstacles and update score
    if (obstacles.length > 0 && obstacles[0].x < -20) {
        obstacles.shift(); // Remove the first obstacle
        score++; // Increase score for passing an obstacle
        scoreDisplay.textContent = 'Score: ' + score; // Update score display
    }

    // Randomly create new obstacles
    if (Math.random() < 0.01) { // Adjust frequency of new obstacles (less frequent)
        createObstacle(); // Create a new obstacle
    }

    requestAnimationFrame(gameLoop); // Loop the game
};

// Control the plane with keyboard
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        isGamePaused = !isGamePaused; // Toggle pause
        if (isGamePaused) {
            backgroundMusic.pause(); // Pause music when game is paused
        } else {
            backgroundMusic.play(); // Resume music when game is unpaused
        }
    } else if (!isGamePaused) {
        if (event.code === 'ArrowUp') {
            planeY = Math.max(0, planeY - planeSpeed); // Move up, prevent going out of bounds
        } else if (event.code === 'ArrowDown') {
            planeY = Math.min(canvas.height - 30, planeY + planeSpeed); // Move down, prevent going out of bounds
        }
    }
});

// Control the plane with buttons
document.getElementById('up-btn').addEventListener('click', () => {
    planeY = Math.max(0, planeY - planeSpeed); // Move up
});
document.getElementById('down-btn').addEventListener('click', () => {
    planeY = Math.min(canvas.height - 30, planeY + planeSpeed); // Move down
});

// Start the game loop when the player clicks "Play Game"
playBtn.addEventListener('click', () => {
    if (isGamePaused) {
        resetGame(); // Reset the game state if it's paused
    }
    gameContainer.style.display = 'block';
    obstacles = []; // Reset obstacles
    createObstacle(); // Create the first obstacle
    score = 0; // Reset score
    scoreDisplay.textContent = 'Score: ' + score; // Update score display
    isGamePaused = false; // Start the game
    backgroundMusic.play(); // Play background music when the game starts
    gameLoop(); // Start the game loop
});

// Logout event
logoutBtn.addEventListener('click', () => {
    gameContainer.style.display = 'none';
    loginContainer.style.display = 'block';
    registerContainer.style.display = 'block';
});
