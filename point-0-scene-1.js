let x = 0;
let fov;
let font;
let counter = 0;            // float counter
let maxCount = 10000;         // max number to reach
let t = 0;                  // time variable (0 → 1)
let speed = 1500;           // frames over which to ease in [300]
let ease = 3;               // pow(t, n) = nth-degree easing
let running = false;        // animation starts paused
let reverse = false;        // reverse animation

function preload() {  
  /*
      explicit load required for webgl to display text
      cannot use system font, cannot use local p5.min.js   
  */
  font = loadFont('assets/speech-to-text-webfont.ttf');
}

function setup() {
  createCanvas(800, 450, WEBGL);
  textFont(font);
  fov = PI / 3; 
  let near = 0.1;
  let far = 1000000; // very far (avoid webgl clipping)
  perspective(fov, width/height, near, far);
  counter = 0;
}

function draw() {
  orbitControl();
  background(0,0,0);
  noStroke();

  if (running) {
    if (reverse)
      t -= 1 / speed;  
    else
      t += 1 / speed;  
    t = constrain(t, 0, 1);
  }

  counter = maxCount * pow(t, ease); // pow(t, n) = nth-degree easing
  // counter = maxCount * (t*t*(3 - 2*t)) * 0.25;

  let x = floor(counter); 
  let s = Array.from({ length: x + 1 }, (_, i) => i).join(" ");
  let w = textWidth(s);
  let halfText = w / 2;    // [2]
  let z_adjust = 0.5;      // adjust animation [1.0]
  let z = min(halfText / tan(fov/2), 10000) * z_adjust;
  let scaleFactor = min(1, 10000 / z);

  push();
  fill(255,0,0);
  textSize(96);
  textAlign(CENTER, CENTER);
  translate(0, 0, -z); 
  scale(scaleFactor);
  text(s, 0, 0);
  pop();

  // debug
  fill(255);
  textSize(12);
  textAlign(LEFT, TOP);
  text(counter, -width/2 + 10, -height/2 + 10);
}

function keyPressed() {
  if (key === ' ') { 
    running = !running; 
  }
  if (key === 'R' || key === 'r') { 
    running = true;       // make sure it runs
    reverse = !reverse;   // toggle reverse mode
  }
}
