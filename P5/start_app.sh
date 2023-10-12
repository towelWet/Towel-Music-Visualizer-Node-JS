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
