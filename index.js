import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { WebSocketServer } from 'ws';
import yaml from 'js-yaml';
import pino from 'pino';
import HDMI_Matrix from './lib/hdmi_matrix.mjs';
const logger = pino({
    timestamp: pino.stdTimeFunctions.isoTime
  });

// Load and parse the config.yaml file
const configPath = path.join(process.cwd(), 'config.yaml');
let configData;

try {
  const fileContents = fs.readFileSync(configPath, 'utf8');
  configData = yaml.load(fileContents);
} catch (e) {
  logger.error({'event':'Error reading config.yaml:', e});
}

let matrix = new HDMI_Matrix(configData['device_path'])

// Create a simple HTTP server to serve the index.html file
const server = http.createServer((req, res) => {
  // Serve index.html from the "public" directory if requesting "/"
  if (req.url === '/') {
    const filePath = path.join(process.cwd(), 'public', 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.url === '/config') {
    // Send the config data as JSON
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(configData));
  } else if (req.url === '/sws') {
    matrix.read((respSws) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(respSws));
    });
  } else {
    // Return 404 for other paths
    res.writeHead(404);
    res.end();
  }
});

// Create the WebSocket server on top of our existing HTTP server
const wss = new WebSocketServer({ server });

// Store the current choice in memory
let currentChoice = null;

// Handle WebSocket connections
wss.on('connection', (ws) => {
  logger.info({'event':'New client connected.'});

  // Immediately send the current choice state to the newly connected client
  ws.send(JSON.stringify({ type: 'update', choice: currentChoice }));

  // Listener for messages from this client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
  
      // If the incoming data indicates a new choice, update and broadcast
      if (data.type === 'choice') {
        let choices = Array.from(configData["choices"]).filter(r => r["label"] == data.choice && r["sws"]);
        if(choices.length > 0) {
          currentChoice = data.choice;
          matrix.write(choices[0]["sws"]);
        }

        // Broadcast the updated choice to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify({ type: 'update', choice: currentChoice }));
          }
        });
      }
    } catch (error) {
      logger.error({'event':'Failed to parse message:', error});
    }
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  logger.info({'event':`Server listening on http://localhost:${PORT}`});
});
