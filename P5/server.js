const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const multer = require('multer');

// Set up Multer storage options
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/pictures');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Initialize the Express application
const app = express();
const server = http.Server(app);

// Initialize a new instance of Socket.io
const io = socketIO(server);

// Serve static files from the "public" directory
app.use(express.static('public'));

// Endpoint for file upload
app.post('/upload', upload.single('file'), (req, res) => {
  console.log("File uploaded", req.file);
  res.json({ success: true });
  io.emit('refreshImages');
  console.log("Emitted refreshImages");
});

// Endpoint to get all image files
app.get('/getImages', (req, res) => {
  fs.readdir('./public/pictures', (err, files) => {
    if (err) {
      console.error("Error reading the pictures directory:", err);
      res.status(500).send(err);
      return;
    }
    const imageFiles = files.filter(file => !file.startsWith('.DS_Store') && file.endsWith('.png'));
    res.json(imageFiles);
  });
});

// Endpoint for file deletion
app.post('/delete', express.json(), (req, res) => {
  const fileName = req.body.fileName;
  const filePath = `./public/pictures/${fileName}`;
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      res.json({ success: false });
      return;
    }
    res.json({ success: true });
    io.emit('refreshImages');
  });
});

// On client connection, handle custom events
io.on('connection', function(socket) {
  console.log('A user connected');

  function emitImageFiles() {
    fs.readdir('./public/pictures', (err, files) => {
      if (err) {
        console.log("Error reading the pictures directory:", err);
        return;
      }
      const imageFiles = files.filter(file => !file.startsWith('.DS_Store') && file.endsWith('.png'));
      console.log("Emitting image files:", imageFiles);
      socket.emit('imageFiles', imageFiles);
    });
  }

  emitImageFiles();

  socket.on('refreshImages', () => {
    emitImageFiles();
  });

  socket.on('disconnect', function() {
    console.log('A user disconnected');
  });
});

// Start the server on port 3000
server.listen(3000, function() {
  console.log('Server running, visit http://localhost:3000');
});
