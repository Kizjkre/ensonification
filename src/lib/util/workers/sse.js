const eventSource = new EventSource('http://localhost:4433/stream');

eventSource.onmessage = event => {
  const raw = JSON.parse(event.data);
  const data = raw; // TODO: process data
  self.postMessage(data);
};
