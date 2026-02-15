let cols = 12;
let rows = 12;
let scaleSize = 35;
let values = [];
let t = 0;

function setup() {
  createCanvas(900, 700, WEBGL);

  for (let x = 0; x < cols; x++) {
    values[x] = [];
    for (let z = 0; z < rows; z++) {
      values[x][z] = 0;
    }
  }
}

function draw() {
  background(0);

  // Rotate the whole grid slowly
  rotateY(frameCount * 0.002);
  rotateX(-PI/6);

  stroke(255);
  strokeWeight(5);

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