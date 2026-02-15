let cols = 10;
let rows = 20;
// let scaleSize = 35;
let scaleSize = 10;
let values = [];
let t = 0;
let font;

function preload() {
  font = loadFont('assets/speech-to-text-webfont.ttf');
}

function setup() {
  createCanvas(1600, 900, WEBGL);
  colorMode(HSB, 360, 100, 100); // H: 0-360, S: 0-100, B: 0-100
  ortho(); // removes perspective
  // scale(2);
  textFont(font);
  textSize(2);
  for (let x = 0; x < cols; x++) {
    values[x] = [];
    for (let z = 0; z < rows; z++) {
      values[x][z] = 0;
    }
  }
  // noCursor(); // still shows up in screen recording
}

function draw() {
  background(0);
  orbitControl(); // allow mouse rotation
  stroke(255);
  strokeWeight(2);

  for (let x = 0; x < cols; x++) {
    fill(random(360), 100, 100);   // if using fill for shapes
    stroke(random(360), 100, 100); // fully saturated, bright
    for (let z = 0; z < rows; z++) {
      // Smoothly changing Y-value using noise
      values[x][z] = map(noise(x*0.2, z*0.2, t), 0, 1, -60, 60);

      push();
      translate((x - cols/2) * scaleSize, -values[x][z], (z - rows/2) * scaleSize);
      // point(0, 0, 0);
      text(values[x][z], 0, 0, 0);
      pop();

      // Connect points with a line along the row
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
  t += 0.01; // time for noise
}
