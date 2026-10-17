import http from 'node:http';
import * as dgram from 'node:dgram';
import parse from './osc.js';

const clients = new Set();

// UDP Server
const UDP = 5005;
const socket = dgram.createSocket('udp4');

socket.on('message', (message, rinfo) => {
  message = parse(message);
  console.log(`Received message: ${ JSON.stringify(message) } from ${ rinfo.address }:${ rinfo.port }`);

  clients.forEach(client => {
    client.write(`data: ${ JSON.stringify(message) }\n\n`);
  });
});

socket.bind(UDP, () => {
  console.log(`UDP server listening on port ${ UDP }`);
});


const PORT = 4433;
const ALLOWED_ORIGINS = [
  'https://ccrma.stanford.edu/~pengt/ensonification/',       // Production
  'https://ccrma.stanford.edu/~pengt/sonification-ensemble',
  'http://localhost:5173',                  // Development
  'https://localhost:5173',                 // Development (HTTPS)
  'http://127.0.0.1:5173',
  'https://127.0.0.1:5173'                  // Development (HTTPS)
];

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;

  // Helper to add CORS headers
  const addCorsHeaders = headers => {
    if (ALLOWED_ORIGINS.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Private-Network'] = 'true';
    }
  };

  // 1. Handle Browser Preflight
  if (req.method === 'OPTIONS') {
    const headers = {};
    addCorsHeaders(headers);
    res.writeHead(204, headers);
    res.end();
    return;
  }

  // 2. SSE Stream Endpoint
  if (req.url === '/stream') {
    // Establish persistent, event-stream connection
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    };

    addCorsHeaders(headers);
    res.writeHead(200, headers);

    console.log(`Client streaming connected from: ${ origin }`);

    clients.add(res);

    req.on('close', () => {
      console.log('Client disconnected from stream.');
      clients.delete(res);
    });
    return;
  }

  // Fallback
  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`SSE server started on http://localhost:${ PORT }/stream`);
});
