import cors from 'cors';
import express from 'express';
import { Server } from 'node-osc';
import http from 'node:http';
import generate from './generate.js';
import { learn, current, ACTIONS } from './store.js';

const clients = new Set();

// UDP Server
const UDP = 5005;
const osc = new Server(UDP, 'localhost');

osc.on('message', msg => {
  const [addr, ...data] = msg;

  if (addr !== '/Player') return;

  switch (data[0]) {
    case ACTIONS.GENERATE: // NOTE: generation
      current.state = data[1];
      break;
    case ACTIONS.LEARN: // NOTE: training
      learn(current.x, current.y, current.color, data[1]);
      break;
  }
});

const PORT = 4433;
const ORIGINS = new Set([
  'https://ccrma.stanford.edu/~pengt/ensonification/',       // Production
  'https://ccrma.stanford.edu/~pengt/sonification-ensemble',
  'http://localhost:5173',                  // Development
  'https://localhost:5173',                 // Development (HTTPS)
  'http://127.0.0.1:5173',
  'https://127.0.0.1:5173'                  // Development (HTTPS)
]);

const app = express();
const server = http.createServer(app);

app.use((req, res, next) => {
  if (!ORIGINS.has(req.headers.origin)) {
    return res.status(403).end('Forbidden');
  }
  next();
});

app.use(cors({
  origin(origin, callback) {
    // Reject unapproved origins. Requests without an Origin
    // header are allowed through CORS middleware, but should
    // still be authenticated if they access sensitive operations.
    if (!origin || ORIGINS.has(origin)) {
      callback(null, origin || false);
    } else {
      callback(new Error('Origin not allowed'));
    }
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: true
}));

// Parse JSON request bodies
app.use(express.json({ limit: '1mb' }));

// Add Private Network Access header to preflight responses
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;

    if (ORIGINS.has(origin)) {
      res.setHeader(
        'Access-Control-Allow-Private-Network',
        'true'
      );
    }
  }

  next();
});

// POST endpoints
app.post('/datum', (req, res) => {
  const data = JSON.parse(req.body);

  if (!data.x || !data.y || !data.color) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  current.x = data.x;
  current.y = data.y;
  current.color = data.color;

  res.json({
    success: true,
    received: req.body
  });
});

app.post('/bpm', (req, res) => {
  const data = req.body.payload;

  if (!data || isNaN(data)) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  current.bpm = data;

  res.json({
    success: true,
    received: req.body
  });
});

app.post('/action', (req, res) => {
  const data = req.body.payload;

  // TODO; validation

  current.action = data;

  switch (current.action) {
    case ACTIONS.GENERATE:
      generate();
      break;
  }

  res.json({
    success: true,
    received: req.body
  });
});

// SSE endpoint
app.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.flushHeaders();

  console.log('Client streaming connected');

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
    console.log('Client disconnected');
  });
});

// Start server
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Local server listening on port ${ PORT }`);
});

