import { state } from '$lib/state/state.svelte.js';

state.ui.toggle = force => state.ui.shown = force ?? !state.ui.shown;

state.ui.views.toggle = (id, force) => state.ui.views[id] = force ?? !state.ui.views[id];

state.ui.views.reset = () => state.ui.views.length = 0;
