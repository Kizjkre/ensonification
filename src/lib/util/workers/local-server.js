const source = new EventSource('http://localhost:4433/stream');

source.onopen = () => self.postMessage({ type: 'connection', connected: true });
source.onerror = () => self.postMessage({ type: 'connection', connected: false });

source.onmessage = event => {
  self.postMessage({ type: 'connection', connected: true });
  const raw = JSON.parse(event.data);
  const data = raw; // TODO: process data
  self.postMessage({ type: 'data', data });
};

self.onmessage = event => {
  fetch(`http://localhost:4433/${event.data[0]}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ payload: event.data[1] })
  });
};
