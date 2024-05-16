const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store custom names associated with WebSocket connections
const customNames = new Map();

wss.on('connection', (ws) => {
    // Handle new WebSocket connections

    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            const sender = customNames.get(ws) || 'Anonymous'; // Default to 'Anonymous' if custom name not set
            const { customName, message: msg } = data;

            // If a custom name is provided, update it for this connection
            if (customName) {
                customNames.set(ws, customName);
            }

            // Broadcast the message to all clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ sender, message: msg }));
                }
            });
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        customNames.delete(ws); // Remove custom name mapping when a client disconnects
    });
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
