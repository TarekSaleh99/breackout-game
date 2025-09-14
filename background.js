// function to setup the audio when the speaker button is clicked with assets for the on and off images
export function setupAudio(speakerBtn, bg, onSrc = "Assets/speaker.png", offSrc = "Assets/speaker-off.png") {
    let isMuted = true;

    // when clicked toggle the music on or off and change the icon
    speakerBtn.addEventListener("click", function () {
        if (isMuted) {
            bg.muted = false;
            bg.play();
            // change image to ON
            speakerBtn.src = onSrc;
            isMuted = false;
        } else {
            bg.muted = true;
            // change image to OFF
            speakerBtn.src = offSrc;
            isMuted = true;
        }
    });
}

// function to hide the start game button by its id when clicked
export function hideButtonById(buttonId) {
    const btn = document.getElementById(buttonId);
    if (btn) {
        btn.style.display = 'none';
    }
}

// creating an empty array and insert (num) circles object with random x and y axis for each one of them 
export function createCircles(num, width, height, dx = 0.08, dy = 0.08, radius = 1) {
    const circles = [];
    for (let i = 0; i < num; i++) {

        const x = Math.random() * width;
        const y = Math.random() * height;
        circles.push(new Circle(x, y, dx, dy, radius));
    
    }
    return circles;
}


//function responsible for moving the circles 
export function animate(c, circles, width, height) {
    // infinite loop to looks like an animation 
    function frame() {

        requestAnimationFrame(frame);

        //clearing the old circles before making the new ones and calling the update method on each one of them
        c.clearRect(0, 0, width, height);

        for (let i = 0; i < circles.length; i++) {
            circles[i].update(c, width, height);
        }
    }
    frame();
}


//javascript object Circle for every (star) that will be drawn
export class Circle {
    constructor(x, y, dx, dy, radius, color = '#ffffff') {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.radius = radius;
        this.color = color;
    }

    // draw method every time it get called a new Circle gets drawn
    draw(c) {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    // update the circle new position and move the x and y values by dy , dx values each time
    update(c, width, height) {
        // increment the circle position by dx and dy 
        this.x += this.dx;
        this.y += this.dy;


        // check if the circle hit any corner of the page to decrement its position by the screen width or height
        if (this.x > width) this.x -= width;
        if (this.y > height) this.y -= height;
        this.draw(c);
    }
}
