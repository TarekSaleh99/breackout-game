import { Paddle } from "./Paddle.js";
import { Ball } from "./ball.js";

export class GameState {
  constructor(canvas, initialLives = 3) {
    this.canvas = canvas;
    this.lives = initialLives;
    this.isGameOver = false;

    // create paddle and ball (ball receives reference to this GameState)
    this.paddle = new Paddle(canvas);
    this.ball = new Ball(canvas, this.paddle, this);

    this.updateHUD();
  }

  // Update the lives counter in DOM
  updateHUD() {
    const livesElement = document.getElementById("lives");
    if (livesElement) livesElement.textContent = this.lives;
  }

  // Lose a life when ball misses the paddle
  loseLife() {
    this.lives--;
    this.updateHUD();

    if (this.lives <= 0) {
      // Game over → stop the game loop
      this.isGameOver = true;
      this.gameOver();
    } else {
      // Just reset the ball above the current paddle
      this.ball.reset(this.paddle);
    }
  }

  // Reset ball & paddle positions (for new game / resize)
  resetRound() {
    this.paddle = new Paddle(this.canvas);
    this.ball = new Ball(this.canvas, this.paddle, this);
    this.updateHUD();
  }

  // Game over state
  gameOver() {
    alert("Game Over");
  }
}