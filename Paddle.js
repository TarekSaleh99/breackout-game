// Paddle.js

export class Paddle {
  constructor(canvas, width = 200, height = 20, speed = 5) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.width = width;
    this.height = height;
    this.speed = speed;

    // Initial position
    this.x = (canvas.width - this.width) / 2;
    this.y = canvas.height - this.height - 10;

    this.rightPressed = false;
    this.leftPressed = false;

    this.setupInput();
  }

  // Draw paddle
  draw() {
    const ctx = this.ctx;
    ctx.save();
    ctx.shadowBlur = 3;
    ctx.shadowColor = "#0084ffdb";
    ctx.strokeStyle = "#191cd6ff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    // Use roundRect if supported; fallback will throw in old browsers
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(this.x, this.y, this.width, this.height, 30);
    } else {
      ctx.rect(this.x, this.y, this.width, this.height);
    }
    ctx.fillStyle = "#8a90e8aa";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  // Keep paddle inside canvas
  clamp() {
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.canvas.width) {
      this.x = this.canvas.width - this.width;
    }
  }

  // Keyboard & mouse controls
  setupInput() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Right" || e.key === "ArrowRight") {
        this.rightPressed = true;
      } else if (e.key === "Left" || e.key === "ArrowLeft") {
        this.leftPressed = true;
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "Right" || e.key === "ArrowRight") {
        this.rightPressed = false;
      } else if (e.key === "Left" || e.key === "ArrowLeft") {
        this.leftPressed = false;
      }
    });

    document.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < this.canvas.width) {
        this.x = relativeX - this.width / 2;
      }
    });
  }

  // Update paddle position
  update() {
    if (this.rightPressed) {
      this.x += this.speed;
    } else if (this.leftPressed) {
      this.x -= this.speed;
    }
    this.clamp();
  }
}
