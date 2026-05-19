/*

    todo : zoom and translate keeping all in frame
    see scene 1, fov, textwidth, etc

*/


let x = 0;
let fov;
let font;
let counter = 0;            // float counter
let maxCount = 100;         // max number to reach
let t = 0;                  // time variable (0 → 1)
let easeDuration = 300;     // frames over which to ease in
let easeExponent = 3;       // pow(t, n) = nth-degree easing
let easeAdjust = 1;         // [1] > 1 speed up | < 1 slow down
let running = false;        // animation starts paused
let reverse = false;        // reverse animation
let rotated = false;
let points = [0, 1];    // start sequence
let lastStep = 1;       // track last step
let scaling = 1.0;

function preload() {
  myFont = loadFont('assets/sf-mono-medium.ttf'); // adjust path if needed
}

function preload() {
    // explicit load required for webgl to display text
    // cannot use system font, cannot use local p5.min.js
    font = loadFont('assets/speech-to-text-webfont.ttf');
}

function setup() {
    createCanvas(800, 450, WEBGL);
    textFont(font);
    textAlign(LEFT, CENTER);
    textSize(96);
    fov = PI / 3; // default perspective fov
    let near = 0.1;
    let far = 10000; // very far
    perspective(fov, width/height, near, far);
    counter = 0;
}

function draw() {  
    background(0);
    orbitControl();

    // exponential ease-in (starts slow, speeds up)
    // counter = maxCount * pow(t, easeExponent) * easeAdjust; // pow(t, n) = nth-degree easing
    // let x = floor(counter);

    counter += 0.05; // forward animation
    // counter -= 0.05; // uncomment to test reverse manually
    let x = floor(counter);

    // build points[]    
    if (x + 1 > points.length - 1) {
        while (points.length <= x + 1) {
            points.push(points[points.length - 1] / 2);
        }
    } else if (x + 1 < points.length - 1) {
        points = points.slice(0, x + 2);
    }

    // draw points[]
    push();

    /*
    // tmp hack scaling
    translate(-width/5,0,-width/4);
    scaling *= 1.01;
    scale(1,1,-1/scaling);
    // rotateY(-QUARTER_PI); // tilt for perspective
    */

    for (let i = 0; i < points.length; i++) {
        let val = points[i];
        let xPos = val * 200;
        let yPos = 0;
        let zPos = val === 0 ? 10000 : 10 / val; // safe for zero
        push();
        translate(xPos, yPos, -zPos);
        fill(0,255,0,100); 
        noStroke();
        // text(val, 0, 0);
        // text(val.toPrecision(6), 0, 0);
        text(noSci(val, 12), 0, 0);
        pop();
    }
    pop();
}

function noSci(n, digits = 10) {
  return Number(n).toFixed(digits).replace(/\.?0+$/, '');
}

/*
// not working
function keyPressed() {
  if (key === 'R') counter -= 0.5; // reverse
  if (key === 'F') counter += 0.5; // forward
}
*/

/*
function keyPressed() {
    if (key === ' ') { 
        running = !running; 
    }
    if (key === 'R' || key === 'r') { 
        running = true;       // make sure it runs
        reverse = !reverse;   // toggle reverse mode
    }
}
*/
