

// Brick grid parameters
export const BRICK_ROWS = 10;
export const BRICK_COLS = 10;
export const BRICK_PADDING_X = 10;
export const BRICK_PADDING_Y = 10;

// Will be calculated dynamically:
export let brickWidth;
export let brickHeight;
export let brickOffsetTop;
export let brickOffsetLeft;

// Randomization for grid rows & cells
const LOWER_ROW_FILL_CHANCE = 0.8;

// Brick  array
export let bricks = [];


// function to calculate dimentions of bricks in canvas 
export function calculateBrickLayout(canvas) {
  brickOffsetLeft = Math.floor(canvas.width * 0.05);  // 5% of width
  brickOffsetTop = Math.floor(canvas.height * 0.1);  // 10% of height
  brickHeight = Math.floor(canvas.height * 0.03); // ~3% of height

  const totalPaddingX = BRICK_PADDING_X * (BRICK_COLS - 1);
  const innerWidth = canvas.width - (brickOffsetLeft * 2) - totalPaddingX;
  brickWidth = Math.floor(innerWidth / BRICK_COLS);
}




// Generate brick array 
export function generateBricks() {
  bricks = []; // clear old bricks

  // Pick a random layout each game
  const layouts = ["grid", "pyramid", "checker","diamond", "random", "zigzag"];
  const currentLayout = layouts[Math.floor(Math.random() * layouts.length)];

  switch (currentLayout) {
    case "grid":
      generateGrid();
      break;

    case "pyramid":
      generatePyramid();
      break;

    case "checker":
      generateChecker();
      break;

    case  "diamond": 
      generateDiamond(); 
      break;

    case "random": 
      generateRandom(); 
      break;
    case "zigzag": 
      generateZigZag(); 
      break;
  }


  console.log("Generated layout:", currentLayout); // just for debugging
}



// === Layout: Classic Grid (your current one) ===
function generateGrid() {
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      const x = brickOffsetLeft + col * (brickWidth + BRICK_PADDING_X);
      const y = brickOffsetTop + row * (brickHeight + BRICK_PADDING_Y);

      let shouldCreate = false;

      if (row === 0 || row === 2) {
        shouldCreate = true;
      } else {
        if (Math.random() < LOWER_ROW_FILL_CHANCE) {
          shouldCreate = true;
        }
      }

      if (shouldCreate) {
        bricks.push(makeBrick(x, y));
      }
    }
  }
}



// === Layout: Pyramid ===
// Row 0 has full width, each lower row shrinks by 1 brick each side
function generatePyramid() {
  for (let row = 0; row < BRICK_ROWS; row++) {
    const startCol = row;                     // shrink from left
    const endCol = BRICK_COLS - row;          // shrink from right
    if (endCol <= startCol) break;            // stop if no space left

    for (let col = startCol; col < endCol; col++) {
      const x = brickOffsetLeft + col * (brickWidth + BRICK_PADDING_X);
      const y = brickOffsetTop + row * (brickHeight + BRICK_PADDING_Y);
      bricks.push(makeBrick(x, y));
    }
  }
}



// === Layout: Checkerboard ===
// Every other column is skipped
function generateChecker() {
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      if ((row + col) % 2 === 0) { // alternate
        const x = brickOffsetLeft + col * (brickWidth + BRICK_PADDING_X);
        const y = brickOffsetTop + row * (brickHeight + BRICK_PADDING_Y);
        bricks.push(makeBrick(x, y));
      }
    }
  }
}

//diamond layout
function generateDiamond() {
  const mid = Math.floor(BRICK_ROWS / 2);

  for (let row = 0; row < BRICK_ROWS; row++) {
    const shrink = Math.abs(mid - row); // shrink as you move away from center
    const startCol = shrink;
    const endCol = BRICK_COLS - shrink;

    for (let col = startCol; col < endCol; col++) {
      const x = brickOffsetLeft + col * (brickWidth + BRICK_PADDING_X);
      const y = brickOffsetTop + row * (brickHeight + BRICK_PADDING_Y);
      bricks.push(makeBrick(x, y));
    }
  }
}


// random layout 
function generateRandom() {
  const brickCount = Math.floor((BRICK_ROWS * BRICK_COLS) * 0.5); // 50% filled

  for (let i = 0; i < brickCount; i++) {
    const col = Math.floor(Math.random() * BRICK_COLS);
    const row = Math.floor(Math.random() * BRICK_ROWS);

    const x = brickOffsetLeft + col * (brickWidth + BRICK_PADDING_X);
    const y = brickOffsetTop + row * (brickHeight + BRICK_PADDING_Y);

    bricks.push(makeBrick(x, y));
  }
}


// zigzag layout
function generateZigZag() {
  for (let row = 0; row < BRICK_ROWS; row++) {
    const offset = (row % 2 === 0 ? 0 : Math.floor(brickWidth / 2)); // shift odd rows

    for (let col = 0; col < BRICK_COLS; col++) {
      const x = brickOffsetLeft + col * (brickWidth + BRICK_PADDING_X) + offset;
      const y = brickOffsetTop + row * (brickHeight + BRICK_PADDING_Y);
      bricks.push(makeBrick(x, y));
    }
  }
}





// === Helper to create a single brick ===
function makeBrick(x, y) {
  return {
    x,
    y,
    width: brickWidth,
    height: brickHeight,
    status: 1,
    color: pickBrickColor()
  };
}




//  Render bricks
export function drawBricks(ctx) {
  for (const brick of bricks) {
    if (brick.status === 1) {
      ctx.fillStyle = brick.color;
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

      //optional border
      ctx.strokeStyle = "#000";
      ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
    }
  }
}

// random color for each brick
function pickBrickColor() {
  const palette = [
    "#00eaff", // cyan neon
    "#ffee00", // yellow neon
    "#4ecdc4", // teal
    "#c084fc", // violet
    "#ff6bcb", // hot pink
    "#ffd93d", // golden yellow
    "#7fb3ff", // light blue
    "#ffadad", // soft red
    "#ffd6a5", // peach
    "#fdffb6", // pale yellow
    "#caffbf", // mint green
    "#9bf6ff", // sky blue
    "#bdb2ff", // lavender
    "#ffc6ff", // pink
    "#f1c40f", // gold
    "#e67e22", // bronze
    "#bdc3c7", // silver gray
    "#95a5a6", // steel
    "#ecf0f1"  // platinum white

  ];
  const randomIndex = Math.floor(Math.random() * palette.length);
  return palette[randomIndex];
}