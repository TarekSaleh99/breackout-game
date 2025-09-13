import { paddle, initPaddle, drawPaddle, setupInput, updatePaddle } from './Paddle.js';
import Ball from './ball.js';


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();


initPaddle(canvas);
setupInput(canvas);

const ball = new Ball(canvas, paddle);

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);


  updatePaddle(canvas);
  drawPaddle(ctx);


  ball.update(paddle);
  ball.draw();

  requestAnimationFrame(gameLoop);
}

gameLoop();
