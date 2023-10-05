let capturer;
let isCapturing = false;  // Kept isCapturing here
let isInitialized = false;

function initializeCapturer() {
  try {
capturer = new CCapture({
  format: 'webm', 
  framerate: 60,
  verbose: true
});
    console.log("Capturer initialized");
    isInitialized = true;
  } catch (error) {
    console.error("Error in initializeCapturer:", error);
    isInitialized = false;
  }
}

function handleCapture() {
    console.log(`isCapturing: ${isCapturing}, isInitialized: ${isInitialized}`);
  
  try {
    if (!isInitialized) {
      console.error("Capturer is not initialized. Cannot start capturing.");
      return;
    }
    if (!isCapturing) {
      console.log("Capturer start");
      isCapturing = true;
      capturer.start();
      if (song && song.isLoaded()) {
        song.jump(0);  // Start the song from the beginning
        togglePlayPause();  // Play the song
      }
      loop();
    } else {
      if (capturer) {  // Check if capturer is defined
        console.log("Capturer stop");
        isCapturing = false;
        capturer.stop();
        capturer.save();
        console.log("Capturer save invoked");
      } else {
        console.error("Capturer is undefined. Cannot stop capturing.");
      }
      if (song && song.isLoaded()) {
        song.stop();  // Stop the song
      }
      noLoop();
    }
  } catch (error) {
    console.error("Error in handleCapture:", error);
    isCapturing = false;
    noLoop();
  }
}


function handleWebMExportInDraw() {
  try {
    if (isCapturing) {
      capturer.capture(document.getElementById('defaultCanvas0'));
    }
  } catch (error) {
    console.error("Error in handleWebMExportInDraw:", error);
  }
}
