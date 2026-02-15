let font;
let points = [];
let spacing = 20;
let textString = "HELLO";

function preload() {
  // You can replace this with your TTF later
  font = loadFont('assets/speech-to-text-webfont.ttf'); 
}

function setup() {
  createCanvas(900, 700, WEBGL);
  textFont(font);
  textSize(200);
  fill(255);
  noStroke();
  
  // Generate points for each letter
  let bounds = font.textBounds(textString, 0, 0, 200);
  for (let x = 0; x < bounds.w; x += spacing) {
    for (let y = 0; y < bounds.h; y += spacing) {
      let test = font.textToPoints(textString, 0, bounds.h, 200, {
        sampleFactor: 0.2, simplifyThreshold: 0
      });
      for (let p of test) {
        points.push({x: p.x - bounds.w/2, y: p.y - bounds.h/2, z: random(-50,50)});
      }
      break; // we only need one set of points
    }
    break;
  }
}

function draw() {
  background(0);
  orbitControl(); // allow mouse rotation
  rotateY(frameCount * 0.003);

  fill(255);
  for (let p of points) {
    push();
    translate(p.x, p.y, p.z + sin(frameCount*0.05 + p.x*0.01 + p.y*0.01)*10);
    sphere(2);
    pop();
  }
}
