import { clients, current, db } from './store.js';

let last = 0;

export default () => {
  const d = current.state in db ? structuredClone(db[current.state]) : db[Object.keys(db)[Math.floor(Math.random() * Object.keys(db).length)]];
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
};
