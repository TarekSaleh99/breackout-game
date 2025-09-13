var colorArray = [
    '#FD8A8A',
    '#eff5abff',
    '#FFCBCB',
    '#A8D1D1',
    '#9EA1D4',
];

export default class Ball {
    constructor(canvas, paddle, radius = 25, dx = 5, dy = -5) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = radius;
        this.x = paddle.x + paddle.width / 2;
        this.y = paddle.y - this.radius;
        this.dx = dx;
        this.dy = dy;
        this.color = colorArray[Math.floor(Math.random() * colorArray.length)];
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.strokeStyle = "gray"
        this.ctx.closePath();
    }

    update(paddle) {
        this.x += this.dx;
        this.y += this.dy;


        if (this.x + this.radius > this.canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y - this.radius < 0) {
            this.dy = -this.dy;
        }


        if (
            this.y + this.radius > paddle.y &&
            this.x > paddle.x &&
            this.x < paddle.x + paddle.width
        ) {
            this.dy = -this.dy;
        }


        if (this.y + this.radius > this.canvas.height) {
            this.x = paddle.x + paddle.width / 2;
            this.y = paddle.y - this.radius;
            this.dx = 4;
            this.dy = -4;
        }
    }
}