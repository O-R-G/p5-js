/*
    todo : zoom and translate keeping all in frame
    see scene 1, fov, textwidth, etc
*/

let fov;
let font;
let t = 0;                  // time 
let n = 0;                  // current loop 
let points = [];            // to draw
let points_max = 100;       // max to draw
let running = true;        // starts paused
let reverse = false;        // reverse 

let camZ;
// let camOffset = 1000; // distance in front of current point
let camOffset = 2500; // distance in front of current point
let camTarget = { x: 0, y: 0, z: 0 };
let targetIndex = 0;
let travelT = 0;
// let travelSpeed = 0.0125; 	// [0.05]
// let travelSpeed = 0.5; 	// [0.05]
let travelSpeed = 0.25; 	// [0.05]

function preload() {
  /*
      explicit load required for webgl to display text
      cannot use system font, cannot use local p5.min.js
  */
  font = loadFont('assets/speech-to-text-webfont.ttf');
}

function setup() {
    // createCanvas(800, 450, WEBGL);
    createCanvas(1600, 900, WEBGL);
    textFont(font);
    textAlign(LEFT, CENTER);
    textSize(196);
    points = populate(points, points_max);
    fov = PI / 3; // default perspective fov
    let near = 0.01;
    let far = 1e6;
    perspective(fov, width/height, near, far);
    camZ = points[0].z + camOffset;
}

function populate(_points,_points_max) {
    let _val = 1;
    let _x = width;
    for (let i = 0; i < _points_max; i++) {
        _points.push({
            val: _val,
            // x: _x,
            x: _x * 0.5,		// condense x
            y: 0,
            // z: i * -500
            z: i * -100
            // z: -1/_val * 0.1
        });
        _x/=2;
        _val/=2;
    }
    console.log("** points[] populated **");
    console.log(points);
    return _points;
}

function draw() {
    background(0);
    t += 0.01; 
    n = floor(t);
    if (!running) {
    	background(100);
        orbitControl();
        debugMode();
    }

    push();

	// 1. move camera from current point to next point

    if (running) {
    	if (!points[targetIndex])
			targetIndex--;
        let a = (points[targetIndex]);
        let b = points[min(targetIndex + 1, points.length - 1)];
        travelT += travelSpeed;
        let e = ease(travelT);
        camZ = lerp(a.z + camOffset, b.z + camOffset, e);
        if (travelT >= 1) {
            travelT = 0;
            targetIndex++;
        }
        camera(
            0, 0, camZ,
            b.x, b.y, b.z,
            0, 1, 0
        );
    } 

	// translate(-width/4, 0, 0); 	// shift scene left
	// translate(-width/8, 0, 0); 	// shift scene left
	translate(1/t * -200, 0, 0); 	// sweep scene left
	// translate(1/t * -500, 0, 0); 	// sweep scene left
    // rotateX(PI/32);

	// 2. draw points[] in 3d from end of array to fix transparency
    for (let i = points.length - 1; i >= 0; i--) {
        push();
        translate(points[i].x, points[i].y, points[i].z);
        fill(0,255,0,100); 
        noStroke();
        text(noSci(points[i].val, 64), 0, 0);
        pop();
    }
        
    // draw 0 and 1
	fill(255,0,0); 
	text(0,0,0);
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
