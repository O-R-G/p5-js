/*
    todo : zoom and translate keeping all in frame
    see scene 1, fov, textwidth, etc
*/

let fov;
let font;
let t = 0;                  // time 
let n = 0;                  // current loop 
let points = [];            // to draw
let points_max = 800;
let running = true;        
let camZ;
let camOffset = 1500; // distance in front of current point
let camTarget = { x: 0, y: 0, z: 0 };
let targetIndex = 0;
let travelT = 0;
let travelSpeed = 0.00005; 	// [0.05]
let scene = 0;
let sceneT = 0;

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
    points = populate_dense(points, points_max);
    points_max = points.length;
    // default perspective camera 
    // fov = PI / 3;       // default fov
    // fov = PI / 4;       
    fov = PI / 6;       
    let near = 0.01;
    let far = 1e6;
    perspective(fov, width/height, near, far);
    camZ = points[0].z + camOffset;
}

/*        
    recursively populate points[] in 'layers'

    [0] → 0, 1
    [1] → 0.5
    [2] → 0.25, 0.75
    [3] → 0.125, 0.375, 0.625, 0.875
    ...
*/
function populate_dense(_points, _points_max) {
    let ordered = [0, 1];
    let currentLayer = [[0, 1]];
    while (ordered.length < _points_max) {
        let nextLayer = [];
        for (let i = 0; i < currentLayer.length; i++) {
            let a = currentLayer[i][0];
            let b = currentLayer[i][1];
            let mid = (a + b) / 2;
            ordered.push(mid);
            nextLayer.push([a, mid]);
            nextLayer.push([mid, b]);
        }
        currentLayer = nextLayer;
    }
    ordered = ordered.slice(0, _points_max);
    _points = [];       // convert to points
    let layer = 0;
    let countInLayer = 2;
    let usedInLayer = 0;
    for (let i = 0; i < ordered.length; i++) {
        let v = ordered[i];
        _points.push({
            val: v,
            layer: layer,
            x: map(v, 0, 1, -width / 2, width / 2),
            y: 0,
            // z: -500 * (pow(1.25, layer) - 1)
            z: layer * -100
        });
        usedInLayer++;
        if (usedInLayer >= countInLayer) {
            layer++;
            usedInLayer = 0;
            countInLayer = pow(2, layer - 1);
        }
    }
    return _points;
}

/*    
    scenes

    0 → draw 0 and 1
    1 → draw points[]
    2 → draw cut 
    3 → zoom
*/

function draw() {
    t += 0.01; 
    n = floor(t);
    if (!running) {
    	background(50);
        debugMode();
        orbitControl();
    } else {
        // animate fov (lens zoom)
        fov = map(sin(frameCount * 0.01), -1, 1,
              radians(3),
              radians(120));
        perspective(fov, width / height, 0.1, 10000);
        background(0);
    }
    push();

    // 0 → draw 0 and 1

  	fill(255,0,0); 
	text(0,-width/2 * 0.75,0);
	text(1,width/2 * 0.75,0);

    // 1 → draw points[]

    for (let i = points.length - 1; i >= 0; i--) {   
        // reverse order to fix 3d transparency
        let isZeroOrOne = points[i].val === 0 || points[i].val === 1;
        if (scene === 0 && !isZeroOrOne) continue;
        let s = pow(0.5, points[i].layer);
        textSize(196 * 2 * s);
        push();
        translate(points[i].x, points[i].y, points[i].z);
        if (scene === 0)
            fill(255, 0, 0, 255);
        else
            fill(0, 255, 0, 100);
        noStroke();
        if (![0, 0.5, 1].includes(points[i].val) || scene === 0)
            text(noSci(points[i].val, 64), 0, 0);
        pop();
    }

    // 2 → draw cut 

    if (scene >= 2) {
        push();
        resetMatrix();
        sceneT += 0.01;
        let lineT = constrain(sceneT, 0, 1);
        let yTop = lerp(0, -height / 2 + 100, lineT);
        let yBottom = lerp(0, height / 2 - 100, lineT);
        stroke(255, 0, 0);
        strokeWeight(2);
        line(0, yTop, 0, yBottom);
        pop();
    }

    // 3 → zoom

    if (running) {
        if (scene === 3) {
            travelT += 0.02;
            let z = camOffset - travelT * 1000;
            camera(0,0,0);      // debug
            /*
            camera(
                0, 0, z,
                0, 0, z - 1000,
                0, 1, 0
            );
            */
        } else {
            camera(
                0, 0, camOffset,
                0, 0, 0,
                0, 1, 0
            );
        }
    }

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
    if (key === '0') {
        scene = 0;
        travelT = 0;
    }
    if (key === '1') {
        scene = 1;
        sceneT = 0;
    }
    if (key === '2') {
        scene = 2;
        sceneT = 0;
    }
    if (key === '3') {
        scene = 3;
        travelT = 0;
    }
}

