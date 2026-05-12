/*

    point 3. cause and effect

	z = zoom to fit
	← = rotateY - PI/2
	→ = rotateY + PI/2
	  = toggle pause
	. = toggle record

*/
let cols = 10;
let rows = 20;
let scaleSize = 15;
let sceneZoom = 1;
let sceneRotationY = 0;
let targetRotationY = 0;
let values = [];
let t = 0;
let font;
let recorder;
let chunks = [];
let recording = false;

function preload() {
	font = loadFont('assets/speech-to-text-webfont.ttf');
}

function setup() {
  	createCanvas(1600, 900, WEBGL);
  	pixelDensity(2);
	frameRate(60);
	colorMode(HSB, 360, 100, 100); // H: 0-360, S: 0-100, B: 0-100
	ortho(); 
	textFont(font);
	textSize(2);
	for (let x = 0; x < cols; x++) {
    	values[x] = [];
    	for (let z = 0; z < rows; z++) {
      		values[x][z] = 0;
    	}
  	}
}

function draw() {
    background(0);
    orbitControl(); // allow mouse rotation
    stroke(255);
	strokeWeight(2);
	// smooth();
    sceneRotationY += (targetRotationY - sceneRotationY) * 0.08;
    rotateY(sceneRotationY);
    scale(sceneZoom);
    let driftX = noise(t) * 100;            // v3
    let driftZ = noise(t + 1000) * 100;     // v3
    for (let x = 0; x < cols; x++) {
        fill(random(360), 100, 100);   // if using fill for shapes
        stroke(random(360), 100, 100); // fully saturated, bright
        for (let z = 0; z < rows; z++) {
            values[x][z] = map(noise(x*0.2 + driftX, z*0.2 + driftZ), 0, 1, -60, 60);   // v3
            push();
            translate((x - cols/2) * scaleSize, -values[x][z], (z - rows/2) * scaleSize);
            point(0, 0, 0);
            text(values[x][z], 0, 0, 0);
            pop();
            // connect points with a line along the row
            if (z > 0) {
                let x0 = (x - cols/2) * scaleSize;
                let y0 = -values[x][z-1];
                let z0 = (z-1 - rows/2) * scaleSize;
                let x1 = (x - cols/2) * scaleSize;
                let y1 = -values[x][z];
                let z1 = (z - rows/2) * scaleSize;
                line(x0, y0, z0, x1, y1, z1);
            }
        }        
    }
    t += 0.00015;        // v3
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
    if (key === '.') {
        if (recording) {
            stopRecording();
            recording = false;
        } else {
            startRecording();
            recording = true;
        }
    }
    if (keyCode === RIGHT_ARROW) {
        targetRotationY += 0.5 * PI;
    }
    if (keyCode === LEFT_ARROW) {
        targetRotationY -= 0.5 * PI;
    }
    if (key === 'z') {
        let drawingWidth = (cols - 1) * scaleSize * 1.25;
        sceneZoom = width / drawingWidth;
    }
    if (key === ' ') {
        if (isLooping()) {
            noLoop();
        } else {        
            loop();
        }
    }
}
