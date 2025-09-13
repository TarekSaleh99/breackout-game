
import { calculateBrickLayout ,generateBricks, drawBricks} from './bricks.js';
import { paddle, initPaddle, drawPaddle, setupInput, updatePaddle } from './Paddle.js';
import { initBall, drawBall, updateBall, ball } from './ball.js';


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

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);


  // Draw Bricks
  drawBricks(ctx);


  updatePaddle(canvas);
  drawPaddle(ctx);


  updateBall(paddle);
  drawBall();

  requestAnimationFrame(gameLoop);
}

// Restart button → regenerate new wall
document.getElementById("restartBtn").addEventListener("click", () => {
  generateBricks();
});

gameLoop();
