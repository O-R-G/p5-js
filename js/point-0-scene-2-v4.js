/*
    todo : zoom and translate keeping all in frame
    see scene 1, fov, textwidth, etc
*/

let fov;
let font;
let t = 0;                  // time 
let n = 0;                  // current loop 
let running = true;        
let reverse = false;        // reverse 
let points_max = 1024;
let camZ;
let camOffset = 1500; // distance in front of current point
let camTarget = { x: 0, y: 0, z: 0 };
let targetIndex = 0;
let travelT = 0;
let travelSpeed = 0.00005; 	// [0.05]

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
    textAlign(CENTER, CENTER);
    textSize(196);
    fov = PI / 3;       
    let near = 0.01;
    let far = 1e6;
    perspective(fov, width/height, near, far);
    /*
    // orthographic camera
    ortho(
        -width / 2, width / 2,
        -height / 2, height / 2,
        -1e6, 1e6
    );
    */
    camZ = camOffset;
}

function draw() {
    background(0);
    t += 0.01; 
    n = floor(t);
    if (!running) {
    	background(0);
        debugMode();
        orbitControl();
    }
    push();

	// move camera from current point to next point
    let z = camOffset;
    if (running) {
        // travelT += 0.05;
        // z = camOffset + travelT * -100;
        travelT += 0.05;
        let zz = pow(travelT, 2);
        z = camOffset + zz * -100;
        camera(
            0, 0, z,
            0, 0, z - 1000,
            0, 1, 0
        );
    }

    /*        
        recursively populate points in 'layers'
        on the fly as needed 

        [0] → 0, 1
        [1] → 0.5
        [2] → 0.25, 0.75
        [3] → 0.125, 0.375, 0.625, 0.875
        ...
    */
    let visibleBehind = 4;
    let visibleAhead = 2;
    let currentLayer = floor(abs(z - camOffset) / 100);
    let maxLayer = 16;

    for (let layer = max(0, currentLayer - visibleBehind);
        layer <= min(maxLayer, currentLayer + visibleAhead);
        layer++) {
        
        let count = (layer === 0) ? 2 : pow(2, layer - 1);
        let maxDrawPerLayer = 256;
        let step = max(1, floor(count / maxDrawPerLayer));
        for (let k = 0; k < count; k += step) {
            let v;
            if (layer === 0) {
                v = k; // 0, 1
            } else {
                v = (2 * k + 1) / pow(2, layer);
            }
            let s = pow(0.5, layer);
            textSize(196 * s);
            push();
            translate(
                map(v, 0, 1, -width / 2, width / 2),
                0,
                layer * -100
            );
            fill(0, 255, 0, 100);
            noStroke();
            text(noSci(v, 64), 0, 0);
            pop();
        }
        
    }
    
    // draw 0 and 1
  	fill(255,0,0); 
	text(0,-width/2,0);
	text(1,width/2,0);
    pop();
}

function ease(_t) {
  // return _t * _t * (3 - 2 * _t); // smoothstep
  return pow(_t,0.125);           // quartic
}

function noSci(n, digits) {
    let absN = Math.abs(n);
    // Threshold for "tiny" numbers
    let threshold = Math.pow(10, -digits);
    if (absN > 0 && absN < threshold) {
        // tiny number: keep all zeros
        return n.toFixed(digits);
    } else {
        // normal number: strip trailing zeros
        return n.toFixed(digits).replace(/\.?0+$/, '');
    }
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
