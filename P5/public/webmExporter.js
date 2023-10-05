// Initialize variables for WebM export
let capturer;
let isCapturing = false;
let maxFrames = 300;
let capturedFrames = 0;

function initializeCapturer() {
  try {
    capturer = new CCapture({ 
      format: 'webm', 
      framerate: 60,
      verbose: true 
    });
    console.log("Capturer initialized");
  } catch (error) {
    console.error("Error in initializeCapturer:", error);
  }
}

function handleCapture() {
  try {
    if (!isCapturing) {
      console.log("Capturer start");
      isCapturing = true;
      capturer.start();
      setTimeout(() => { if (isCapturing) handleCapture(); }, 5000);  // Manually stop and save after 5 seconds
      loop();
    } else {
      console.log("Capturer stop");
      isCapturing = false;
      if (capturedFrames > 0) {
        capturer.stop();
        capturer.save();
        console.log("Capturer save invoked");
      }
      noLoop();
    }
  } catch (error) {
    console.error("Error in handleCapture:", error);
    isCapturing = false;
    noLoop();
  }
}


// Function to handle WebM export in draw loop
function handleWebMExportInDraw() {
  try {
    if (isCapturing) {
      capturer.capture(document.getElementById('defaultCanvas0'));
      capturedFrames++;
      console.log(`Captured frame ${capturedFrames}`);
      if (capturedFrames >= maxFrames) {
        handleCapture();
      }
    }
  } catch (error) {
    console.error("Error in handleWebMExportInDraw:", error);
  }
}
