// bricks.js

// Brick grid parameters (constants)
export const BRICK_ROWS = 10;
export const BRICK_COLS = 10;
export const BRICK_PADDING_X = 10;
export const BRICK_PADDING_Y = 10;

const LOWER_ROW_FILL_CHANCE = 0.8; // randomness for grid layout

// === Single Brick Class ===
export class Brick {
  constructor(x, y, width, height, color, maxHits = 1) {
    this.x = x;
    this.y = y;
    this.originalY = y; // Store original position for reference
    this.width = width;
    this.height = height;
    this.status = 1; // 1 = visible, 0 = destroyed
    this.color = color;
    this.maxHits = maxHits; // How many hits needed to destroy
    this.currentHits = 0; // How many times it's been hit

    // Movement properties (set by brick manager)
    this.moveSpeed = 0;
    this.isMoving = false;

    // Visual effect properties
    this.particles = [];
    this.isDamaged = false;
  }

  // Update brick position (for moving bricks)
  update() {
    if (this.isMoving && this.status === 1) {
      this.y += this.moveSpeed;
    }

    // Update particles
    this.particles = this.particles.filter(particle => {
      particle.update();
      return particle.life > 0;
    });
  }

  // Check if brick reached bottom
  hasReachedBottom(canvasHeight) {
    return this.y + this.height >= canvasHeight * 0.95; // 95% down the canvas
  }

  // Reset brick to original position
  resetPosition() {
    this.y = this.originalY;
  }

  // Hit the brick
  hit() {
    this.currentHits++;

    if (this.currentHits < this.maxHits) {
      // Brick is damaged but not destroyed
      this.isDamaged = true;
      return false; // Not destroyed yet
    } else {
      // Brick is destroyed
      this.status = 0;
      this.createDestroyEffect();
      return true; // Destroyed
    }
  }
  
  // Create destruction effect (particles)
  createDestroyEffect() {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30,
        maxLife: 30,
        color: this.color,
        size: Math.random() * 4 + 2,
        update() {
          this.x += this.vx;
          this.y += this.vy;
          this.vy += 0.2; // gravity
          this.life--;
          this.vx *= 0.98; // friction
        }
      });
    }
  }

  draw(ctx) {
    if (this.status === 1) {
      // Draw main brick
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Draw border
      ctx.strokeStyle = "#000";
      ctx.strokeRect(this.x, this.y, this.width, this.height);

      // Draw damage cracks if damaged
      if (this.isDamaged) {
        ctx.strokeStyle = "#000000ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 2, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width - 2, this.y + this.height / 2);
        ctx.moveTo(this.x + this.width / 2, this.y + 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height - 2);
        ctx.stroke();
        ctx.lineWidth = 1;
      }
    }

    // Draw particles
    this.particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2,
        particle.size, particle.size);
      ctx.restore();
    });
  }
}

