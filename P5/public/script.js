

let song;
let fft;
let imgs = [];
let selectedImgIndex = -1;
let audioInput;
let imageInput;
let isPlaying = false;

let slider;  // Slider to seek through song
let imageBoxDiv;  // New variable for image box div
let imageBoxButton;  // New variable for image box button

function preload() {
  // Images will be loaded dynamically from the server
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  imageMode(CENTER);
  rectMode(CENTER);

  initializeCapturer();

  fft = new p5.FFT(0.2);

  audioInput = createFileInput(handleAudioFile);
  audioInput.position(20, 20);
  audioInput.attribute('accept', 'audio/*');

  imageUploadInput = createFileInput(handleImageUpload);
  imageUploadInput.position(20, 80);
  imageUploadInput.attribute('accept', 'image/*');

  imageInput = createSelect();
  imageInput.position(20, 50);
  imageInput.option('Select an image');
  imageInput.changed(handleImageSelection);

  const playPauseButton = createButton('Play/Pause');
  playPauseButton.position(20, 110);
  playPauseButton.mousePressed(togglePlayPause);

  const exportButton = createButton('Export WebM');
  exportButton.position(20, 140);
  exportButton.mousePressed(handleCapture);

  slider = createSlider(0, 1, 0, 0.01);
  slider.position(20, 170);
  slider.input(seek);

  // Button to toggle image box
  imageBoxButton = createButton('Show Image Box');
  imageBoxButton.position(20, 200);
  imageBoxButton.mousePressed(toggleImageBox);

  // Create div to contain images and buttons
  imageBoxDiv = createDiv('');
  imageBoxDiv.position(300, 20);
  imageBoxDiv.hide();  // Hide the image box by default

  // Socket.io client code
  const socket = io.connect('http://localhost:3000');
  socket.on('imageFiles', function(data) {
    for (let i = 0; i < data.length; i++) {
      imgs.push(loadImage(`pictures/${data[i]}`));
      imageInput.option(`Image ${i + 1}`);
    }
  });

  noLoop();
}

function draw() {
  background(0, 50);

  if (selectedImgIndex >= 0 && imgs[selectedImgIndex]) {
    image(imgs[selectedImgIndex], width / 2, height / 2, width, height);
  }

  if (isCapturing) {
    let progress = map(capturedFrames, 0, maxFrames, 0, 200);
    fill(255);
    rect(width / 2, height / 2 - 10, progress, 20);
  }

  if (isPlaying) {
    noFill();
    stroke(255);
    translate(width / 2, height / 2);
    fft.analyze();
    let wave = fft.waveform();

    for (let t = -1; t <= 1; t += 2) {
      beginShape();
      for (let i = 0; i <= 180; i += 0.5) {
        let index = floor(map(i, 0, 180, 0, wave.length - 1));
        let r = map(wave[index], -1, 1, 150, 350);
        let x = r * sin(i) * t;
        let y = r * cos(i);
        vertex(x, y);
      }
      endShape();
    }
  }

  handleWebMExportInDraw();  // Call the function from webmExporter.js

  if (song && song.isLoaded() && isPlaying) {
    slider.value(song.currentTime() / song.duration());
  }
}


function seek() {
  if (song && song.isLoaded()) {
    song.jump(slider.value() * song.duration());
  }
}

function togglePlayPause() {
  if (song && song.isLoaded()) {
    if (song.isPlaying()) {
      song.pause();
    } else {
      song.play();
    }
    isPlaying = !isPlaying;
    if (isPlaying) {
      loop();
    } else {
      noLoop();
    }
  }
}

function handleAudioFile(file) {
  if (file.type === 'audio') {
    if (song) {
      song.stop();
    }
    song = loadSound(file.data, () => {
      togglePlayPause();
    });
  }
}

function handleImageSelection() {
  let selectedOption = imageInput.value();
  if (selectedOption.startsWith('Image ')) {
    selectedImgIndex = parseInt(selectedOption.split(' ')[1]) - 1;
    redraw();
  }
}


function uploadImage(file) {
  if (file.type.startsWith('image/')) {
    let formData = new FormData();
    formData.append('file', file.file);
    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      // Refresh the image list
      socket.emit('refreshImages');
    })
    .catch(error => {
      console.error('Error uploading file:', error);
    });
  }
}

