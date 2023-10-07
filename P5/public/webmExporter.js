// Declare variables for the capturer object and state flags
let capturer;
let isCapturing = false;  // Flag to indicate if capturing is in progress
let isInitialized = false;  // Flag to indicate if the capturer is initialized

// Function to initialize the capturer
function initializeCapturer() {
  try {
    // Create a new CCapture object with specified settings
    capturer = new CCapture({
      format: 'webm', 
      framerate: 60,
      verbose: true
    });
    console.log("Capturer initialized");
    isInitialized = true;  // Set initialization flag to true
  } catch (error) {
    // Log any errors that occur during initialization
    console.error("Error in initializeCapturer:", error);
    isInitialized = false;  // Set initialization flag to false
  }
}

// Function to handle the capture process
function handleCapture() {
  console.log(`isCapturing: ${isCapturing}, isInitialized: ${isInitialized}`);
  
  try {
    // Check if the capturer is initialized
    if (!isInitialized) {
      console.error("Capturer is not initialized. Cannot start capturing.");
      return;
    }
    // Check if capturing is already in progress
    if (!isCapturing) {
      console.log("Capturer start");
      isCapturing = true;  // Set capturing flag to true
      capturer.start();  // Start capturing
      
      // Start the song from the beginning and play it
      if (song && song.isLoaded()) {
        song.jump(0);
        togglePlayPause();
      }
      loop();  // Start the p5.js draw loop
    } else {
      // Stop capturing if capturer object exists
      if (capturer) {
        console.log("Capturer stop");
        isCapturing = false;  // Set capturing flag to false
        capturer.stop();  // Stop capturing
        capturer.save();  // Save the captured data
        console.log("Capturer save invoked");
      } else {
        console.error("Capturer is undefined. Cannot stop capturing.");
      }
      
      // Stop the song if it is loaded
      if (song && song.isLoaded()) {
        song.stop();
      }
      noLoop();  // Stop the p5.js draw loop
    }
  } catch (error) {
    // Log any errors that occur during capturing
    console.error("Error in handleCapture:", error);
    isCapturing = false;  // Set capturing flag to false
    noLoop();  // Stop the p5.js draw loop
  }
}

// Function to handle WebM export in the p5.js draw function
function handleWebMExportInDraw() {
  try {
    // Capture the current frame if capturing is in progress
    if (isCapturing) {
      capturer.capture(document.getElementById('defaultCanvas0'));
    }
  } catch (error) {
    // Log any errors that occur during frame capture
    console.error("Error in handleWebMExportInDraw:", error);
  }
}
