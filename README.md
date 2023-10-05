# Music Visualizer Project 🎵🎨

## Overview 🌐

This project is a Music Visualizer built using Node.js, Express, p5.js, and Socket.io. 
It allows users to upload audio and image files, 
visualize the audio in real-time, 
and even capture the visualization into a WebM video format.

## Directory Structure 📂

```
Music-Visualizer/
|-- node_modules/
|-- package.json
|-- package-lock.json
|-- server.js
|-- public/
|   |-- Alchemist Gmin 150 Finesse.mp3
|   |-- CCapture.all.min.js
|   |-- CCapture.min.js
|   |-- Music Visualizer.html
|   |-- index.html
|   |-- p5.dom.min.js
|   |-- p5.js
|   |-- p5.min.js
|   |-- p5.sound.js
|   |-- p5.sound.js.map
|   |-- p5.sound.min.js
|   |-- p5.sound.min.js.map
|   |-- pictures/
|   |-- script.js
|   |-- style.css
|   |-- webmExporter.js
|   |-- webm-writer-0.2.0.js
```

## How to Run 🏃‍♂️

1. Install Node.js and npm if you haven't already.
2. Navigate to the project directory and run `npm install` to install dependencies.
3. Run `node server.js` to start the server.
4. Open your browser and go to `http://localhost:3000`.

## Features 🌟

- **Audio Upload**: Upload your audio files to visualize.
- **Image Upload**: Upload images to be used as background.
- **Real-time Visualization**: See your audio come to life.
- **WebM Export**: Capture the visualization into a WebM video.

## File Descriptions 📄

### server.js

This file sets up the Express server and handles file uploads, deletions, and image retrieval.

#### Functions:
- `upload.single('file')`: Handles file upload.
- `app.get('/getImages', ...)`: Retrieves all image files.
- `app.post('/delete', ...)`: Deletes a file.

### index.html

The main HTML file that includes all the scripts and styles.

### script.js

This file contains the p5.js sketch and handles the UI elements for audio and image file inputs.

#### Functions:
- `preload()`: Preloads assets.
- `setup()`: Initializes the canvas and UI elements.
- `draw()`: Main drawing loop.
- `togglePlayPause()`: Toggles audio playback.
- `handleAudioFile(file)`: Handles audio file input.
- `handleImageSelection()`: Handles image selection from dropdown.
- `handleImageUpload(file)`: Handles image file upload.

### webmExporter.js

Handles the WebM video capturing functionality.

#### Functions:
- `initializeCapturer()`: Initializes the video capturer.
- `handleCapture()`: Starts or stops capturing.
- `handleWebMExportInDraw()`: Captures frames during the draw loop.

### webm-writer-0.2.0.js

Modified library for WebM video writing. 
Added debugging and setting dataOffset.

## Issues 🐛

- **Dynamic Frame Capture**: Currently, the frame capture stops after 600 frames.
- This should be dynamic, adjusting to the duration of the song.
  
- **Start and End Recording**: The 'Start Recording' button should set the time of the song to the very beginning.
- The 'End Recording' should be automated as well, executing automatically when the song ends.
