const paddle = {
  width: 75,
  height: 10,
  x: 0,
  y: 0,
  speed: 5,
  dx: 0
};

const canvas = document.getElementById("gameCanvas");

paddle.x = (canvas.width - paddle.width) / 2;
paddle.y = canvas.height - paddle.height - 10;

function drawPaddle(ctx) {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.fillStyle = "#60a5fa";
  ctx.fill();
  ctx.closePath();
}

function movePaddle() {
  paddle.x += paddle.dx;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}

window.onload = () => {
  drawPaddle();
};

// Input
let rightPressed = false;
let leftPressed = false;

export function setupInput() {
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);
  document.addEventListener("mousemove", mouseMoveHandler);
  requestAnimationFrame(update);
}

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

function mouseMoveHandler(e) {
  const canvas = document.getElementById("gameCanvas");
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddle.x = relativeX - paddle.width/2;
  }
}

function update() {
  if (rightPressed) {
    paddle.x += paddle.speed;
  } else if (leftPressed) {
    paddle.x -= paddle.speed;
  }
  movePaddle();
  requestAnimationFrame(update);
}
