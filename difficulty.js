import { playClickSound } from "./background.js";

// Difficulty configuration object
const DIFFICULTY_CONFIG = {
  "Easy": {
    maxLevels: 3,
    ballSpeedMultipliers: [1.0, 1.2, 1.4], // Level 1, 2, 3
    brickMovement: {
      enabled: false,
      baseSpeeds: [0, 0, 0]
    },
    multiHitBricks: {
      enabled: false,
      level2: { twoHit: 0, threeHit: 0 },
      level3: { twoHit: 0, threeHit: 0 }
    },
    baseRows: 5, // Starting rows, +1 per level
  },
  
  "Medium": {
    maxLevels: 3,
    ballSpeedMultipliers: [1.3, 1.6, 1.9],
    brickMovement: {
      enabled: true,
      baseSpeeds: [0.05, 0.1, 0.15] // Slow to moderate movement
    },
    multiHitBricks: {
      enabled: false,
      level2: { twoHit: 0, threeHit: 0 },
      level3: { twoHit: 0, threeHit: 0 }
    },
    baseRows: 6,
  },
  
  "Hard": {
    maxLevels: 3,
    ballSpeedMultipliers: [1.5, 2.0, 2.5],
    brickMovement: {
      enabled: true,
      baseSpeeds: [0.15, 0.18, 0.21] // Moderate to fast movement
    },
    multiHitBricks: {
      enabled: true,
      level2: { twoHit: 0.3, threeHit: 0 }, // 30% two-hit bricks
      level3: { twoHit: 0.3, threeHit: 0.1 } // 30% two-hit, 20% three-hit
    },
    baseRows: 5,
  }
};

export class DifficultySelector {
  constructor(leftArrow, rightArrow, displayElement, options = {}) {
    // if no options provided, default to these difficulties
    this.difficulties = options.difficulties || Object.keys(DIFFICULTY_CONFIG);
    this.currentIndex = options.startIndex || 0;

    this.displayElement = displayElement;
    this.leftArrow = leftArrow;
    this.rightArrow = rightArrow;

    // Bind events
    this.leftArrow.addEventListener("click", () => this.prev());
    this.rightArrow.addEventListener("click", () => this.next());

    this.updateDisplay();
  }

  //when left button is clicked, the previous difficulty is shown
  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.difficulties.length) % this.difficulties.length;
    this.updateDisplay();
    playClickSound();
  }

  //when next button is clicked, the next difficulty is shown
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.difficulties.length;
    this.updateDisplay();
    playClickSound();
  }

  // updates the display to show the current difficulty
  updateDisplay() {
    const difficulty = this.difficulties[this.currentIndex];
    const config = DIFFICULTY_CONFIG[difficulty];
    
    this.displayElement.innerHTML = `
      <div class="difficulty-name">${difficulty}</div>
    `;
  }

  // return the current level difficulty
  getValue() {
    return this.difficulties[this.currentIndex];
  }

  // Get difficulty configuration
  getConfig(difficulty = null) {
    const diff = difficulty || this.getValue();
    return DIFFICULTY_CONFIG[diff];
  }
}

// Level Manager Class - handles level progression and configuration
export class LevelManager {
  constructor() {
    this.currentDifficulty = "Easy";
    this.currentLevel = 1;
    this.maxLevel = 3;
  }

  // Set current difficulty and reset level
  setDifficulty(difficulty) {
    this.currentDifficulty = difficulty;
    this.currentLevel = 1;
    this.maxLevel = DIFFICULTY_CONFIG[difficulty].maxLevels;
  }

  // Advance to next level
  nextLevel() {
    if (this.currentLevel < this.maxLevel) {
      this.currentLevel++;
      return true; // Successfully advanced
    }
    return false; // Max level reached
  }

  // Reset to level 1
  resetLevel() {
    this.currentLevel = 1;
  }

  // Get current level info
  getCurrentInfo() {
    return {
      difficulty: this.currentDifficulty,
      level: this.currentLevel,
      maxLevel: this.maxLevel,
      isLastLevel: this.currentLevel === this.maxLevel
    };
  }

  // Get ball speed multiplier for current difficulty/level
  getBallSpeedMultiplier() {
    const config = DIFFICULTY_CONFIG[this.currentDifficulty];
    return config.ballSpeedMultipliers[this.currentLevel - 1] || 1.0;
  }