// === Brick Manager Class ===
export class BrickManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.bricks = [];
    this.brickWidth = 0;
    this.brickHeight = 0;
    this.brickOffsetTop = 0;
    this.brickOffsetLeft = 0;

    // Store possible layouts once
    this.layouts = ["grid", "pyramid", "checker", "diamond", "zigzag"];

    // Choose ONE layout for this game
    this.currentLayout = this.layouts[Math.floor(Math.random() * this.layouts.length)];

    this.calculateBrickLayout();
  }

  calculateBrickLayout() {
    this.brickOffsetLeft = Math.floor(this.canvas.width * 0.05);
    this.brickOffsetTop = Math.floor(this.canvas.height * 0.1);
    this.brickHeight = Math.floor(this.canvas.height * 0.03);
    const totalPaddingX = BRICK_PADDING_X * (BRICK_COLS - 1);
    const innerWidth = this.canvas.width - this.brickOffsetLeft * 2 - totalPaddingX;
    this.brickWidth = Math.floor(innerWidth / BRICK_COLS);
  }

  // Generate bricks using game configuration
  generateBricks(gameSettings) {
    this.bricks = [];

    console.log("Generating bricks with settings:", gameSettings);

    // Use the stored layout
    const currentLayout = this.currentLayout;

    switch (currentLayout) {
      case "grid": this.generateGrid(gameSettings); break;
      case "pyramid": this.generatePyramid(gameSettings); break;
      case "checker": this.generateChecker(gameSettings); break;
      case "diamond": this.generateDiamond(gameSettings); break;
      case "zigzag": this.generateZigZag(gameSettings); break;
    }

    console.log(`Generated ${this.bricks.length} bricks for ${gameSettings.difficulty} Level ${gameSettings.level}`);
  }

  // Update all bricks
  update() {
    this.bricks.forEach(brick => {
      brick.update();
    });
  }

  // Check if any moving brick reached the bottom
  checkGameOver() {
    return this.bricks.some(brick =>
      brick.status === 1 && brick.isMoving && brick.hasReachedBottom(this.canvas.height)
    );
  }

  // Reset all remaining bricks to original positions (used when bricks reach bottom)
  resetBrickPositions() {
    let resetCount = 0;
    this.bricks.forEach(brick => {
      if (brick.status === 1) { // Only reset bricks that are still active
        brick.resetPosition();
        resetCount++;
      }
    });
    console.log(`Reset ${resetCount} bricks to original positions`);
    return resetCount;
  }

  // Allow reusing the same layout after resize
  resize(canvas) {
    this.canvas = canvas;
    this.calculateBrickLayout();
  }

  generateGrid(settings) {
    const maxRows = settings.brickRowCount;

    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const x = this.brickOffsetLeft + col * (this.brickWidth + BRICK_PADDING_X);
        const y = this.brickOffsetTop + row * (this.brickHeight + BRICK_PADDING_Y);
        let shouldCreate = false;
        if (row === 0 || row === 2) shouldCreate = true;
        else if (Math.random() < LOWER_ROW_FILL_CHANCE) shouldCreate = true;

        if (shouldCreate) {
          const brick = this.makeBrick(x, y, settings);
          this.bricks.push(brick);
        }
      }
    }
  }

  generatePyramid(settings) {
    const maxRows = settings.brickRowCount;

    for (let row = 0; row < maxRows; row++) {
      const startCol = row;
      const endCol = BRICK_COLS - row;
      if (endCol <= startCol) break;
      for (let col = startCol; col < endCol; col++) {
        const x = this.brickOffsetLeft + col * (this.brickWidth + BRICK_PADDING_X);
        const y = this.brickOffsetTop + row * (this.brickHeight + BRICK_PADDING_Y);
        const brick = this.makeBrick(x, y, settings);
        this.bricks.push(brick);
      }
    }
  }

  generateChecker(settings) {
    const maxRows = settings.brickRowCount;

    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        if ((row + col) % 2 === 0) {
          const x = this.brickOffsetLeft + col * (this.brickWidth + BRICK_PADDING_X);
          const y = this.brickOffsetTop + row * (this.brickHeight + BRICK_PADDING_Y);
          const brick = this.makeBrick(x, y, settings);
          this.bricks.push(brick);
        }
      }
    }
  }

  generateDiamond(settings) {
    const maxRows = settings.brickRowCount;
    const mid = Math.floor(maxRows / 2);

    for (let row = 0; row < maxRows; row++) {
      const shrink = Math.abs(mid - row);
      const startCol = shrink;
      const endCol = BRICK_COLS - shrink;
      for (let col = startCol; col < endCol; col++) {
        const x = this.brickOffsetLeft + col * (this.brickWidth + BRICK_PADDING_X);
        const y = this.brickOffsetTop + row * (this.brickHeight + BRICK_PADDING_Y);
        const brick = this.makeBrick(x, y, settings);
        this.bricks.push(brick);
      }
    }
  }

  generateZigZag(settings) {
    const maxRows = settings.brickRowCount;

    for (let row = 0; row < maxRows; row++) {
      const offset = (row % 2 === 0 ? 0 : Math.floor(this.brickWidth / 2));
      for (let col = 0; col < BRICK_COLS; col++) {
        const x = this.brickOffsetLeft + col * (this.brickWidth + BRICK_PADDING_X) + offset;
        const y = this.brickOffsetTop + row * (this.brickHeight + BRICK_PADDING_Y);
        const brick = this.makeBrick(x, y, settings);
        this.bricks.push(brick);
      }
    }
  }

  makeBrick(x, y, settings) {
    let maxHits = 1;

    // Determine brick durability based on multi-hit configuration
    const multiHitConfig = settings.multiHitBricks;
    const rand = Math.random();

    if (rand < multiHitConfig.threeHitChance) {
      maxHits = 3;
    } else if (rand < multiHitConfig.threeHitChance + multiHitConfig.twoHitChance) {
      maxHits = 2;
    }

    const brick = new Brick(x, y, this.brickWidth, this.brickHeight,
      this.pickBrickColor(maxHits), maxHits);

    // Set movement properties based on configuration
    if (settings.brickMovement.enabled) {
      brick.isMoving = true;
      brick.moveSpeed = settings.brickMovement.speed;
    }

    return brick;
  }

  pickBrickColor(maxHits = 1) {
    let palette;

    // Different colors based on durability
    if (maxHits === 1) {
      palette = [
        "#00eaff", "#ffee00", "#4ecdc4", "#c084fc", "#ff6bcb",
        "#ffd93d", "#7fb3ff", "#ffadad", "#ffd6a5", "#fdffb6",
        "#caffbf", "#9bf6ff", "#bdb2ff", "#ffc6ff"
      ];
    } else if (maxHits === 2) {
      // Stronger colors for 2-hit bricks
      palette = [
        "#f1c40f", "#e67e22", "#e74c3c", "#9b59b6", "#3498db"
      ];
    } else {
      // Even stronger colors for 3-hit bricks
      palette = [
        "#2c3e50", "#7f8c8d", "#34495e", "#95a5a6"
      ];
    }

    return palette[Math.floor(Math.random() * palette.length)];
  }

  drawBricks(ctx) {
    for (const brick of this.bricks) {
      brick.draw(ctx);
    }
  }
}