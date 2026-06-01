let cols = 6*2;
let rows = 6*2;
let scaleSize = 35;
let values = [];
let t = 0;
let running = false;        // animation starts paused
let reverse = false;        // reverse animation
let recorder;
let chunks = [];
let recording = false;
let red;
let green;
let blue;

function setup() {
    createCanvas(380, 380, WEBGL);
    red = color(255, 0, 0);
    green = color(0, 100, 0);
    blue = color(0, 0, 200);
    for (let x = 0; x < cols; x++) {
        values[x] = [];
        for (let z = 0; z < rows; z++) {
            values[x][z] = 0;
        }
    }
}

function draw() {
    background(blue);
    stroke(red);
    strokeWeight(5);

    rotateY(frameCount * 0.002);
    rotateX(-PI/6);

    for (let x = 0; x < cols; x++) {
        for (let z = 0; z < rows; z++) {
        // Smoothly changing Y-value using noise
        values[x][z] = map(noise(x*0.2, z*0.2, t), 0, 1, -60, 60);

        push();
        translate((x - cols/2) * scaleSize, -values[x][z], (z - rows/2) * scaleSize);
        point(0, 0, 0);
        pop();
        }
    }
    t += 0.01; // time for noise
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

