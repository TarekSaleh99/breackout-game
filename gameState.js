import { Paddle } from "./Paddle.js";
import { Ball } from "./ball.js";

export class GameState {
  constructor(canvas, initialLives = 3, { onGameOver } = {}) {
    this.canvas = canvas;
    this.lives = initialLives;
    this.isGameOver = false;

    // callbacks
    this.onGameOver = onGameOver;

    // create paddle and ball
    this.paddle = new Paddle(canvas);
    this.ball = new Ball(canvas, this.paddle, this);
    this.isPaused = false;

    this.updateHUD();
  }

  // Update the lives counter in DOM
  updateHUD() {
    const livesElement = document.getElementById("lives");
    if (livesElement) livesElement.textContent = this.lives;
  }

  // Lose a life when ball misses the paddle OR when bricks reach bottom
  loseLife() {
    this.lives--;
    this.updateHUD();
    this.showLivesLostAnimation();

    if (this.lives <= 0) {
      this.isGameOver = true;
      this.handleGameOver();
    } else {
      // Only reset ball if it's not already positioned correctly
      // (this prevents double reset when bricks reach bottom)
      if (this.ball.y > this.canvas.height * 0.8) {
        this.ball.reset(this.paddle);
      }
      if (this.onLifeLost) this.onLifeLost(this.lives);
    }
  }

  // Reset paddle & ball (new round or after resize)
  resetRound() {
    this.paddle = new Paddle(this.canvas);
    this.ball = new Ball(this.canvas, this.paddle, this);
    this.updateHUD();
  }

  // Trigger game over callback
  handleGameOver() {
    const gameOverContainer = document.getElementById("game-over-container");
    const startGameContainer = document.getElementById("menu-container");

    if (gameOverContainer) {
      gameOverContainer.style.display = "block";
      document.getElementById("pauseBtn").style.display = "none";
    }
    if (this.canvas) {
      this.canvas.style.display = "none";
    }
    if (startGameContainer) {
      startGameContainer.style.display = "none";
    }
  }

  // Show "-1 Life" animation
  showLivesLostAnimation() {
  // Remove any existing animation element
  const oldAnim = document.getElementById("lives-anim");
  if (oldAnim) oldAnim.remove();

  // Create new animation element
  const anim = document.createElement("div");
  anim.id = "lives-anim";
  anim.textContent = "Lives -1";
  document.body.appendChild(anim);

  // Remove after animation completes (1.2s)
  setTimeout(() => {
    anim.remove();
  }, 1200);
}
}