  // Get brick movement configuration
  getBrickMovementConfig() {
    const config = DIFFICULTY_CONFIG[this.currentDifficulty];
    return {
      enabled: config.brickMovement.enabled,
      speed: config.brickMovement.baseSpeeds[this.currentLevel - 1] || 0
    };
  }

  // Get multi-hit brick configuration
  getMultiHitBrickConfig() {
    const config = DIFFICULTY_CONFIG[this.currentDifficulty];
    
    if (!config.multiHitBricks.enabled) {
      return { twoHitChance: 0, threeHitChance: 0 };
    }

    if (this.currentLevel === 2) {
      return {
        twoHitChance: config.multiHitBricks.level2.twoHit,
        threeHitChance: config.multiHitBricks.level2.threeHit
      };
    } else if (this.currentLevel === 3) {
      return {
        twoHitChance: config.multiHitBricks.level3.twoHit,
        threeHitChance: config.multiHitBricks.level3.threeHit
      };
    }

    return { twoHitChance: 0, threeHitChance: 0 };
  }

  // Get number of brick rows for current level
  getBrickRowCount() {
    const config = DIFFICULTY_CONFIG[this.currentDifficulty];
    return Math.min(config.baseRows + (this.currentLevel - 1), 10); // Cap at 10 rows
  }

  // Get scoring multiplier (tougher difficulties = more points)
  getScoringMultiplier() {
    const multipliers = {
      "Easy": 1.0,
      "Medium": 1.5,
      "Hard": 2.0
    };
    return multipliers[this.currentDifficulty] || 1.0;
  }

  // Check if game should end due to difficulty completion
  isDifficultyCompleted() {
    return this.currentLevel > this.maxLevel;
  }

  // Get level progression message
  getLevelMessage() {
    if (this.currentLevel === 1) {
      return `Starting ${this.currentDifficulty} Mode - Level 1`;
    } else {
      return `Level ${this.currentLevel - 1} cleared! Moving to Level ${this.currentLevel}`;
    }
  }

  // Get completion message
  getCompletionMessage() {
    return `🎉 You beat ${this.currentDifficulty} Mode! All ${this.maxLevel} levels completed!`;
  }

  // Update HUD with current info
  updateHUD() {
    // Update level display
    const levelElement = document.getElementById("current-level");
    if (levelElement) {
      levelElement.textContent = `${this.currentDifficulty} - Level ${this.currentLevel}`;
    }

    // Update progress display
    const progressElement = document.getElementById("level-progress");
    if (progressElement) {
      progressElement.textContent = `${this.currentLevel}/${this.maxLevel}`;
    }
  }
}

// Game Configuration Manager - centralizes all game settings
export class GameConfigManager {
  constructor() {
    this.levelManager = new LevelManager();
  }

  // Initialize with difficulty
  initialize(difficulty) {
    this.levelManager.setDifficulty(difficulty);
    this.levelManager.updateHUD();
  }

  // Get all current game settings in one object
  getCurrentSettings() {
    const info = this.levelManager.getCurrentInfo();
    
    return {
      // Basic info
      difficulty: info.difficulty,
      level: info.level,
      isLastLevel: info.isLastLevel,
      
      // Ball settings
      ballSpeedMultiplier: this.levelManager.getBallSpeedMultiplier(),
      
      // Brick settings
      brickMovement: this.levelManager.getBrickMovementConfig(),
      multiHitBricks: this.levelManager.getMultiHitBrickConfig(),
      brickRowCount: this.levelManager.getBrickRowCount(),
      
      // Scoring
      scoringMultiplier: this.levelManager.getScoringMultiplier()
    };
  }

  // Advance level and return new settings
  advanceLevel() {
    const canAdvance = this.levelManager.nextLevel();
    
    if (canAdvance) {
      this.levelManager.updateHUD();
      return {
        success: true,
        message: this.levelManager.getLevelMessage(),
        settings: this.getCurrentSettings()
      };
    } else {
      return {
        success: false,
        completed: true,
        message: this.levelManager.getCompletionMessage()
      };
    }
  }

  // Reset to beginning
  reset() {
    this.levelManager.resetLevel();
    this.levelManager.updateHUD();
  }

  // Get level manager for direct access if needed
  getLevelManager() {
    return this.levelManager;
  }
}