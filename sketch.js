// Declare image variables
let sourceImg;
let maskImg;

// Declare image files
let sourceFile = "input_1.jpg";
let maskFile = "mask_1.png";
let outputFile = "output_1.png";

// Declare image width and height
let imgWidth = 1920;
let imgHeight = 1080;

// Declare pixel variables
let renderCounter = 0;
let maskWaveAmp = 10;
let waveOffset = 10;

// Declare sound waves array
let soundWaves = [];

// PRELOAD FUNCTION
function preload() {
  // Load image and mask
  sourceImg = loadImage(sourceFile);
  maskImg = loadImage(maskFile);
}

// SETUP FUNCTION
function setup() {
  // Declare canvas size
  let main_canvas = createCanvas(imgWidth, imgHeight);
  main_canvas.parent('canvasContainer');

  // Set styles
  imageMode(CENTER);
  angleMode(DEGREES);
  colorMode(HSB, 360, 100, 100, 100);
  background(0); // Black
  
  // Load pixels
  sourceImg.loadPixels();
  maskImg.loadPixels();

  // Run function
  findMask();
}

// DRAW FUNCTION
function draw() {
  // Repeat for image height
  for (let y = renderCounter; y < renderCounter + 1 && y < imgHeight; y++) {
    // Repeat for image width
    for (let x = 0; x < 1920; x++) {
      // Get image pixels
      let pixel = sourceImg.get(x, y);

      // Get mask pixels
      let mask = maskImg.get(x, y);

      // Declare new variables
      let dx, dy, newPixel;

      // If mask pixel is black
      if (mask[1] < 128) {
        // Set new X and Y values
        dx = x;
        dy = y;

        // Convert pixel color to HSB
        let h = hue(pixel);
        let s = saturation(pixel);
        let b = brightness(pixel);

        // Set new pixel value
        newPixel = color(h, s * 0.8, b / 2);
      }

      // If mask pixel is white
      else {
        // Declare wave variables
        let wave = sin(y * maskWaveAmp);
        let slip = map(wave, -1, 1, -waveOffset, waveOffset);

        // Set new X and Y values
        dx = x + slip;
        dy = y;

        // Convert pixel color to HSB
        let h = 0;
        let s = saturation(pixel);
        let b = brightness(pixel);

        // Set new pixel value
        newPixel = color(h, s, b * 0.8);
      }

      // Set new pixels
      set(dx, dy, newPixel);
    }
  }

  // Update pixels
  updatePixels();

  // Draw sound waves
  soundWave(soundWaves);

  // Increment render counter
  renderCounter++;

  // If image render has finished
  if (renderCounter > imgHeight) {
    console.log("Done!");

    // Turn off loop
    noLoop();

    // Save result
    // saveArtworkImage(outputFile);
  }
}

// FIND MASK FUNCTION
function findMask() {
  // Create scanned image
  let scanned = createImage(imgWidth, imgHeight);

  // Load pixels
  scanned.loadPixels();

  // Repeat for image height
  for (let y = 0; y < imgHeight; y++) {
    // Repeat for image width
    for (let x = 0; x < imgWidth; x++) {
      // Get mask pixels
      let maskPixel = maskImg.get(x, y);

      // If mask pixel is white, and has not been scanned (i.e its red value != 255)
      if (maskPixel[0] > 128 && !isScanned(x, y, scanned)) {
        // Get bounding coordinates of mask
        let sw = getBounds(x, y, scanned);

        // Append sound waves array
        soundWaves.push(sw);

        // Mark pixel as scanned (i.e its red value = 255)
        markScanned(sw, scanned);
      }
    }
  }

  // Update pixels
  scanned.updatePixels();
}

// IS SCANNED FUNCTION
// Adapted from suggestion by ChatGPT
function isScanned(x, y, scanned) {
  // Declare index for the red value of the pixel
  let index = (x + y * imgWidth) * 4;

  // Return red value as 255
  return scanned.pixels[index] === 255;
}

// GET BOUNDS FUNCTION
function getBounds(x, y, scanned) {
  // Declare bounding variables
  let minX = x;
  let maxX = x;
  let minY = y;
  let maxY = y;

  // Declare queue array to scan each pixel
  let queue = [[x, y]];

  // Repeat until all pixels have been scanned
  while (queue.length > 0) {
    // Remove the first pixel from the queue array
    let [dx, dy] = queue.shift();

    // Repeat for horizontal neighboring pixels
    for (let nx = dx - 1; nx <= dx + 1; nx++) {
      // Repeat for vertical neighboring pixels
      for (let ny = dy - 1; ny <= dy + 1; ny++) {
        // If the neighboring pixel is within the image bounds
        if (nx >= 0 && ny >= 0 && nx < imgWidth && ny < imgHeight) {
          // Get mask pixels
          let neighborPixel = maskImg.get(nx, ny);

          // Declare index for the red value of the pixel
          let nIndex = (nx + ny * imgWidth) * 4;

          // If mask pixel is white, and has not been scanned (i.e its red value != 255)
          if (neighborPixel[0] > 128 && !isScanned(nx, ny, scanned)) {
            // Append pixel into queue array
            queue.push([nx, ny]);

            // Set scanned pixel's red value to 255 (i.e has been scanned)
            scanned.pixels[nIndex] = 255;

            // Update bounding variables
            minX = min(minX, nx);
            maxX = max(maxX, nx);
            minY = min(minY, ny);
            maxY = max(maxY, ny);
          }
        }
      }
    }
  }

  // Return bounds as an object
  return {minX, minY, maxX, maxY};
}

// MARK SCANNED FUNCTION
function markScanned(sw, scanned) {
  // Repeat for height of bounds
  for (let y = sw.minY; y <= sw.maxY; y++) {
    // Repeat for width of bounds
    for (let x = sw.minX; x <= sw.maxX; x++) {
      // Declare index for the red value of the pixel
      let index = (x + y * imgWidth) * 4;

      // Set pixel's red value to 255 (i.e has been scanned)
      scanned.pixels[index] = 255;
    }
  }
}

// SOUND WAVE FUNCTION
function soundWave(soundWaves) {
  // Repeat for each sound wave in the array
  for (let sw of soundWaves) {
    // Set new 0, 0 coordinate
    push();
    translate(sw.minX + ((sw.maxX - sw.minX) / 2), sw.minY + ((sw.maxY - sw.minY) / 2));

    // Repeat 5 times
    for (let i = 0; i < 5; i++) {
      // Declare sound wave variables
      let swWidth = (sw.maxX - sw.minX) / 2;
      let swHeight = (sw.maxY - sw.minY) / 2;
      let offsetX = swWidth / 10;
      let offsetY = swHeight / 10;
      let size = map(i, 0, 5, 1, 1.75);
      let colorHue = map(i, 0, 5, 0, 50);
      let alpha = map(i, 0, 5, 50, 10);
      let randRotate = random(360);

      // Set styles
      push();
      scale(size);
      rotate(randRotate);
      strokeWeight(1);
      stroke(colorHue, 100, 100, alpha);
      noFill();

      // Draw sound wave
      beginShape();
      for (let i = 0; i < 360; i++) {
        // Declare vertex positions
        let dx = (swWidth * cos(i * 10) + offsetX) * cos(i);
        let dy = (swHeight * cos(i * 10) + offsetY) * sin(i);

        // Create vertex
        vertex(dx, dy);
      }
      endShape();
      pop();
    }
    pop();
  }
}

// KEY TYPED FUNCTION
function keyTyped() {
  if (key == '!') {
    saveBlocksImages();
  }
}