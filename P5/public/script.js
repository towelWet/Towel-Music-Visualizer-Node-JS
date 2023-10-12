// Shared variable for the capturer object across multiple files
// let capturer = window.capturer || null;
let isPlaying = false;
let maxFrames;
let song;
let fft;
let imgs = [];
let selectedImgIndex = -1;
let audioInput;
let imageInput;
let slider;
let imageBoxDiv;
let imageBoxButton;
let videoRecorder;
let isRecording = false;  // Variable to track recording state
let videoFileName = "myVideo";  // Default video file name
let canvas;  // Declare a variable to hold the canvas object
let colorPicker;


function preload() {
  // Images will be loaded dynamically from the server
}



function setup() {
    
      // Initialize socket at the beginning of setup
  const socket = io.connect('http://localhost:3000');

    
  createCanvas(1280, 720); // Set your canvas size
  // Set the canvas background to transparent
  clear();

  // Create a dropdown for resolution selection
  resolutionSelect = createSelect();
  resolutionSelect.position(20, 290);
  resolutionSelect.option('720p (16:9)');
  resolutionSelect.option('1080p (16:9)');
  resolutionSelect.option('720x1280 (9:16)');
  resolutionSelect.option('1080x1920 (9:16)');
  resolutionSelect.changed(changeResolution);
    

  // Create a new VideoRecorder instance with "webm" format
  videoRecorder = new p5.VideoRecorder(canvas, "webm");
  videoRecorder.onFileReady = showAndSaveVideo;  // Add this line
    
  colorPicker = createColorPicker('#ffffff');  // Default color is white
  colorPicker.position(20, 320);
 
  angleMode(DEGREES);
  imageMode(CENTER);
  rectMode(CENTER);
    
    
  const startRecButton = createButton('Start Recording');
  startRecButton.position(20, 230);
  startRecButton.mousePressed(startRecording);

  const stopRecButton = createButton('Stop Recording');
  stopRecButton.position(20, 260);
  stopRecButton.mousePressed(stopRecording);

  fft = new p5.FFT(0.2);

  audioInput = createFileInput(handleAudioFile);
  audioInput.position(20, 20);
  audioInput.attribute('accept', 'audio/*');
  imageUploadInput = createFileInput(handleImageUpload);
  imageUploadInput.position(20, 80);
  imageUploadInput.attribute('accept', 'image/*');

// Now it's safe to use socket
socket.on('imageFiles', function(data) {
  // Clear existing options
  imageInput.elt.options.length = 0;

  // Add 'Clear Background' option
  imageInput.option('Clear Background');

  // Add 'Select an image' option
  imageInput.option('Select an image');

  // Clear the imgs array to avoid duplicates
  imgs.length = 0;

  for (let i = 0; i < data.length; i++) {
    imgs.push(loadImage(`pictures/${data[i]}`));
    imageInput.option(`Image ${i + 1}`);
  }
});



  imageInput = createSelect();
  imageInput.position(20, 50);
  imageInput.option('Select an image');
  imageInput.changed(handleImageSelection);

  const playPauseButton = createButton('Play/Pause');
  playPauseButton.position(20, 110);
  playPauseButton.mousePressed(togglePlayPause);

  slider = createSlider(0, 1, 0, 0.01);
  slider.position(20, 170);
  slider.input(seek);

  imageBoxButton = createButton('Show Image Box');
  imageBoxButton.position(20, 200);
  imageBoxButton.mousePressed(toggleImageBox);

  imageBoxDiv = createDiv('');
  imageBoxDiv.position(300, 20);
  imageBoxDiv.hide();

  noLoop();
}

function changeResolution() {
  const selectedResolution = resolutionSelect.value();
  switch (selectedResolution) {
    case '720p (16:9)':
      resizeCanvas(1280, 720);
      break;
    case '1080p (16:9)':
      resizeCanvas(1920, 1080);
      break;
    case '720x1280 (9:16)':
      resizeCanvas(720, 1280);
      break;
    case '1080x1920 (9:16)':
      resizeCanvas(1080, 1920);
      break;
    default:
      break;
  }
  centerCanvas();  // Re-center the canvas after resizing
}


