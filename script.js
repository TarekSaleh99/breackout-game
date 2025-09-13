
import { calculateBrickLayout, generateBricks, drawBricks, bricks } from './bricks.js';
import { paddle, initPaddle, drawPaddle, setupInput, updatePaddle } from './Paddle.js';
import { initBall, drawBall, updateBall, ball } from './ball.js';
import { initGameState, gameState } from './gameState.js'

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  // Update brick layout when canvas resizes
  calculateBrickLayout(canvas);
  generateBricks();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();


initPaddle(canvas);
setupInput(canvas);
initBall(canvas, paddle);
initGameState();




// collision part between ball & bricks start here!
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Check circle-rectangle collision
function circleRectCollision(circle, rect) {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.height);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return (dx * dx + dy * dy) <= (circle.radius * circle.radius);
}

//handleBallBrickCollisions here
let score = 0;

function handleBallBrickCollisions() {
  for (const brick of bricks) {
    if (brick.status !== 1) continue;

    if (circleRectCollision(ball, brick)) {
      // 1. Remove brick
      brick.status = 0;

      // 2. Update score
      score += 10;
      document.getElementById("score").textContent = score;

      // 3. Bounce ball
      const closestX = clamp(ball.x, brick.x, brick.x + brick.width);
      const closestY = clamp(ball.y, brick.y, brick.y + brick.height);
      const dx = ball.x - closestX;
      const dy = ball.y - closestY;

      if (Math.abs(dx) > Math.abs(dy)) {
        ball.dx = -ball.dx;
      } else {
        ball.dy = -ball.dy;
      }

      break; // only handle one brick per frame
    }
  }
}

// game loop to handle breakout game !
function gameLoop() {
  if (gameState.isGameOver) return; // stop updating if game over

  ctx.clearRect(0, 0, canvas.width, canvas.height);


  // Draw Bricks
  drawBricks(ctx);

   // paddle
  updatePaddle(canvas);
  drawPaddle(ctx);

   //ball
  updateBall(paddle);
  handleBallBrickCollisions(); 
  drawBall();

  requestAnimationFrame(gameLoop);
}

// Restart button → regenerate new wall
document.getElementById("restartBtn").addEventListener("click", () => {
  generateBricks();
  gameState.lives = 3;
  gameState.isGameOver = false;
  initGameState();
});

gameLoop();
