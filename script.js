
    // Paddle object
    const paddle = {
      width: 75,
      height: 10,
      x: 0,
      y: 0,
      speed: 5
    };

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Position paddle at the bottom middle
    paddle.x = (canvas.width - paddle.width) / 2;
    paddle.y = canvas.height - paddle.height - 10;

    // Draw paddle
    function drawPaddle() {
      ctx.beginPath();
      ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
      ctx.fillStyle = "#60a5fa"; // blue
      ctx.fill();
      ctx.closePath();
    }

    // Keep paddle inside canvas
    function movePaddle() {
      if (paddle.x < 0) paddle.x = 0;
      if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
      }
    }

    // Input
    let rightPressed = false;
    let leftPressed = false;

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
    document.addEventListener("mousemove", mouseMoveHandler);

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
      const relativeX = e.clientX - canvas.offsetLeft;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
      }
    }

    // Game loop
    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (rightPressed) {
        paddle.x += paddle.speed;
      } else if (leftPressed) {
        paddle.x -= paddle.speed;
      }

      movePaddle();
      drawPaddle();

      requestAnimationFrame(update);
    }

    // Start loop
    update();