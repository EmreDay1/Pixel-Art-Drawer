let handpose;
let detections = [];
let canvas;
let video;
let eraseButton;
let drawButton;
let eraseMode = false;

function setup() {
  canvas = createCanvas(640, 480); // 3D mode!!!
  canvas.id("canvas");

  video = createCapture(VIDEO);
  video.id("video");
  video.size(width, height);
  video.hide(); // Hide the default video element

  const options = {
    flipHorizontal: false,
    maxContinuousChecks: Infinity,
    detectionConfidence: 0.8,
    scoreThreshold: 0.75,
    iouThreshold: 0.3,
  };

  handpose = ml5.handpose(video, options, modelReady);
  colorMode(HSB);

  eraseButton = createButton('Erase');
  eraseButton.position(10, height + 10);
  eraseButton.mousePressed(setEraseMode);

  drawButton = createButton('Draw');
  drawButton.position(80, height + 10);
  drawButton.mousePressed(setDrawMode);
}


function modelReady() {
  console.log("Model ready!");
  handpose.on('predict', results => {
    detections = results;
  });

  select('#status').html('Model Loaded');
}

const GRID_SIZE = 64;
let filledSquares = [];

function draw() {
  clear();
  
  // Flip the canvas horizontally
  translate(width, 0);
  scale(-1, 1);

  drawGrid();

  if (detections.length > 0) {
    let indexFingerIsUp = isFingerUp(8);

    if (eraseMode) {
      if (indexFingerIsUp) {
        eraseSquare(8); // Erase using the tip of the index finger
      }
    } else {
      if (indexFingerIsUp) {
        drawSquare(8); // Draw using the tip of the index finger
      }
    }

    drawHandPose();
  }
}


function setEraseMode() {
  eraseMode = true;
}

function setDrawMode() {
  eraseMode = false;
}

function drawGrid() {
  stroke(200); 
  strokeWeight(1); 

  for (let x = 0; x <= width; x += width / GRID_SIZE) {
    line(x, 0, x, height);
  }

  for (let y = 0; y <= height; y += height / GRID_SIZE) {
    line(0, y, width, y);
  }

  fill(255);
  noStroke();
  for (let square of filledSquares) {
    rect(square[0], square[1], width / GRID_SIZE, height / GRID_SIZE);
  }
}

function drawHandPose() {
  drawLines([0, 5, 9, 13, 17, 0]); 
  drawLines([0, 1, 2, 3, 4]); 
  drawLines([5, 6, 7, 8]); 
  drawLines([9, 10, 11, 12]); 
  drawLines([13, 14, 15, 16]); 
  drawLines([17, 18, 19, 20]); 

  drawLandmarks([0, 1], 0); 
  drawLandmarks([1, 5], 60); 
  drawLandmarks([5, 9], 120); 
  drawLandmarks([9, 13], 180); 
  drawLandmarks([13, 17], 240); 
  drawLandmarks([17, 21], 300); 
}

function eraseSquare(fingerIndex) {
  let x = detections[0].landmarks[fingerIndex][0];
  let y = detections[0].landmarks[fingerIndex][1];

  let squareWidth = width / GRID_SIZE;
  let squareHeight = height / GRID_SIZE;

  let gridX = Math.floor(x / squareWidth);
  let gridY = Math.floor(y / squareHeight);

  filledSquares = filledSquares.filter(square => !(square[0] === gridX * squareWidth && square[1] === gridY * squareHeight));
}

function drawSquare(fingerIndex) {
  let x = detections[0].landmarks[fingerIndex][0];
  let y = detections[0].landmarks[fingerIndex][1];

  let squareWidth = width / GRID_SIZE;
  let squareHeight = height / GRID_SIZE;

  let gridX = Math.floor(x / squareWidth);
  let gridY = Math.floor(y / squareHeight);

  fill(255);
  rect(gridX * squareWidth, gridY * squareHeight, squareWidth, squareHeight);

  let squareExists = filledSquares.some(square => square[0] === gridX * squareWidth && square[1] === gridY * squareHeight);
  if (!squareExists) {
    filledSquares.push([gridX * squareWidth, gridY * squareHeight]);
  }
}

function isFingerUp(fingerIndex) {
  let threshold = 40;

  if (detections.length > 0) {
    let yTip = detections[0].landmarks[fingerIndex][1];
    let yBase = detections[0].landmarks[fingerIndex - 4][1];
    let distance = yBase - yTip;
    return distance > threshold;
  } else {
    return false;
  }
}

function drawLandmarks(indexArray, hue) {
  noFill();
  strokeWeight(10);
  for (let i = 0; i < detections.length; i++) {
    for (let j = indexArray[0]; j < indexArray[1]; j++) {
      let x = detections[i].landmarks[j][0];
      let y = detections[i].landmarks[j][1];
      let z = detections[i].landmarks[j][2];
      stroke(hue, 40, 255);
      point(x, y);
    }
  }
}

function drawLines(index) {
  stroke(0, 0, 255);
  strokeWeight(3);
  for (let i = 0; i < detections.length; i++) {
    for (let j = 0; j < index.length - 1; j++) {
      let x = detections[i].landmarks[index[j]][0];
      let y = detections[i].landmarks[index[j]][1];
      let z = detections[i].landmarks[index[j]][2];

      let _x = detections[i].landmarks[index[j + 1]][0];
      let _y = detections[i].landmarks[index[j + 1]][1];
      let _z = detections[i].landmarks[index[j + 1]][2];
      line(x, y, _x, _y);
    }
  }
}
