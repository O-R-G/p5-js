let pathData;
let path;
let pathLength;
// let phrase = "CO-CREATION*CO-CREATION*";
let phrase = "INTERNATIONALCO-CREATION ";
// let phrase = "INTRODUCING NEW GRANTS!";
// let phrase = "& NINE NEW GRANTEES...";
// let phrase = "ANNOUNCING 4 NEW GRANTS ...";
// let phrase = "LET'S GO ON WALKABOUT";
let repeats = 1;
let font;
let fontSize = 42;
// let letterSpacing = 0;          // animated letterSpacing
let letterSpacing = 36.85;
let letterSpacingTarget = 36.85;
let speed = 30;                 // pixels per second along path
let speedTarget = 30;                 
// let speedTarget = 3000;                 
let recorder;
let chunks = [];
let recording = false;
let running = false;
let red, green;

function preload() {
    font = loadFont('assets/standard-bold-webfont.ttf');
    loadStrings("assets/curve.svg", gotSVG);
}

function gotSVG(lines) {
  let svg = lines.join("");
  let match = svg.match(/<path[^>]* d="([^"]+)"/);
  if (!match) {
    console.error("No SVG path found.");
    return;
  }
  pathData = match[1];
}

function setup() {
    createCanvas(400,400);
    textFont(font);
    textSize(fontSize);
    textAlign(CENTER, CENTER);
    path = new svgPathProperties.svgPathProperties(pathData);
    pathLength = path.getTotalLength();
    red = color(255,0,0);
    // green = color(0,255,0);
    green = color(255,200,0);
}

function draw() {
    // background(50,0,0);
    // background(0,30,0);
    background(0,30,50);
    // background(0,0,0);
    translate(70,70);
    scale(1);
    if (running) {
        // drawPathGuide();
        // drawGradientPath();
        let offset = (millis() / 1000) * speed;
        let chars = phrase.repeat(repeats).split("");
        for (let i = 0; i < chars.length; i++) {
            let distance = (i * letterSpacing + offset) % pathLength;
            let p = path.getPointAtLength(distance);
            let p2 = path.getPointAtLength((distance + 1) % pathLength);
            let angle = atan2(p2.y - p.y, p2.x - p.x);
            push();
            translate(p.x, p.y);
            rotate(angle);
            if (i >= chars.length/2)
                // fill(255,0,0);
                // fill(255,100,0);
                fill(green);
            else
                // fill(0,0,220);
                // fill(0,255,0);
                // fill(255,100,0);
                fill(red);
            noStroke();
            // text(chars[i], 0, 0);
            text(chars[i], 0, -5);
            pop();
        }
        if (letterSpacing <= letterSpacingTarget)
            letterSpacing += 0.1;
        if (speed <= speedTarget)
            speed *= 1.025;
    }
}

function drawPathGuide() {
  noFill();
  stroke(255,0,0);
  strokeWeight(10);
  beginShape();
  for (let d = 0; d < pathLength; d += 4) {
    let p = path.getPointAtLength(d);
    vertex(p.x, p.y);
  }
  endShape();
}

function drawGradientPath() {
  strokeWeight(24);
  noFill();
  for (let d = 0; d < pathLength - 4; d += 4) {
    let p1 = path.getPointAtLength(d);
    let p2 = path.getPointAtLength(d + 4);
    // let amt = d / pathLength;
let amt = (d / pathLength + frameCount * 0.005) % 1;
    let c = lerpColor(red, green, amt);

    stroke(c);
    line(p1.x, p1.y, p2.x, p2.y);
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
            running = false;
        } else {
            startRecording();
            recording = true;
            running = true;
        }
    }
}

