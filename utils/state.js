import 'https://unpkg.com/mobx/dist/mobx.umd.production.min.js';
import { csvParse } from 'https://cdn.jsdelivr.net/npm/d3-dsv@3/+esm';
import { types } from '../engine/type.js';
import autotype from './autotype.js';
import { isAudio, isCSV } from './type.js';

const state = {
  encodings: [],
  field: null,
  id: -1,
  files: [],
  marks: [],
  transforms: [],
};

mobx.makeAutoObservable(state);

export default state;

export const encoding = encoding => {
  if (state.id === -1 || state.field === null) return;
  else if (!state.encodings[state.id]) state.encodings[state.id] = {};

  if (state.encodings[state.id][state.field] === encoding) delete state.encodings[state.id][state.field];
  else state.encodings[state.id][state.field] = encoding;
};

export const file = async (name, handle) => {
  const content = {
    name,
    type: 'other',
    payload: null
  };

  if (isCSV(name)) {
    const file = await handle.getFile().then(r => r.text());
    const data = csvParse(file);
    content.type = 'csv';
    content.payload = data;
    content.fields = Object.fromEntries(Object.entries(autotype(data)).map(([col, { type }]) => [col, type]));
  } else if (isAudio(name)) {
    const file = await handle.getFile().then(r => r.arrayBuffer());
    content.type = 'audio';
    content.payload = file;
  } else {
    content.payload = await handle.getFile().then(r => r.blob());
  }

  state.files.push(content);

  return state.files.length - 1;
};

export const mark = mark => {
  if (state.id === -1 || state.field === null) return;
  else if (!state.marks[state.id]) state.marks[state.id] = {};

  if (state.marks[state.id][state.field] === mark) delete state.marks[state.id][state.field];
  else state.marks[state.id][state.field] = mark;
};

export const transform = transform => {
  if (state.id === -1 || state.field === null) return;
  else if (!state.transforms[state.id]) state.transforms[state.id] = {};

  if (state.transforms[state.id][state.field] === transform) delete state.transforms[state.id][state.field];
  else state.transforms[state.id][state.field] = transform;
};

export const type = type => {
  if (state.id === -1 || state.field === null || !state.files[state.id]) return;

  state.files[state.id].fields[state.field] = types[type];
};
