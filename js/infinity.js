let path;
let pathData;
let pathLength;
let phrase = "INTERNATIONALCO-CREATION ";
let repeats = 1;
let font;
let fontSize = 42;
// let letterSpacing = 0;
// let letterSpacingTarget = 36.85;
let letterSpacing = 36;
let letterSpacingTarget = 36;
let speed = 30;                 // pixels per second along path
let speedTarget = 30;                 
// let speedTarget = 3000;                 
let recorder;
let chunks = [];
let recording = false;
let running = false;
let red, green, blue, yellow;
let _red, _green, _blue, _yellow;
let colors, _colors;

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
    red = color('#FF0000');
    _red = color('#330000');
    green = color('#009900');
    _green = color('#003300');
    blue = color('#000099');
    _blue = color('#000033');
    yellow = color('#FF9900');
    _yellow = color('#333300');
    colors = [green, red, yellow];
    _colors = [_blue, _red, _green];
    // shuffle(colors, true);
    // shuffle(_colors, true);
}

function draw() {
    background(_colors[0]);
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
                fill(colors[1]);
            else
                fill(colors[2]);
            noStroke();
            text(chars[i], 0, -5);
            pop();
        }
        if (letterSpacing <= letterSpacingTarget)
            letterSpacing += 1.025;
        if (speed <= speedTarget)
            speed *= 1.025;
        /*
        if (frameCount % 120 === 0) {
            colors.push(colors.shift());
            _colors.push(_colors.shift());
        }
        */
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
    if (key === '+') {
        speed += 10;
    }
    if (key === '=') {
        speed -= 10;
    }
    if (key === '.') {
        if (recording) {
            stopRecording();
            recording = false;
            running = false;
        } else {
            recording = true;
            running = true;

            requestAnimationFrame(() => {
                startRecording();

                setTimeout(() => {
                    stopRecording();
                    recording = false;
                    running = false;
                }, (pathLength / speed) * 1000);
            });
        }
    }
}
