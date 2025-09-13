import { initBall, ball } from "./ball.js";
import { paddle, initPaddle } from "./Paddle.js";

export let gameState = {
    lives: 3,
    isGameOver: false
};

// Update the lives in DOM
function updateHUD() {
    document.getElementById('lives').textContent = gameState.lives;
}


// lose life when ball misses the paddle
export function loseLife(canvas) {
    gameState.lives--;

    if (gameState.lives <= 0 ) {
        gameOver();
    } else {
        resetRound(canvas);
    }
    updateHUD();
}

// Reset ball & paddle position
function resetRound(canvas){
    initPaddle(canvas);
    initBall(canvas, paddle)
}

function gameOver() {
    gameState.isGameOver = true;
    alert("Game Over")
}

// Call once at start
export function initGameState() {
  updateHUD();
}