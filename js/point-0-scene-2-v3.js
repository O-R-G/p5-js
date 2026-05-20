/*
    todo : zoom and translate keeping all in frame
    see scene 1, fov, textwidth, etc
*/

let font;
let points = [];            
let points_max = 800;
let running = true;        
let fov = 1.0472; 
let near = 0.01;
let far = 1e6;
let zoom_offset = 0; 
let zoom_t = 0;
let scene = 0;
let scene_t = 0;

function preload() {      
    // explicit load required for webgl to display text
    // cannot use system font, cannot use local p5.min.js
    font = loadFont('assets/speech-to-text-webfont.ttf');
}

function setup() {
    createCanvas(1600, 900, WEBGL);
    textFont(font);
    textAlign(CENTER, CENTER);
    textSize(196);
    points = populate_dense(points, points_max);
    perspective(fov, width/height, near, far);
}

function draw() {

    /*    
        scenes

        0 → draw 0 and 1
        1 → draw points[]
        2 → draw cut 
        3 → zoom
    */

    if (!running) {
    	background(50);
        debugMode();
        orbitControl();
    } else {
	    background(0);
    }
        
    perspective(fov, width/height, near, far);
    push();

    /*
        0 → draw 0 and 1
    */

    if (scene >= 0) {
      	fill(255,0,0); 
    	text(0,-width/2 * 0.75,0);
	    text(1,width/2 * 0.75,0);
    }

    /*
        1 → draw points[]
    */

    if (scene >= 1) {
        scene_t += 0.01;
	    for (let i = points.length - 1; i >= 0; i--) {
	        push();
			fill(0, 255, 0, 100);
	        noStroke();
	        let s = pow(0.5, points[i].layer);
	        textSize(196 * 2 * s);
	        translate(points[i].x, points[i].y, points[i].z);
	        if (![0, 0.5, 1].includes(points[i].val) || scene === 0) {
                let layer = min(points[i].val, 1 - points[i].val);	
                let fade_delay = layer * 4.0;
                let fade_duration = 0.35;
                let a = constrain((scene_t - fade_delay) / fade_duration, 0, 1);
                a = ease(a);
                fill(0, 255, 0, 255 * a);
	            text(noSci(points[i].val, 64), 0, 0);
	        }
	        pop();
	    }
        console.log(fov);
    }

    /*
        2 → draw cut 
    */

    if (scene >= 2) {
        push();
        resetMatrix();
        stroke(255, 0, 0);
        strokeWeight(2);
        let lineT = constrain(scene_t, 0, 1);
        let yTop = lerp(0, -height / 2 + 100 * 10, lineT);
        let yBottom = lerp(0, height / 2 - 100 * 10, lineT);
        line(0, yTop, 0, yBottom);
        pop();
    }

    /*
        3 → zoom
    */

	if (scene === 3 && running) {
		zoom_t += 0.001;
		let t = min(zoom_t, 1);
		let z = lerp(zoom_offset, zoom_offset - 500000, t);
		fov = lerp(radians(120), radians(20), t);
        perspective(fov, width/height, near, far);
		camera(
		    0, 0, z,
		    0, 0, z - 1000,
		    0, 1, 0
		);
	}

    pop();
}

function populate_dense(_points, _points_max) {

    /*        
        recursively populate points[] in 'layers'

        [0] → 0, 1
        [1] → 0.5
        [2] → 0.25, 0.75
        [3] → 0.125, 0.375, 0.625, 0.875
        ...
    */

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

function ease(_t) {
  return _t * _t * (3 - 2 * _t); // smoothstep
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
        zoom_t = 0;
    }
    if (key === '1') {
        scene = 1;
        scene_t = 0;
    }
    if (key === '2') {
        scene = 2;
        scene_t = 0;
    }
    if (key === '3') {
        scene = 3;
        zoom_t = 0;
    }
}
