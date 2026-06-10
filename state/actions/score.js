// noinspection JSConstantReassignment

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
    d.id = state.scores[state.current.score].data.length;

    state.scores[state.current.score].data.push(d);
  }
});

export const createScore = mobx.action(() => {
  const s = structuredClone(score);
  const id = state.utils.free.shift() ?? state.scores.length;
  s.id = id;

  state.scores[id] = s;
  setCurrent('score', id);
  toggleTab('data', true);

  return id;
});

export const deleteScore = mobx.action(id => {
  state.scores[id] = null;
  state.utils.free.push(id);
  resetCurrent();
});

export const setName = mobx.action((id, name) => state.scores[id].name = name);
