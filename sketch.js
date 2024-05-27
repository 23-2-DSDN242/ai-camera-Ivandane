// Declare image variables
let sourceImg = null;
let maskImg = null;
let renderCounter = 0;

// Declare file variables
let sourceFile = "input_1.jpg";
let maskFile   = "mask_1.png";
let outputFile = "output_1.png";

// PRELOAD FUNCTION
function preload() {
  sourceImg = loadImage(sourceFile);
  maskImg = loadImage(maskFile);
}

// SETUP FUNCTION
function setup() {
  // Create canvas
  let main_canvas = createCanvas(1920, 1080);
  main_canvas.parent('canvasContainer');

  // Set styles
  background(255, 0, 0);
  imageMode(CENTER);
  noStroke();
  
  // Load pixels
  sourceImg.loadPixels();
  maskImg.loadPixels();
}

// DRAW FUNCTION
function draw () {
  // Repeat 4000 times
  for (let i = 0;i < 4000; i++) {
    let x = floor(random(sourceImg.width));
    let y = floor(random(sourceImg.height));
    let pix = sourceImg.get(x, y);
    let mask = maskImg.get(x, y);
    fill(pix);

    if (mask[0] > 128) {
      let pointSize = 10;
      ellipse(x, y, pointSize, pointSize);
    } else {
      let pointSize = 20;
      rect(x, y, pointSize, pointSize);    
    }
  }

  renderCounter = renderCounter + 1;
  if (renderCounter > 10) {
    console.log("Done!")
    noLoop();
    // uncomment this to save the result
    // saveArtworkImage(outputFile);
  }
}

// KEY TYPED FUNCTION
function keyTyped() {
  if (key == '!') {
    saveBlocksImages();
  }
}
