let pathData;
let path;
let pathLength;
let phrase = "CO-CREATION*";
// let phrase = "WE ARE HAPPY TO ANNOUNCE 3 NEW GRANTS ...";
let font;
let fontSize = 40;
let letterSpacing = 0;
let letterSpacingTarget = 37;
// let letterSpacing = 20;
// let letterSpacing = 0;       // for animated letterSpacing
let speed = 30; // pixels per second along path
let recorder;
let chunks = [];
let recording = false;

function preload() {
    font = loadFont('assets/standard-bold-webfont.ttf');
    loadStrings("assets/curve.svg", gotSVG);
}

function gotSVG(lines) {
  let svg = lines.join("");

  // finds first <path d="...">
  let match = svg.match(/<path[^>]* d="([^"]+)"/);

  if (!match) {
    console.error("No SVG path found.");
    return;
  }

  pathData = match[1];
}

function setup() {
  createCanvas(400,400);
  // textFont("Helvetica");
  textFont(font);
  textSize(fontSize);
  textAlign(CENTER, CENTER);
  path = new svgPathProperties.svgPathProperties(pathData);
  pathLength = path.getTotalLength();
}

function draw() {
  background(20,20,20);
  translate(70,70);
  // optional: scale/position your path
  scale(1);

  // drawPathGuide();

  let offset = (millis() / 1000) * speed;

  let chars = phrase.repeat(2).split("");

  for (let i = 0; i < chars.length; i++) {
    let distance = (i * letterSpacing + offset) % pathLength;

    let p = path.getPointAtLength(distance);
    let p2 = path.getPointAtLength((distance + 1) % pathLength);

    let angle = atan2(p2.y - p.y, p2.x - p.x);

    push();
    translate(p.x, p.y);
    rotate(angle);
    if (i >= chars.length/2)
        fill(255,0,0);
    else
        fill(0,0,220);
    noStroke();
    text(chars[i], 0, 0);
    pop();
  }
    // animate letterSpacing
    if (letterSpacing <= letterSpacingTarget)
        letterSpacing += 0.1;
}

function drawPathGuide() {
  noFill();
  stroke(200);
  strokeWeight(1);

  beginShape();
  for (let d = 0; d < pathLength; d += 4) {
    let p = path.getPointAtLength(d);
    vertex(p.x, p.y);
  }
  endShape();
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
    if (key === '_') {
        letterSpacing += 1;
    }
    if (key === '-') {
        letterSpacing -= 1;
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

