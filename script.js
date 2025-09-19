import { BrickManager } from "./bricks.js";
import { GameState } from "./gameState.js";
import { animate, setupAudio, createCircles, hideButtonById, playClickSound } from "./background.js";
import { DifficultySelector } from "./difficulty.js"; 
//import powerups
import { PowerUp } from "./powerups.js";


//declare power-ups array
let powerUps = [];


const leftArrow = document.getElementById("left");
const rightArrow = document.getElementById("right");
const displayElement = document.getElementById("difficulty");

const difficultySelector = new DifficultySelector(leftArrow, rightArrow, displayElement);
  // ...

// To get the selected difficulty value:


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


// === Difficulty + Level system ===
let currentDifficulty = null;
let currentLevel = 1;
const max_level = 3; 


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
    // Partial mode (70%)
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
  //brickManager.canvas = canvas;
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
// NOTE:(localStorage.getItem returns string or null)fix using paresInt
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

  for (const brick of brickManager.bricks) {
    if (brick.status !== 1) continue;

    if (circleRectCollision(ball, brick)) {
      // Always destroy the brick
      brick.status = 0;
      score += 10;


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

      /* 20% chance to drop a power-up
      if (Math.random() < 0.2) {
        const types = ["expand", "shrink", "extraLife"];
        const type = types[Math.floor(Math.random() * types.length)];
        powerUps.push(new PowerUp(brick.x, brick.y, type));
      }*/


      // 20% chance to drop a power-up
      if (Math.random() < 0.2) {
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
    // Level cleared
    if (currentLevel < max_level) {
      currentLevel++;
      alert(`Level ${currentLevel - 1} cleared! Moving to Level ${currentLevel}`);
      brickManager.calculateBrickLayout();
      brickManager.generateBricks();
      gameState.resetRound();
      gameLoop(); // Restart game loop for next level
    } else {
      // Difficulty cleared
      alert(`🎉 You beat ${currentDifficulty}! Returning to menu.`);
       backToMenu();
    }
    return true;
  }
  return false;
}
// === Back to Menu ===
function backToMenu() {
  gameState.isGameOver = true;
  document.getElementById("start-game-btn").style.display = "inline-block";
  document.getElementById("difficulty-button").style.display = "flex";
  document.getElementById("gameName").style.display = "block";
  score = 0;
  document.getElementById("score").textContent = score;
}

// === Game Loop ===
function gameLoop() {
  if (gameState.isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
      paddle.width *= 1.5;
      setTimeout(() => paddle.width /= 1.5, 10000); // back after 10s
      break;

    case "shrink":
      paddle.width *= 0.7;
      setTimeout(() => paddle.width /= 0.7, 10000);
      break;

    case "extraLife":
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

  currentDifficulty = difficultySelector.getValue();
  currentLevel = 1; // reset level

  gameState = new GameState(canvas, 3, {
    onGameOver: () => backToMenu(),
  });

  brickManager.calculateBrickLayout();
  brickManager.generateBricks();
  gameState.resetRound();
  
  // reset at start of game
  gameLoop();
});

// change mode button 
const toggleBtn = document.getElementById("canvas-toggle-btn");
toggleBtn.addEventListener("click", () => {
  isFullscreen = !isFullscreen;   // toggle mode
  resizeCanvas();                  // apply changes
  playClickSound();
});
