// powerups.js

export class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 20;
    this.type = type; // "expand", "shrink", "extraLife"
    this.speed = 2;
    this.active = true;
    this.angle = 0; // rotation
    this.glowPhase = 0; // glowing effect
  }

  update() {
    this.y += this.speed;
    this.angle += 0.05; // spin speed
    this.glowPhase += 0.1; // glow animation
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(Math.sin(this.angle) * 0.2); // small oscillating spin

    // Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.getGlowColor();

    switch (this.type) {
      case "expand":
        this.drawCapsule(ctx, "limegreen", "↔");
        break;

      case "shrink":
        this.drawCapsule(ctx, "crimson", "↕");
        break;

      case "extraLife":
        this.drawHeart(ctx, "hotpink");
        break;
    }

    ctx.restore();
  }

  getGlowColor() {
    const alpha = (Math.sin(this.glowPhase) + 1) / 2; // 0 → 1
    switch (this.type) {
      case "expand": return `rgba(50, 255, 50, ${alpha})`;
      case "shrink": return `rgba(255, 50, 50, ${alpha})`;
      case "extraLife": return `rgba(255, 100, 200, ${alpha})`;
    }
  }

  drawCapsule(ctx, color, symbol) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(symbol, 0, 0);
  }

  drawHeart(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 4);
    ctx.bezierCurveTo(
      this.width / 2, -this.height / 2,
      this.width / 2, this.height / 3,
      0, this.height / 2
    );
    ctx.bezierCurveTo(
      -this.width / 2, this.height / 3,
      -this.width / 2, -this.height / 2,
      0, -this.height / 4
    );
    ctx.fill();
  }
}
