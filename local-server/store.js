import fs from 'node:fs';
import path from 'node:path';

const DATABASE_PATH = path.join(process.cwd(), 'local-server', 'store.json');

if (!fs.existsSync(DATABASE_PATH)) {
  fs.writeFileSync(DATABASE_PATH, '{}');
}

export const db = JSON.parse(fs.readFileSync(DATABASE_PATH));

export const learn = (x, y, color, state) => {
  db[state] = db[state] || [];
  db[state].push({ x, y, color });

  fs.writeFileSync(DATABASE_PATH, JSON.stringify(db));
};

export const clients = new Set();

export const current = {
  x: null,
  y: null,
  color: null,
  bpm: null,
  action: null,
  state: null
};

export const ACTIONS = Object.freeze({
  LEARN: 'learned',
  GENERATE: 'state'
});
