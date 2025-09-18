// background.js

export function playClickSound(src = "Assets/mixkit-game-click.wav") {
  const audio = new Audio(src);
  audio.play();
}
// Class to handle background audio toggle
export class AudioManager {
  constructor(speakerBtn, bg, onSrc = "Assets/speaker.png", offSrc = "Assets/speaker-off.png") {
    this.speakerBtn = speakerBtn;
    this.bg = bg;
    this.onSrc = onSrc;
    this.offSrc = offSrc;
    this.isMuted = true;
    this._setupAudioToggle();
  }

  _setupAudioToggle() {
    this.speakerBtn.addEventListener("click", () => {
      if (this.isMuted) {
        playClickSound();
        this.bg.muted = false;
        this.bg.play();
        this.speakerBtn.src = this.onSrc;
      } else {
        playClickSound();
        this.bg.muted = true;
        this.speakerBtn.src = this.offSrc;
      }
      this.isMuted = !this.isMuted;
    });
  }
}

// Class to handle UI buttons
export class UIButton {
  static hideById(buttonId) {
    const btn = document.getElementById(buttonId);
    if (btn) btn.style.display = "none";
  }
}

// Single circle/star for background
export class Circle {
  constructor(x, y, dx = 0.08, dy = 0.08, radius = 1, color = "#ffffff") {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.color = color;
  }

  draw(c) {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update(c, width, height) {
    this.x += this.dx;
    this.y += this.dy;

    if (this.x > width) this.x -= width;
    if (this.y > height) this.y -= height;

    this.draw(c);
  }
}

// Animation helper class (optional)
export class CircleAnimation {
  constructor(ctx, width, height, num = 100, dx = 0.08, dy = 0.08, radius = 1) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.circles = [];
    for (let i = 0; i < num; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      this.circles.push(new Circle(x, y, dx, dy, radius));
    }
  }

  start() {
    const frame = () => {
      requestAnimationFrame(frame);
      this.ctx.clearRect(0, 0, this.width, this.height);
      for (const c of this.circles) c.update(this.ctx, this.width, this.height);
    };
    frame();
  }
}

// Convenience wrapper to create circles array (used by script)
export function createCircles(num, width, height, dx = 0.08, dy = 0.08, radius = 1) {
  const arr = [];
  for (let i = 0; i < num; i++) {
    arr.push(new Circle(Math.random() * width, Math.random() * height, dx, dy, radius));
  }
  return arr;
}

// Convenience animate function used in your original code
export function animate(c, circles, width, height) {
  function frame() {
    requestAnimationFrame(frame);
    c.clearRect(0, 0, width, height);
    for (const circ of circles) circ.update(c, width, height);
  }
  frame();
}

// Convenience small wrappers
export function setupAudio(speakerBtn, bg, onSrc, offSrc) {
  return new AudioManager(speakerBtn, bg, onSrc, offSrc);
}

export function hideButtonById(id) {
  return UIButton.hideById(id);
}
