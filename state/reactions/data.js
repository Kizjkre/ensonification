import state from '../state.js';

let disposer;

export const register = el => disposer = mobx.reaction(
  () => (state.current.score === null).toString(),
  disabled => el.setAttribute('disabled', disabled),
  { fireImmediately: true }
);

export const unregister = () => disposer();
