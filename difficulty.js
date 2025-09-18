import { playClickSound } from "./background.js";


export class DifficultySelector {
  constructor(leftArrow, rightArrow, displayElement, options = {}) {
    // if no options provided, default to these difficulties
    this.difficulties = options.difficulties || ["Easy", "Medium", "Hard"];
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
    this.displayElement.textContent = this.difficulties[this.currentIndex];
  }
  // return the current level difficulty
  getValue() {
    return this.difficulties[this.currentIndex];
  }
}