import { BrickManager } from "./bricks.js";
import { GameState } from "./gameState.js";
import { animate, setupAudio, createCircles, hideButtonById, playClickSound } from "./background.js";
import { DifficultySelector, GameConfigManager } from "./difficulty.js"; 
//import powerups
import { PowerUp } from "./powerups.js";

//declare power-ups array
let powerUps = [];

const leftArrow = document.getElementById("left");
const rightArrow = document.getElementById("right");
const displayElement = document.getElementById("difficulty");

// Initialize difficulty selector and game config manager
const difficultySelector = new DifficultySelector(leftArrow, rightArrow, displayElement);
const gameConfigManager = new GameConfigManager();

// Setup main canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const backgroundCanvas = document.getElementById("background");
const bc = backgroundCanvas.getContext("2d");

//  Create game objects with callbacks
let gameState = new GameState(canvas, 3, {
  onGameOver: () => backToMenu(),       // when lives = 0
});

const brickManager = new BrickManager(canvas);

// === Toggle fullscreen or partial here ===
let isFullscreen = false; // change true/false to pick mode

// Resize handler 
function resizeCanvas() {
  // Background always fullscreen
  backgroundCanvas.width = window.innerWidth;
  backgroundCanvas.height = window.innerHeight;

  if (isFullscreen) {
    // Fullscreen game canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.transform = "none";
    canvas.style.border = "none"; // remove border
    canvas.style.borderRadius = "0";
    canvas.style.boxShadow = "none";

  } else {
    // Partial mode (80%)
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    canvas.style.position = "absolute";
    canvas.style.left = "50%";
    canvas.style.top = "50%";
    canvas.style.transform = "translate(-50%, -50%)";
    canvas.style.border = "6px solid  #192b4dff"; // border for partial mode
    canvas.style.borderRadius = "16px";
    canvas.style.boxShadow = "0 10px 30px rgba(18, 32, 109, 0.7)";
  }

  // Update bricks size/position only, keep same layout
  brickManager.resize(canvas);
  
  // reposition paddle & ball at bottom
  gameState.resetRound();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // call AFTER creating gameState

// === Collision helpers ===
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function circleRectCollision(circle, rect) {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.height);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

// === Score  And High Score===
let score = 0;
// NOTE:(localStorage.getItem returns string or null)fix using parseInt
let highScore = parseInt(localStorage.getItem('highScore') || 0);
document.getElementById('highScore').textContent = highScore;

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
    document.getElementById('highScore').textContent = highScore;
  }
}

// handle collision between ball & bricks
function handleBallBrickCollisions() {
  const ball = gameState.ball;
  const currentSettings = gameConfigManager.getCurrentSettings();

  for (const brick of brickManager.bricks) {
    if (brick.status !== 1) continue;

    if (circleRectCollision(ball, brick)) {
      // Hit the brick and check if it's destroyed
      const isDestroyed = brick.hit();
      
      // Calculate score based on brick durability and difficulty multiplier
      const basePoints = isDestroyed ? (10 * brick.maxHits) : 5;
      const pointsEarned = Math.floor(basePoints * currentSettings.scoringMultiplier);
      score += pointsEarned;

      const scoreEl = document.getElementById("score");
      if (scoreEl) scoreEl.textContent = score;

      updateHighScore(); //update high score immediately

      // Bounce ball
      const closestX = clamp(ball.x, brick.x, brick.x + brick.width);
      const closestY = clamp(ball.y, brick.y, brick.y + brick.height);
      const dx = ball.x - closestX;
      const dy = ball.y - closestY;

      if (Math.abs(dx) > Math.abs(dy)){
        ball.dx = -ball.dx;
         // push ball outside horizontally
        ball.x = dx > 0 ? brick.x + brick.width + ball.radius : brick.x - ball.radius;
      } else {
        ball.dy = -ball.dy;
        // push ball outside vertically
        ball.y = dy > 0 ? brick.y + brick.height + ball.radius : brick.y - ball.radius;
      }

      // Only drop power-ups when brick is completely destroyed
      if (isDestroyed && Math.random() < 0.2) {
        const types = ["expand", "shrink", "extraLife"];
        const type = types[Math.floor(Math.random() * types.length)];

        // spawn centered in the brick
        powerUps.push(
          new PowerUp(
            brick.x + brick.width / 2 - 15,
            brick.y + brick.height / 2 - 10,
            type
          )
        );
      }
    }
  }
}

// === Win condition ===
function checkWinCondition() {
  // check if all bricks are destroyed 
  // (every) return true if all item meets the condition
  const allCleared = brickManager.bricks.every(brick => brick.status === 0);
  if (allCleared) {
    // Try to advance to next level
    const result = gameConfigManager.advanceLevel();
    
    if (result.success) {
      // Move to next level
      document.getElementById("win-container").style.display = "block";
      canvas.style.display = "none";
      
      document.getElementById("next-level-btn").addEventListener("click", function () {
        playClickSound();
        document.getElementById("win-container").style.display = "none";
        canvas.style.display = "block";
        // Generate new bricks with updated settings
        brickManager.generateBricks(result.settings);
      
        // Update ball speed
        gameState.ball.setSpeedFromConfig(result.settings);
      
        gameState.resetRound();
        gameLoop(); // Restart game loop for next level

      });


    } else {
      // Difficulty completed
      document.getElementById("win-container").style.display = "block";
      canvas.style.display = "none";
      
      
      document.getElementById("win-text").textContent = "All levels completed!";
      document.getElementById("next-level-btn").style.display = "none"; // hide next level button
      

      //issue 1 solve:
      // exit-btn-win
      document.getElementById("exit-btn-win").addEventListener("click", () => {
        playClickSound();
        backToMenu();
      });

    }
    return true;
  }
  return false;
}

