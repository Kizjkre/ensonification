import state from '../state.js';

export const setCurrent = mobx.action((param, value) => state.current[param] = state.current[param] === value ? null : value);

export const resetCurrent = mobx.action(() => {
  state.current.score = null;
  state.current.field = null;
});
