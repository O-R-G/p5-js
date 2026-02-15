/*

    todo : zoom and translate keeping all in frame
    see scene 1, fov, textwidth, etc

*/

let fov;
let font;
let t = 0;                  // time 
let n = 0;                  // current loop 
let points = [];            // to draw
let points_max = 20;       // max to draw
let running = false;        // starts paused
let reverse = false;        // reverse 

let zoomStart = 1000;
let zoomEnd = 1;
let zoomT = 0;

function preload() {
  /*
      explicit load required for webgl to display text
      cannot use system font, cannot use local p5.min.js
  */
  font = loadFont('assets/speech-to-text-webfont.ttf');
}

function setup() {
    createCanvas(800, 450, WEBGL);
    textFont(font);
    textAlign(CENTER, CENTER);
    // textSize(96);
    textSize(48);
    points = populate(points, points_max);
    fov = PI / 3; // default perspective fov
    // let near = 0.1;
    let near = 1;
    let far = 10000; // very far
    perspective(fov, width/height, near, far);
    // ortho();
    // ortho(-10, 10, -10, 10, 300, 1000);

}

function populate(_points,_points_max) {
    let index = 0;
    points[index] = 1;
    while (_points.length <= _points_max + 1) {
        _points.push(_points[index] / 2);
        index++;
    }
    return _points;
}

function draw() {
    background(100);
    orbitControl();
    t += 0.1; 
    n = floor(t);

    /*
        use t to adjust scale() z or camera() z
        draw from end of array to fix transparency
        only works when next number is drawn on top of previous
        in stacking z order
        a. adjust camera view (dont scale coord system)
        b. or use scale() with measured text width from scene 1
    */

    push();
    if (running) {
        // scale(1,1,1/t);
        zoomT = min(zoomT + 0.01, 1);
        let e = ease(zoomT);
        let camZ = lerp(zoomStart, zoomEnd, e);
        camera(0, 0, camZ,  // camera position
            0, 0, 0,     // look-at
            0, 1, 0);    // up vector
        console.log(camZ);
    }

    for (let i = points.length - 1; i >= 0; i--) {
    // for (let i = 0; i < points.length; i++) {
        let val = points[i];
        let x = val * width;
        let y = 0;
        // let z = val === 0 ? 10000 : 100 / val; 
        let z = val === 0 ? 10000 : 100 * i; 
        push();
        translate(x, y, -z);
        fill(0,255,0,100); 
        noStroke();
        text(noSci(val, 12), 0, 0);
        pop();
    }
    pop();
    // console.log(t);
    debugMode();
}

function ease(_t) {
    // requires a changing value
    // pow(_t, n) = nth-degree easing
    let n = 2;
    _t = pow(_t,n);  
    return _t;
}

function noSci(n, digits = 4) {
  return Number(n).toFixed(digits).replace(/\.?0+$/, '');
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
