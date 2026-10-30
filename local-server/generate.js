import { clients, current, db } from './store.js';

let last = 0;

export default () => {
  const bpm = current.bpm;
  if (bpm < 0) return;

  const gen = time => setTimeout(() => {
    const prev = last;

    const d = structuredClone(db[current.state]);
    if (!d || !d.length) return;
    const xs = new Set();
    d.sort((a, b) => a.x - b.x);
    d.forEach((datum, i) => {
      const x = datum.x;
      if (xs.has(x)) d[i].x = last;
      else d[i].x = ++last;
      xs.add(x);
    });

    clients.forEach(client => {
      client.write(`data: ${ JSON.stringify(d) }\n\n`);
    });

    console.log(prev, last, (last - prev) * bpm / 60 * 1000);
    gen((last - prev) * bpm / 60 * 1000);
  }, time);

  gen(0);
};
