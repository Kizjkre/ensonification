import http from 'http';

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

    // Example: Push data to client every 3 seconds
    const intervalId = setInterval(() => {
      const dataPayload = JSON.stringify({ message: 'Hello from local machine!', timestamp: Date.now() });

      // SSE format requires "data: <string>\n\n"
      res.write(`data: ${ dataPayload }\n\n`);
    }, 3000);

    // Clean up if the browser closes the tab or disconnects
    req.on('close', () => {
      console.log('Client disconnected from stream.');
      clearInterval(intervalId);
    });
    return;
  }

  // Fallback
  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${ PORT }/stream`);
});
