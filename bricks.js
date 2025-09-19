// bricks.js

// Brick grid parameters (constants)
export const BRICK_ROWS = 10;
export const BRICK_COLS = 10;
export const BRICK_PADDING_X = 10;
export const BRICK_PADDING_Y = 10;

const LOWER_ROW_FILL_CHANCE = 0.8; // randomness for grid layout

// === Single Brick Class ===
export class Brick {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.status = 1; // 1 = visible, 0 = destroyed
    this.color = color;
  }

  draw(ctx) {
    if (this.status === 1) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = "#000";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
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

    //NEW: store possible layouts once
    this.layouts = ["grid", "pyramid", "checker", "diamond", "zigzag"];

    // NEW: choose ONE layout for this game
    this.currentLayout = this.layouts[Math.floor(Math.random() * this.layouts.length)];


    this.calculateBrickLayout();
    this.generateBricks();
  }

  calculateBrickLayout() {
    this.brickOffsetLeft = Math.floor(this.canvas.width * 0.05);
    this.brickOffsetTop = Math.floor(this.canvas.height * 0.1);
    this.brickHeight = Math.floor(this.canvas.height * 0.03);
    const totalPaddingX = BRICK_PADDING_X * (BRICK_COLS - 1);
    const innerWidth = this.canvas.width - this.brickOffsetLeft * 2 - totalPaddingX;
    this.brickWidth = Math.floor(innerWidth / BRICK_COLS);
  }

  generateBricks() {
    this.bricks = [];
    
    //use the stored layout instead of picking a new one every time
    const currentLayout = this.currentLayout;

    switch (currentLayout) {
      case "grid": this.generateGrid(); break;
      case "pyramid": this.generatePyramid(); break;
      case "checker": this.generateChecker(); break;
      case "diamond": this.generateDiamond(); break;
      case "zigzag": this.generateZigZag(); break;
    }
    console.log("Generated layout:", currentLayout);
  }


  //  NEW: allow reusing the same layout after resize
  resize(canvas) {
    this.canvas = canvas;
    this.calculateBrickLayout();
    this.generateBricks();
  }


  generateGrid() {
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const x = this.brickOffsetLeft + col * (this.brickWidth + BRICK_PADDING_X);
        const y = this.brickOffsetTop + row * (this.brickHeight + BRICK_PADDING_Y);
        let shouldCreate = false;
        if (row === 0 || row === 2) shouldCreate = true;
        else if (Math.random() < LOWER_ROW_FILL_CHANCE) shouldCreate = true;
        if (shouldCreate) this.bricks.push(this.makeBrick(x, y));
      }
    }
  }

  generatePyramid() {
    for (let row = 0; row < BRICK_ROWS; row++) {
      const startCol = row;
      const endCol = BRICK_COLS - row;
      if (endCol <= startCol) break;
      for (let col = startCol; col < endCol; col++) {
        const x = this.brickOffsetLeft + col * (this.brickWidth + BRICK_PADDING_X);
        const y = this.brickOffsetTop + row * (this.brickHeight + BRICK_PADDING_Y);
        this.bricks.push(this.makeBrick(x, y));
      }
    }
  }

  generateChecker() {
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        if ((row + col) % 2 === 0) {
          const x = this.brickOffsetLeft + col * (this.brickWidth + BRICK_PADDING_X);
          const y = this.brickOffsetTop + row * (this.brickHeight + BRICK_PADDING_Y);
          this.bricks.push(this.makeBrick(x, y));
        }
      }
    }
  }

  generateDiamond() {
    const mid = Math.floor(BRICK_ROWS / 2);
    for (let row = 0; row < BRICK_ROWS; row++) {
      const shrink = Math.abs(mid - row);
      const startCol = shrink;
      const endCol = BRICK_COLS - shrink;
      for (let col = startCol; col < endCol; col++) {
        const x = this.brickOffsetLeft + col * (this.brickWidth + BRICK_PADDING_X);
        const y = this.brickOffsetTop + row * (this.brickHeight + BRICK_PADDING_Y);
        this.bricks.push(this.makeBrick(x, y));
      }
    }
  }

  generateZigZag() {
    for (let row = 0; row < BRICK_ROWS; row++) {
      const offset = (row % 2 === 0 ? 0 : Math.floor(this.brickWidth / 2));
      for (let col = 0; col < BRICK_COLS; col++) {
        const x = this.brickOffsetLeft + col * (this.brickWidth + BRICK_PADDING_X) + offset;
        const y = this.brickOffsetTop + row * (this.brickHeight + BRICK_PADDING_Y);
        this.bricks.push(this.makeBrick(x, y));
      }
    }
  }

  makeBrick(x, y) {
    return new Brick(x, y, this.brickWidth, this.brickHeight, this.pickBrickColor());
  }

  pickBrickColor() {
    const palette = [
      "#00eaff", "#ffee00", "#4ecdc4", "#c084fc", "#ff6bcb",
      "#ffd93d", "#7fb3ff", "#ffadad", "#ffd6a5", "#fdffb6",
      "#caffbf", "#9bf6ff", "#bdb2ff", "#ffc6ff", "#f1c40f",
      "#e67e22", "#bdc3c7", "#95a5a6", "#ecf0f1"
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  drawBricks(ctx) {
    for (const brick of this.bricks) brick.draw(ctx);
  }
}
