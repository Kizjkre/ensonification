import cors from 'cors';
import express from 'express';
import { Server } from 'node-osc';
import { exec } from 'node:child_process';
import http from 'node:http';
import generate from './generate.js';
import { ACTIONS, clients, current, learn } from './store.js';

// Launch Max/MSP
exec('open local-server/somax.maxpat'); // todo: make it not hard-coded

// UDP Server
const UDP = 5005;
const osc = new Server(UDP, 'localhost');

osc.on('message', msg => {
  const [addr, ...data] = msg;

  if (addr !== '/Player') return;

  switch (data[0]) {
    case ACTIONS.GENERATE: // NOTE: generation
    case ACTIONS.LEARN: // NOTE: training
      current.state = data[1];
      break;
  }
});

const PORT = 4433;
const ORIGINS = new Set([
  'https://ccrma.stanford.edu',       // Production
  'http://localhost:5173',                  // Development
  'https://localhost:5173',                 // Development (HTTPS)
  'http://127.0.0.1:5173',
  'https://127.0.0.1:5173'                  // Development (HTTPS)
]);

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin(origin, callback) {
    if (origin && ORIGINS.has(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Origin not allowed'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));

// POST endpoints
app.post('/datum', (req, res) => {
  const data = req.body;

  data.forEach(datum => {
    learn(datum.x, datum.y, datum.color, current.state);
  });

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
  // TODO; validation
  current.action = req.body.payload;

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

