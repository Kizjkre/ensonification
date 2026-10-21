import { getBPM, read } from './store.js';

export default () => {
  const bpm = getBPM();
  if (bpm < 0) return;

  const id = setInterval(() => {
    const db = read();
    const d = db[state()];
    const i = Math.floor(Math.random() * d.length);
    clients().forEach(client => {
      client.write(`data: ${ JSON.stringify(d[i]) }\n\n`);
    });
  }, bpm * 60 * 1000);

  return () => clearInterval(id);
}
