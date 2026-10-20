const source = new EventSource('http://localhost:4433/stream');

source.onmessage = event => {
  const raw = JSON.parse(event.data);
  const data = raw; // TODO: process data
  self.postMessage(data);
};

self.onmessage = event => {
  console.log(event.data);
  fetch(`http://localhost:4433/${event.data[0]}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ payload: event.data[1] })
  });
};
