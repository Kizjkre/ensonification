import { state } from '$lib/state/state.svelte.js';

state.current.setScore = value => {
  state.current.score = state.current.score === value ? null : value;
  state.ui.views.reset();
};

state.current.reset = () => {
  state.current.score = null;
};
