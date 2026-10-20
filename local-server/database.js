import fs from 'node:fs';
import path from 'node:path';

const DATABASE_PATH = path.join(process.cwd(), 'local-server', 'database.json');

if (!fs.existsSync(DATABASE_PATH)) {
  fs.writeFileSync(DATABASE_PATH, '{}');
}

const db = JSON.parse(fs.readFileSync(DATABASE_PATH));

export const read = () => db;

export const write = (x, y, color, state) => {
  db[x] = db[x] || {};
  db[x][y] = db[x][y] || {};
  db[x][y][color] = db[x][y][color] || [];
  db[x][y][color].push(state);

  fs.writeFileSync(DATABASE_PATH, JSON.stringify(db));
};
