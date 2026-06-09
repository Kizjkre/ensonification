import state from '../state.js';

const files = new Set();

export const register = file => files.add(file);
export const unregister = file => files.delete(file);

mobx.reaction(
  () => state.current.score,
  score => files.forEach(file => file.shadowRoot.querySelector('button').classList.toggle('selected', file.ensId === score))
);
