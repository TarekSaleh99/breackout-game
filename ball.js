// ball.js

const colorArray = [
  '#FD8A8A',
  '#eff5abff',
  '#FFCBCB',
  '#A8D1D1',
  '#9EA1D4',
];

export class Ball {
  constructor(canvas, paddle, gameState, radius = 25) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.radius = radius;
    this.gameState = gameState;

    // start position relative to paddle
    this.x = paddle.x + paddle.width / 2;
    this.y = paddle.y - radius;

    // random direction for horizontal speed
    this.dx = (Math.random() < 0.5 ? -4 : 4);
    this.dy = -4;

    this.color = colorArray[Math.floor(Math.random() * colorArray.length)];
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.strokeStyle = "gray";
    this.ctx.stroke();
    this.ctx.closePath();
  }

  update(paddle) {
    this.x += this.dx;
    this.y += this.dy;

    // wall collisions
    if (this.x + this.radius > this.canvas.width || this.x - this.radius < 0) {
      this.dx = -this.dx;
    }

    if (this.y - this.radius < 0) {
      this.dy = -this.dy;
    }

    // paddle collision
    if (
      this.y + this.radius > paddle.y &&
      this.x > paddle.x &&
      this.x < paddle.x + paddle.width
    ) {
      this.dy = -this.dy;
      // optional: nudge based on where on paddle it hit
      const hitPos = (this.x - paddle.x) / paddle.width - 0.5;
      this.dx += hitPos * 2; // small spin
    }

    // bottom of screen → lose life
    if (this.y + this.radius > this.canvas.height) {
      if (this.gameState && typeof this.gameState.loseLife === "function") {
        this.gameState.loseLife();
      } else {
        // fallback: just reset Y to top if no gameState provided
        this.y = this.canvas.height / 2;
        this.dy = -Math.abs(this.dy);
      }
    }
  }
}
