const colorArray = [    //Ball colors
  '#FD8A8A',
  '#eff5abff',
  '#FFCBCB',
  '#A8D1D1',
  '#9EA1D4',
];

export class Ball {
  constructor(canvas, paddle, gameState, radius = 23) {  //Constructor: called for every new ball
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");  //Drawing the ball
    this.radius = radius;
    this.gameState = gameState;

    // Base speed properties for difficulty system
    this.baseSpeed = 8; // Your original speed
    this.currentSpeedMultiplier = 1; // Will be set by difficulty system

    // start position relative to paddle
    this.x = paddle.x + paddle.width / 2;  //Starts in the middle of the paddle
    this.y = paddle.y - radius;  //Starts just above the paddle

    // Initialize with base speed
    this.speed = this.baseSpeed;
    //Make the ball start at a random angle slightly right or left
    const startAngle = (Math.random() - 0.5) * 0.5; // -0.25 to +0.25
    this.dx = startAngle * this.speed;  //  Small left or right angle
    this.dy = -Math.sqrt(this.speed ** 2 - this.dx ** 2);  // Keeping the speed constant

    this.color = colorArray[Math.floor(Math.random() * colorArray.length)];  //Giving the ball random color from our colorArray

    this.lostLife = false; // track if life has already been lost for this fall
  }

  // Set speed based on game configuration (integrates with difficulty system)
  setSpeedFromConfig(gameSettings) {
    this.currentSpeedMultiplier = gameSettings.ballSpeedMultiplier;
    this.speed = this.baseSpeed * this.currentSpeedMultiplier;
    
    // Update dx and dy to maintain the new speed while preserving direction
    const currentMagnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    if (currentMagnitude > 0) {
      this.dx = (this.dx / currentMagnitude) * this.speed;
      this.dy = (this.dy / currentMagnitude) * this.speed;
    }
    
    console.log(`Ball speed updated: ${this.baseSpeed} * ${this.currentSpeedMultiplier} = ${this.speed}`);
  }

  // Legacy method for direct speed setting (maintains compatibility)
  setSpeed(difficulty, level) {
    let speedMultiplier = 1;
    
    switch (difficulty) {
      case "Easy":
        // Level 1: 1x, Level 2: 1.2x, Level 3: 1.4x
        speedMultiplier = 1 + ((level - 1) * 0.2);
        break;
        
      case "Medium":
        // Level 1: 1.3x, Level 2: 1.6x, Level 3: 1.9x
        speedMultiplier = 1.3 + ((level - 1) * 0.3);
        break;
        
      case "Hard":
        // Level 1: 1.5x, Level 2: 2.0x, Level 3: 2.5x
        speedMultiplier = 1.5 + ((level - 1) * 0.5);
        break;
    }
    
    this.currentSpeedMultiplier = speedMultiplier;
    this.speed = this.baseSpeed * speedMultiplier;
    
    // Update dx and dy to maintain the new speed
    const currentMagnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    if (currentMagnitude > 0) {
      this.dx = (this.dx / currentMagnitude) * this.speed;
      this.dy = (this.dy / currentMagnitude) * this.speed;
    }
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);  //Draw a full circle
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.strokeStyle = "gray";
    this.ctx.stroke();
    this.ctx.closePath();
  }

  update(paddle) {
    this.x += this.dx;  // Move ball horizontally
    this.y += this.dy;  // Move ball vertically

    // wall collisions (left & right) - Pushing ball to stop ball vibration with wall
    if (this.x + this.radius > this.canvas.width) {
      this.x = this.canvas.width - this.radius;
      this.dx = -this.dx;
    }
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.dx = -this.dx;
    }

    // top wall collision
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.dy = -this.dy;
    }

    // paddle collision
    if (
      this.y + this.radius > paddle.y &&
      this.y - this.radius < paddle.y + paddle.height &&
      this.x >= paddle.x &&  //paddle edge included
      this.x <= paddle.x + paddle.width //paddle edge included
    ) {

      // relative hit position (-0.5 = left edge, 0 = center, +0.5 = right edge)
      const hitPos = (this.x - paddle.x) / paddle.width - 0.5;

      // new dx proportional to hit position
      this.dx = hitPos * this.speed * 2;

      // adjust dy so total speed remains constant (normalizing speed after collision with paddle)
      const newSpeed = Math.sqrt(this.dx ** 2 + this.dy ** 2);
      this.dx = (this.dx / newSpeed) * this.speed;
      this.dy = -(Math.sqrt(this.speed ** 2 - this.dx ** 2));
    }

    // bottom of screen → lose life (only if not hitting paddle)
    if (
      this.y + this.radius > this.canvas.height &&
      !(this.x >= paddle.x && this.x <= paddle.x + paddle.width &&
        this.y - this.radius < paddle.y + paddle.height)
    ) {
      if (!this.lostLife) {
        this.lostLife = true;
        this.gameState.loseLife();
      }
    }
  }

  reset(paddle) {
    // position ball above paddle
    this.x = paddle.x + paddle.width / 2;  // reposition ball in the center of the paddle
    this.y = paddle.y - this.radius - 2; // a little above paddle

    // Keeping constant speed with random angle after losing life
    const startAngle = (Math.random() - 0.5) * 0.5;
    this.dx = startAngle * this.speed;
    this.dy = -Math.sqrt(this.speed ** 2 - this.dx ** 2);

    // clear lostLife flag
    this.lostLife = false;
  }
}