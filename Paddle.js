export const paddle = {
  width: 200,
  height: 20,
  x: 0,
  y: 0,
  speed: 5,
  dx: 0
};

let rightPressed = false;
let leftPressed = false;

export function initPaddle(canvas) {
  paddle.x = (canvas.width - paddle.width) / 2;
  paddle.y = canvas.height - paddle.height - 10;
}

export function drawPaddle(ctx) {
  ctx.save();
  ctx.shadowBlur = 3;     
  ctx.shadowColor = "#0084ffdb"; 
  ctx.strokeStyle = "#191cd6ff"; 
  ctx.lineWidth = 4;         
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 30);
  ctx.fillStyle = "#8a90e8aa";
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

function movePaddle(canvas) {
  paddle.x += paddle.dx;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}

export function setupInput(canvas) {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") {
      rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
      leftPressed = true;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") {
      rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
      leftPressed = false;
    }
  });

  document.addEventListener("mousemove", (e) => {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
      paddle.x = relativeX - paddle.width / 2;
    }
  });
}

export function updatePaddle(canvas) {
  if (rightPressed) {
    paddle.x += paddle.speed;
  } else if (leftPressed) {
    paddle.x -= paddle.speed;
  }
  movePaddle(canvas);
}
