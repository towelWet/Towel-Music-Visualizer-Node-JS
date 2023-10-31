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
|   |-- p5.videorecorder.js
|   |-- p5.dom.min.js
|   |-- p5.js
|   |-- p5.min.js
|   |-- p5.sound.js
|   |-- p5.sound.js.map
|   |-- p5.sound.min.js
|   |-- p5.sound.min.js.map
|   |-- start_app.sh
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

## Start and End Recording Logic 🌟

  Start Recording:
Check Conditions: Ensure that recording is not already in progress and that a song is available.
Pause Current Playback: If the song is playing, pause it.
Reset Song Position: Move the song's playback position to the beginning.
Resume Playback: Start playing the song from the beginning.
Initiate Video Capture: Begin capturing video and audio.

  End Recording:
Check Conditions: Ensure that recording is in progress.
Monitor Song: Continuously check the song's playback position.




### Compile macOS Executable Using Platypus 🍏

1️⃣ Download and install [Platypus](https://sveinbjorn.org/platypus).  
2️⃣ Open Platypus and fill in the app details.  
3️⃣ For the script, include the following Bash script:

```bash
#!/bin/bash
# Get the directory of the currently executing script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Navigate to your project directory (assuming the script is in the project directory)
cd "$DIR"

# Install dependencies and start the server using full paths to npm and node
/usr/local/bin/npm install
/usr/local/bin/node server.js &

# Wait for the server to start
sleep 2

# Open the browser
open http://localhost:3000
```

4️⃣ In the "Files to be bundled" section, include the following files and folders:
- `server.js`
- `package.json`
- `public/`
- `node_modules/` (optional, can be installed via script)
- `start_app.sh`

5️⃣ Click "Create" to generate the `.app` file.  
6️⃣ Double-click the generated `.app` file to run the server.  
7️⃣ The app will open your browser automatically and go to http://localhost:3000.






YOU MAY HAVE TO
### chmod +x+rw start_app.sh
IF YOU HAVE PERMISSION PROBLEMS

