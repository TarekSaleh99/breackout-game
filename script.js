import { paddle, initPaddle, drawPaddle, setupInput, updatePaddle } from './JS/Paddle.js';

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

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePaddle(canvas);
  drawPaddle(ctx);

  requestAnimationFrame(update);
}

update();
