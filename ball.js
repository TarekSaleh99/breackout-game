const colorArray = [
    '#FD8A8A',
    '#eff5abff',
    '#FFCBCB',
    '#A8D1D1',
    '#9EA1D4',
];

let ball = null;

export function initBall(canvas, paddle, radius = 25) {
    ball = {
        canvas: canvas,
        ctx: canvas.getContext("2d"),
        radius: radius,
        x: paddle.x + paddle.width / 2,
        y: paddle.y - radius,
        dx: (Math.random() < 0.5 ? -4 : 4),
        dy: -4,
        color: colorArray[Math.floor(Math.random() * colorArray.length)]
    };
    return ball;
}

export function drawBall() {
    if (!ball) return;
    const ctx = ball.ctx;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.strokeStyle = "gray";
    ctx.stroke();
    ctx.closePath();
}

export function updateBall(paddle) {
    if (!ball) return;

    ball.x += ball.dx;
    ball.y += ball.dy;


    if (ball.x + ball.radius > ball.canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }

    if (ball.y + ball.radius > ball.canvas.height || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }


    if (
        ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        ball.dy = -ball.dy;
    }
}
export { ball };
