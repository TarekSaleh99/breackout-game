

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

    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            // Calculate position
            const x = brickOffsetLeft + col * (brickWidth + BRICK_PADDING_X);
            const y = brickOffsetTop + row * (brickHeight + BRICK_PADDING_Y);

            // flag for randomize rows 
            let shouldCreate = false;

            if (row === 0 || row === 2) {
                //  rows 1, 3 always filled
                shouldCreate = true;
            } else {
                // 2 and other rows → random chance
                if (Math.random() < LOWER_ROW_FILL_CHANCE) {
                    shouldCreate = true;
                }
            }

            if (shouldCreate) {
                //  brick object
                const brick = {
                    x,
                    y,
                    width: brickWidth,
                    height: brickHeight,
                    status: 1, // 1 = visible, 0 = destroyed later
                    color: pickBrickColor()
                };

                bricks.push(brick);
            }
        }
    }
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
  "#ff00ff", // magenta neon
  "#39ff14", // lime green neon
  "#ff9500", // orange neon
  "#ffee00", // yellow neon
  "#ff4d4d", // neon red
  "#4ecdc4", // teal
  "#c084fc", // violet
  "#ff6bcb", // hot pink
  "#ffd93d", // golden yellow
  "#06d6a0", // emerald green
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
  "#d35400", // copper
  "#ecf0f1"  // platinum white

];
  const randomIndex = Math.floor(Math.random() * palette.length);
  return palette[randomIndex];
}