import { csvParse } from 'https://cdn.jsdelivr.net/npm/d3-dsv@3/+esm';
import autotype from '../../utils/autotype.js';
import state, { data, score } from '../state.js';
import { resetCurrent, setCurrent } from './current.js';
import { toggleTab } from './ui.js';

export const addData = mobx.action(async files => {
  for await (const file of files) {
    const d = structuredClone(data);
    d.name = file.name;
    d.data = csvParse(await file.text());
    d.columns = Object.fromEntries(Object.entries(autotype(d.data)).map(([col, { type }]) => [col, type]));

    state.scores[state.current.score].data[d.name] = d;
  }
});

export const createScore = mobx.action(() => {
  const s = structuredClone(score);
  s.id = state.scores.length;

  state.scores.push(s);
  setCurrent('score', state.scores.length - 1);
  toggleTab('data', true);

  return state.scores.length - 1;
});

export const deleteScore = mobx.action(id => {
  delete state.scores[id];
  resetCurrent();
});

export const setName = mobx.action((id, name) => state.scores[id].name = name);