function draw() {
  // Clear the canvas with a transparent background
  clear();

  // Check if a valid image index is selected and the image exists in the array
  if (selectedImgIndex >= 0 && imgs[selectedImgIndex]) {
    // Display the selected image centered on the canvas and scaled to canvas dimensions
    image(imgs[selectedImgIndex], width / 2, height / 2, width, height);
  }

  // Check if the audio is currently playing
  if (isPlaying) {
    // Set fill to transparent
    noFill();    
    // Set stroke color to the selected color
    stroke(colorPicker.color()); 
    // Set stroke color to white
   // stroke(255);
    // Translate the origin to the center of the canvas
    translate(width / 2, height / 2);
    // Analyze the current audio frame
    fft.analyze();
    // Get the waveform data
    let wave = fft.waveform();

    // Loop to draw the waveform mirrored across the Y-axis
    for (let t = -1; t <= 1; t += 2) {
      // Begin a new shape for the waveform
      beginShape();
      // Loop through 180 degrees to plot the waveform
      for (let i = 0; i <= 180; i += 0.5) {
        // Map the angle to an index in the waveform array
        let index = floor(map(i, 0, 180, 0, wave.length - 1));
        // Map the waveform value to a radius between 150 and 350
        let r = map(wave[index], -1, 1, 150, 350);
        // Calculate x and y coordinates based on the radius and angle
        let x = r * sin(i) * t;
        let y = r * cos(i);
        // Add the vertex to the shape
        vertex(x, y);
      }
      // End the shape
      endShape();
    }
  }


}

    
    
    
    
/*
  // Capture the frame
  if (capturer) {
    console.log("Capturing frame");
    capturer.capture(document.getElementById('defaultCanvas0'));
  }
  */



/*
function startRecording() {
  if (!isCapturing && song && song.isLoaded()) {
    handleCapture();
    song.jump(0, function() {
      togglePlayPause();  // Play the song only after it has jumped to the beginning
    });
    isCapturing = true;

    // Start the capturer
    capturer.start();
    console.log("Capturer start");
  }
}

function endRecording() {
  if (isCapturing) {
    handleCapture();
    isCapturing = false;

    // Add a 100ms delay before stopping the capturer
    setTimeout(() => {
      capturer.stop();
      capturer.save();
      console.log("Capturer stop and save invoked");
    }, 100);
  }
}
*/


