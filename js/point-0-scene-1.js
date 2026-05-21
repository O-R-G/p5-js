/*
    point 0. two infinities

    r   toggle reverse
    .   toggle record
        toggle pause
*/

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
let debug = false;
let recorder;
let chunks = [];
let recording = false;


function preload() {  
  /*
      explicit load required for webgl to display text
      cannot use system font, cannot use local p5.min.js   
  */
  font = loadFont('assets/speech-to-text-webfont.ttf');
}

function setup() {
    createCanvas(1600, 900, WEBGL);
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
            t -= (1 / speed) * 5;  
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
    textSize(96*2);
    textAlign(CENTER, CENTER);
    translate(0, 0, -z); 
    scale(scaleFactor);
    text(s, 0, 0);
    pop();

    // debug
    if (debug) {  
        fill(255);
        textSize(12);
        textAlign(LEFT, TOP);
        text(counter, -width/2 + 10, -height/2 + 10);
    }
}

/*
    screen recording
    using builtin safari MediaRecorder()
*/

function startRecording() {
    const canvas = document.querySelector('canvas');
    const stream = canvas.captureStream(30);
    const options = {
        mimeType: 'video/mp4',
        videoBitsPerSecond: 50000000
    };
    recorder = new MediaRecorder(stream, options);
    chunks = [];
    recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'point-3-v2.mp4';
        a.click();
    };
    recorder.start();
}

function stopRecording() {
    if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
    }
}

function keyPressed() {
    if (key === ' ') { 
        running = !running; 
    }
    if (key === 'r') { 
        running = true;       // make sure it runs
        reverse = !reverse;   // toggle reverse mode
    }
    if (key === '.') {
        if (recording) {
            stopRecording();
            recording = false;
        } else {
            startRecording();
            recording = true;
        }
    }
}