// === Check game over conditions ===
function checkBricksReachedBottom() {
  // Check if moving bricks reached the bottom (Medium/Hard mode)
  if (brickManager.checkGameOver()) {
    // Lose a life but continue playing
    gameState.loseLife();

    // Reset all remaining bricks to their original positions
    const resetCount = brickManager.resetBrickPositions();
    
    // Show message to player
    if (gameState.lives > 0) {
      gameState.showLivesLostAnimation();
      //alert(`Bricks reached the bottom! Life lost. ${resetCount} bricks reset to original positions.`);
    }
    
    return true; // Bricks reached bottom
  }
  return false;
}

// === Back to Menu ===
function backToMenu() {
  gameState.isGameOver = true;

  document.getElementById("game-over-container").style.display = "none";
  //second line related to issue 1 :
  document.getElementById("win-container").style.display = "none";  
  document.getElementById("menu-container").style.display = "block";
  document.getElementById("start-game-btn").style.display = "inline-block";
  document.getElementById("difficulty-button").style.display = "flex";
  document.getElementById("canvas-toggle-btn").style.display = "inline-block";
  document.getElementById("gameName").style.display = "block";
  canvas.style.display = "none";
  
  
  // Reset game state
  score = 0;
  document.getElementById("score").textContent = score;
  
  // Reset configuration manager
  gameConfigManager.reset();
  
  // Clear power-ups
  powerUps = [];
}

// === Game Loop ===
function gameLoop() {
  if (gameState.isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update bricks first
  brickManager.update();
  
  // Check if bricks reached bottom (loses life but continues game)
  checkBricksReachedBottom();
  
  // Check if game is over after potential life loss
  if (gameState.isGameOver) return;

  // Bricks
  brickManager.drawBricks(ctx);

  // Paddle
  const paddle = gameState.paddle;
  paddle.update();
  paddle.draw();

  // Ball
  const ball = gameState.ball;
  ball.update(paddle);
  handleBallBrickCollisions();
  ball.draw();
  
  //  Power-ups
  for (let pu of powerUps) {
    pu.update();
    pu.draw(ctx);

    // Check paddle collision
    if (
      pu.y + pu.height >= paddle.y &&
      pu.x < paddle.x + paddle.width &&
      pu.x + pu.width > paddle.x
    ) {
      applyPowerUp(pu.type);
      pu.active = false;
    }

    // Remove if it falls off screen
    if (pu.y > canvas.height) {
      pu.active = false;
    }
  }
  powerUps = powerUps.filter(p => p.active);
   
  if (checkWinCondition()) return;
  requestAnimationFrame(gameLoop);
}

//apply effect of power-ups
function applyPowerUp(type) {
  const paddle = gameState.paddle;

  switch (type) {
    case "expand":
      playClickSound("Assets/powerup2.wav");
      paddle.width *= 1.5;
      setTimeout(() => paddle.width /= 1.5, 10000); // back after 10s
      break;

    case "shrink":
      playClickSound("Assets/powerdown.wav");
      paddle.width *= 0.7;
      setTimeout(() => paddle.width /= 0.7, 10000);
      break;

    case "extraLife":
      playClickSound("Assets/powerup1.wav");
      gameState.lives++;
      gameState.updateHUD();
      break;
  }
}

const circles = createCircles(100, backgroundCanvas.width, backgroundCanvas.height);
animate(bc, circles, backgroundCanvas.width, backgroundCanvas.height);

// === Audio ===
const speakerBtn = document.getElementById("speaker-btn");
const bg = document.getElementById("bg");
setupAudio(speakerBtn, bg);

// === Start button ===
document.getElementById("start-game-btn").addEventListener("click", function () {
  // hide menu buttons when game starts and play click sound
  hideButtonById("start-game-btn");
  hideButtonById("difficulty-button");
  hideButtonById("gameName");
  hideButtonById("canvas-toggle-btn");   //  hide toggle button
  playClickSound();
  canvas.style.display = "block";

  // Initialize game with selected difficulty
  const selectedDifficulty = difficultySelector.getValue();
  gameConfigManager.initialize(selectedDifficulty);
  
  // Get current settings
  const currentSettings = gameConfigManager.getCurrentSettings();
  
  console.log("Starting game with settings:", currentSettings);

  // Create new game state
  gameState = new GameState(canvas, 3, {
    onGameOver: () => backToMenu(),
  });

  // Generate bricks with current settings
  brickManager.generateBricks(currentSettings);
  
  // Set ball speed
  gameState.ball.setSpeedFromConfig(currentSettings);
  
  gameState.resetRound();
  
  // reset score at start of game
  score = 0;
  document.getElementById("score").textContent = score;
  
  gameLoop();
});



//here where issue 1 was third change
document.getElementById("exit-btn-gameover").addEventListener("click", () => {
  playClickSound();
  backToMenu();
});


document.getElementById("exit-btn-win").addEventListener("click", () => {
  playClickSound();
  backToMenu();
});


document.getElementById("try-again-btn").addEventListener("click", function () {
  playClickSound();
  document.getElementById("game-over-container").style.display = "none";
  canvas.style.display = "block";
  score = 0;
  document.getElementById("score").textContent = score;
  document.getElementById("start-game-btn").click();
});


// change mode button 
const toggleBtn = document.getElementById("canvas-toggle-btn");
toggleBtn.addEventListener("click", () => {
  isFullscreen = !isFullscreen;   // toggle mode
  resizeCanvas();                  // apply changes
  playClickSound();
});