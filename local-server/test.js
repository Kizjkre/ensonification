import cors from 'cors';
import express from 'express';
import http from 'node:http';

let bpm = 60;
const clients = new Set();

let last = 0;
setInterval(() => {
  const data = Array(Math.round(Math.random() * 10)).fill().map(() => ({
    x: Math.random() < 0.5 ? last : ++last,
    y: Math.round(Math.random() * 100),
    color: Math.round(Math.random() * 100)
  }));
  clients.forEach(client => {
    client.write(`data: ${ JSON.stringify(data) }\n\n`);
  });
}, bpm / 60 * 1000);

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
app.post('/datum', (req, res) => {});

app.post('/bpm', (req, res) => {
  bpm = req.body.payload;
});

app.post('/action', (req, res) => {});

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

