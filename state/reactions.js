import state from './state.js';

export const reactData = reaction => mobx.reaction(
  () => state.scores[state.current.score]?.data,
  reaction
);
