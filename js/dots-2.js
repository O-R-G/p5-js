let angle = 0;
let running = false;
let recorder;
let chunks = [];
let recording = false;
let elapsed = 0;

const animationDuration = 2;
const totalRotations = 3;

function setup() {
    pixelDensity(1);
    createCanvas(400, 400);
    noStroke();
}

function draw() {
    background(0);

    if (running) {
        elapsed = min(elapsed + deltaTime / 1000, animationDuration);
        const progress = elapsed / animationDuration;
        const eased = 1 - pow(1 - progress, 5);
        angle = -totalRotations * TWO_PI * eased;

        if (elapsed === animationDuration) {
            running = false;

            if (recording) {
                requestAnimationFrame(() => {
                    stopRecording();
                    recording = false;
                });
            }
        }
    }

    translate(width / 2, height / 2);
    rotate(angle);

    fill('#0000FF');
    circle(75, -75, 180);

    fill('#FF0000');
    circle(-75, 75, 180);
}

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
        a.download = 'dots-2.mp4';
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
        if (elapsed === animationDuration) {
            elapsed = 0;
            angle = 0;
        }
        running = !running;
    }

    if (key === '.') {
        if (recording) {
            stopRecording();
            recording = false;
            running = false;
        } else {
            recording = true;
            running = false;
            elapsed = 0;
            angle = 0;

            requestAnimationFrame(() => {
                if (!recording) return;
                startRecording();
                running = true;
            });
        }
    }
}
