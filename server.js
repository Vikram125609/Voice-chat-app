const http = require('http');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs')

const handleRoute = function (req, res) {
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.readFile(path.join(__dirname, './index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading file');
            } else {
                res.end(data);
            }
        });
    }
    else if (req.method === 'GET' && req.url === '/script.js') {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        fs.readFile(path.join(__dirname, './script.js'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading script.js');
            } else {
                res.end(data);
            }
        });
    }
    else {
        res.writeHead(404);
        res.end('Not Found');
    }
}

const server = http.createServer(handleRoute);

const WebSocket = require('ws');
const wss = new WebSocket.Server({ noServer: true });

const total_users = [];

wss.on('connection', (socket) => {
    const id = crypto.randomBytes(4).toString('hex');
    socket.id = id;

    console.log('id', id);

    socket.on('message', (data) => {
        const message = data.toString('utf-8');
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client.id !== socket.id) {

                client.send(message);
            }
        });
    });
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

server.listen(8000, () => {
    console.log('Server listening on port 8000');
});