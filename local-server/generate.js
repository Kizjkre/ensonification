import { clients, current, db } from './store.js';

export default () => {
  const bpm = current.bpm;
  if (bpm < 0) return;

  const id = setInterval(() => {
    const d = db[current.state];
    clients.forEach(client => {
      client.write(`data: ${ JSON.stringify(d) }\n\n`);
    });
  }, bpm * 60 * 1000);

  return () => clearInterval(id);
};