function handleImageUpload(file) {
  console.log("File object type:", file.type);  // Debugging line

  // Check if the file.type contains "image"
  if (file.type === 'image' || file.type.startsWith('image/')) {
    console.log("Uploading an image file");  // Debugging line

    // Prepare FormData to send the file
    let formData = new FormData();
    formData.append('file', file.file);

    // Upload the file to the server
    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log("Successfully uploaded file");  // Debugging line
        // Refresh the image list from the server
        socket.emit('refreshImages');
        // Log to console before reloading
        console.log("Reloading page");
        // Reload the entire page to see the changes
        // Uncomment one of the following methods to refresh the page
        // location.reload();
        // window.location.href = window.location.href;
        window.location.assign(window.location.href);
      }
    })
    .catch(error => {
      console.error('Error uploading file:', error);  // Debugging line
    });
  } else {
    console.log("Uploaded file is not an image");  // Debugging line
  }
}




function handleImageSelection() {
  let selectedOption = imageInput.value();
  if (selectedOption.startsWith('Image ')) {
    selectedImgIndex = parseInt(selectedOption.split(' ')[1]) - 1;
    redraw();
  }
}


function deleteFile() {
  const deleteSelect = select('#deleteSelect');
  const fileName = deleteSelect.value();
  fetch('/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileName })
  })
  .then(response => response.json())
  .then(data => {
    // Refresh the image list
    socket.emit('refreshImages');
  })
  .catch(error => {
    console.error('Error deleting file:', error);
  });
}

// Particle class
class Particle {
  constructor() {
    this.pos = p5.Vector.random2D().mult(250);
    this.vel = createVector(0, 0);
    this.acc = this.pos.copy().mult(random(0.0001, 0.0001));
    this.w = random(3, 5);
    this.color = [random(200, 255), random(200, 255), random(200, 255)];
  }

  update(cond) {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    if (cond) {
      this.pos.add(this.vel);
      this.pos.add(this.vel);
      this.pos.add(this.vel);
    }
  }

  edges() {
    if (this.pos.x < -width / 2 || this.pos.x > width / 2 ||
        this.pos.y < -height / 2 || this.pos.y > height / 2) {
      return true;
    } else {
      return false;
    }
  }

  show() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.w);
  }
}


function displayImages(imageFiles) {
  const imageContainer = createDiv();
  imageContainer.position(300, 20);

  imageFiles.forEach((fileName, index) => {
    const imgElem = createImg(`pictures/${fileName}`);
    imgElem.size(100, 100);
    imgElem.parent(imageContainer);

    const delButton = createButton('Delete');
    delButton.parent(imageContainer);
    delButton.mousePressed(() => deleteImage(fileName));
  });
}

function deleteImage(fileName) {
  fetch('/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileName })
  })
  .then(response => response.json())
  .then(data => {
    // Refresh the image list
    socket.emit('refreshImages');
    // Reload the page to see changes
    window.location.reload(true);
  })
  .catch(error => {
    console.error('Error deleting file:', error);
  });
}


function toggleImageBox() {
  if (imageBoxDiv.style('display') === 'none') {
    displayImageBox();
  } else {
    hideImageBox();
  }
}

function hideImageBox() {
  imageBoxDiv.hide();
}

function displayImageBox() {
  imageBoxDiv.show();
  imageBoxDiv.html(''); // Clear existing elements

  fetch('/getImages')
    .then(response => response.json())
    .then(data => {
      data.forEach((image, index) => {
        let imgElement = createImg(`pictures/${image}`);
        imgElement.size(100, 100);
        imgElement.parent(imageBoxDiv);

        let deleteButton = createButton('Delete');
        deleteButton.parent(imageBoxDiv);
        deleteButton.mousePressed(() => {
          fetch('/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileName: image })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              imgElement.remove();
              deleteButton.remove();
              socket.emit('refreshImages');  // Refresh images, assuming you have socket defined
            }
          })
          .catch(error => {
            console.error('Error deleting file:', error);
          });
        });
      });
    })
    .catch(error => {
      console.error('Error fetching images:', error);
    });
}