function centerCanvas() {
  if (canvas) {
    let x = (windowWidth - width) / 2;
    let y = (windowHeight - height) / 2;
    canvas.position(x, y);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerCanvas();
}



function startRecording() {
  if (song && song.isLoaded() && !isRecording) {  // Check isRecording
    console.log("Starting recording...");  // Debugging
    if (song.isPlaying()) {  // Check if the song is already playing
      song.stop();  // Stop the song if it's playing
    }
    song.jump(0);  // Jump to the beginning of the song
    song.play();  // Play the song
    videoRecorder.start();  // Start the video recorder
    isRecording = true;  // Set the recording flag to true
    setTimeout(stopRecording, song.duration() * 1000);  // Stop recording after the song duration
  }
}

function stopRecording() {
  if (isRecording) {  // Check isRecording
    console.log("Stopping recording...");  // Debugging
    if (song.isPlaying()) {  // Check if the song is playing
      song.stop();  // Stop the song
    }
    videoRecorder.stop();  // Stop the video recorder
    isRecording = false;  // Set the recording flag to false
  }
}





function showAndSaveVideo() {
  // Get URL of recorded video
  let videoURL = videoRecorder.url;
  // Create video player element with recording as source
  let vid = createVideo(videoURL);
  vid.showControls();
  // Download the recording with a dynamic name
  videoRecorder.save(videoFileName + "_" + new Date().toISOString());
  console.log("Video recording stopped and saved");
}





// Function to seek through the audio track
function seek() {
  // Check if the 'song' object exists and is loaded
  if (song && song.isLoaded()) {
    // Jump to the time in the song corresponding to the slider's value
    // slider.value() returns a value between 0 and 1
    // Multiply it by song.duration() to get the time in seconds
    song.jump(slider.value() * song.duration());
  }
}

// Function to toggle between play and pause states
function togglePlayPause() {
  // Check if the 'song' object exists and is loaded
  if (song && song.isLoaded()) {
    // Check if the song is currently playing
    if (song.isPlaying()) {
      // If it is, pause the song
      song.pause();
    } else {
      // If it's not, play the song
      song.play();
    }
    // Toggle the 'isPlaying' boolean variable
    isPlaying = !isPlaying;
    
    // If the song is playing, enable the draw loop
    if (isPlaying) {
      loop();
    } else {
      // If the song is paused, disable the draw loop
      noLoop();
    }
  }
}
// Function to handle the uploaded audio file
function handleAudioFile(file) {
  // Check if the uploaded file is an audio file
  if (file.type === 'audio') {
    // If a song is already loaded, stop it
    if (song) {
      song.stop();
    }
    // Load the new audio file into the 'song' object
    // The second argument is a callback function that gets executed once the file is loaded
    song = loadSound(file.data, () => {
      // Play or pause the song
      togglePlayPause();
      // Calculate the maximum number of frames for the song duration, assuming 60 FPS
      maxFrames = Math.ceil(song.duration() * 60);
      // Log the maximum number of frames to the console
      console.log(`Max frames set to ${maxFrames}`);
    });
  }
}

// Function to handle the uploaded image file
function uploadImage(file) {
  // Check if the uploaded file is an image
  if (file.type.startsWith('image/')) {
    // Create a FormData object to hold the file
    let formData = new FormData();
    // Append the file to the FormData object
    formData.append('file', file.file);
    // Make a POST request to upload the file
    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())  // Parse the JSON response
    .then(data => {
      // Emit a socket event to refresh the list of images
      socket.emit('refreshImages');
    })
    .catch(error => {
      // Log any errors to the console
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



// Function to handle the selection of an image from the dropdown
function handleImageSelection() {
  // Get the value of the selected option in the dropdown
  let selectedOption = imageInput.value();
  
  // Check if the selected option is "Clear Background"
  if (selectedOption === 'Clear Background') {
    selectedImgIndex = -1;  // Set to -1 to indicate no image should be displayed
  }
  // Check if the selected option starts with the word 'Image'
  else if (selectedOption.startsWith('Image ')) {
    // Parse the index of the selected image and adjust it to zero-based indexing
    selectedImgIndex = parseInt(selectedOption.split(' ')[1]) - 1;
  }
  
  // Redraw the canvas to reflect the new image selection
  redraw();
}


// Function to delete a selected file
function deleteFile() {
  // Get the select element by its ID
  const deleteSelect = select('#deleteSelect');
  // Get the value of the selected option, which should be the file name
  const fileName = deleteSelect.value();
  // Make a POST request to delete the file
  fetch('/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileName })  // Send the file name in the request body
  })
  .then(response => response.json())  // Parse the JSON response
  .then(data => {
    // Emit a socket event to refresh the list of files
    socket.emit('refreshImages');
  })
  .catch(error => {
    // Log any errors to the console
    console.error('Error deleting file:', error);
  });
}

// Particle class definition
class Particle {
  // Constructor to initialize properties
  constructor() {
    // Initialize position as a random 2D vector scaled by 250
    this.pos = p5.Vector.random2D().mult(250);
    // Initialize velocity as a zero vector
    this.vel = createVector(0, 0);
    // Initialize acceleration based on position and a random factor
    this.acc = this.pos.copy().mult(random(0.0001, 0.0001));
    // Initialize width of the particle as a random value between 3 and 5
    this.w = random(3, 5);
    // Initialize color as a random RGB value
    this.color = [random(200, 255), random(200, 255), random(200, 255)];
  }

  // Update function to update particle's position and velocity
  update(cond) {
    // Add acceleration to velocity
    this.vel.add(this.acc);
    // Add velocity to position
    this.pos.add(this.vel);
    // If condition 'cond' is true, add extra velocity to position
    if (cond) {
      this.pos.add(this.vel);
      this.pos.add(this.vel);
      this.pos.add(this.vel);
    }
  }

  // Function to check if particle is out of canvas bounds
  edges() {
    // Check if particle's x or y position is out of bounds
    if (this.pos.x < -width / 2 || this.pos.x > width / 2 ||
        this.pos.y < -height / 2 || this.pos.y > height / 2) {
      return true;  // Return true if out of bounds
    } else {
      return false;  // Return false if within bounds
    }
  }

  // Function to display the particle
  show() {
    // Disable stroke
    noStroke();
    // Set fill color
    fill(this.color);
    // Draw ellipse at particle's position with its width
    ellipse(this.pos.x, this.pos.y, this.w);
  }
}


// Function to display images on the UI
function displayImages(imageFiles) {
  // Create a div element to contain the images
  const imageContainer = createDiv();
  // Set the position of the div element
  imageContainer.position(300, 20);

  // Loop through each image file
  imageFiles.forEach((fileName, index) => {
    // Create an image element and set its source
    const imgElem = createImg(`pictures/${fileName}`);
    // Set the size of the image element
    imgElem.size(100, 100);
    // Set the parent of the image element to the container div
    imgElem.parent(imageContainer);

    // Create a delete button for each image
    const delButton = createButton('Delete');
    // Set the parent of the delete button to the container div
    delButton.parent(imageContainer);
    // Add a click event listener to the delete button
    delButton.mousePressed(() => deleteImage(fileName));
  });
}

// Function to delete an image
function deleteImage(fileName) {
  // Make a POST request to the '/delete' endpoint
  fetch('/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileName })
  })
  .then(response => response.json())
  .then(data => {
    // Emit a socket event to refresh the image list
    socket.emit('refreshImages');
    // Reload the page to reflect the changes
    window.location.reload(true);
  })
  .catch(error => {
    // Log any errors to the console
    console.error('Error deleting file:', error);
  });
}


// Function to toggle the visibility of the image box
function toggleImageBox() {
  // Check if the image box is currently hidden
  if (imageBoxDiv.style('display') === 'none') {
    // If hidden, call the function to display it
    displayImageBox();
  } else {
    // If visible, call the function to hide it
    hideImageBox();
  }
}

// Function to hide the image box
function hideImageBox() {
  // Use the p5.js hide() method to hide the image box div
  imageBoxDiv.hide();
}

// Function to display the image box and populate it with images
function displayImageBox() {
  // Show the image box div
  imageBoxDiv.show();
  
  // Clear any existing elements in the image box
  imageBoxDiv.html('');

  // Fetch the list of images from the server
  fetch('/getImages')
    .then(response => response.json())
    .then(data => {
      // Loop through each image file received from the server
      data.forEach((image, index) => {
        // Create an image element for each image file
        let imgElement = createImg(`pictures/${image}`);
        // Set the size of the image
        imgElement.size(100, 100);
        // Set the parent of the image element to the image box div
        imgElement.parent(imageBoxDiv);

        // Create a delete button for each image
        let deleteButton = createButton('Delete');
        // Set the parent of the delete button to the image box div
        deleteButton.parent(imageBoxDiv);
        // Add a mousePressed event to the delete button
        deleteButton.mousePressed(() => {
          // Send a delete request to the server for the selected image
          fetch('/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileName: image })
          })
          .then(response => response.json())
          .then(data => {
            // If the delete was successful, remove the image and delete button elements
            if (data.success) {
              imgElement.remove();
              deleteButton.remove();
              // Emit a refresh event to update the list of images (assuming socket is defined)
              socket.emit('refreshImages');
            }
          })
          .catch(error => {
            // Log any errors that occur during the delete process
            console.error('Error deleting file:', error);
          });
        });
      });
    })
    .catch(error => {
      // Log any errors that occur during the fetch process
      console.error('Error fetching images:', error);
    });
}
