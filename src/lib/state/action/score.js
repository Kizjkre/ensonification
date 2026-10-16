import { score, state, view } from '$lib/state/state.svelte.js';

state.scores.create = () => {
  const s = structuredClone(score);
  const id = state.utils.free.scores.shift() ?? state.scores.length;
  // noinspection JSConstantReassignment
  s.id = id;

  state.scores[id] = s;
  state.current.setScore(id);

  return id;
};

state.scores.createView = () => {
  const v = structuredClone(view);
  const score = state.scores[state.current.score];
  const id = score.utils.free.views.shift() ?? score.views.length;
  // noinspection JSConstantReassignment
  v.id = id;
  score.views[id] = v;

  state.ui.views[id] = true;
  return id;
};

state.scores.delete = (id = state.current.score) => {
  delete state.scores[id];
  state.utils.free.scores.push(id);
  state.current.reset();
  state.ui.views.reset();
};
