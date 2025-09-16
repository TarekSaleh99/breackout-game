import { BrickManager } from "./bricks.js";
import { GameState } from "./gameState.js";
import { animate, setupAudio, createCircles, hideButtonById } from "./background.js";

// === Setup main canvas ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// === Create game objects ===
const gameState = new GameState(canvas); // paddle & ball initialized correctly
const brickManager = new BrickManager(canvas);

// === Resize handler ===
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // update bricks canvas & layout
  brickManager.canvas = canvas;
  brickManager.calculateBrickLayout();
  brickManager.generateBricks();

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

// === Score ===
let score = 0;
function handleBallBrickCollisions() {
  const ball = gameState.ball;
  for (const brick of brickManager.bricks) {
    if (brick.status !== 1) continue;
    if (circleRectCollision(ball, brick)) {
      brick.status = 0;
      score += 10;
      const scoreEl = document.getElementById("score");
      if (scoreEl) scoreEl.textContent = score;

      // Bounce ball
      const closestX = clamp(ball.x, brick.x, brick.x + brick.width);
      const closestY = clamp(ball.y, brick.y, brick.y + brick.height);
      const dx = ball.x - closestX;
      const dy = ball.y - closestY;
      if (Math.abs(dx) > Math.abs(dy)) ball.dx = -ball.dx;
      else ball.dy = -ball.dy;

      break;
    }
  }
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

  requestAnimationFrame(gameLoop);
}

// === Background stars ===
const backgroundCanvas = document.getElementById("background");
backgroundCanvas.width = window.innerWidth;
backgroundCanvas.height = window.innerHeight;
const bc = backgroundCanvas.getContext("2d");

const circles = createCircles(100, backgroundCanvas.width, backgroundCanvas.height);
animate(bc, circles, backgroundCanvas.width, backgroundCanvas.height);

// === Audio ===
const speakerBtn = document.getElementById("speaker-btn");
const bg = document.getElementById("bg");
setupAudio(speakerBtn, bg);

// === Start button ===
document.getElementById("start-game-btn").addEventListener("click", function () {
  hideButtonById("start-game-btn");
  gameLoop();
});
