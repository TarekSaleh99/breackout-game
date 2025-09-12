import { update } from './JS/paddle.js';

// Canvas resize
const canvas = document.getElementById("gameCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.onload = () => {
  setupInput();
};

// Run on page load
window.onload = () => {
  requestAnimationFrame(update);
};
