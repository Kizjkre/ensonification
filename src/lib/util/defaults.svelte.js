import file from '$lib/state/file.svelte.js';

export default (state, value) => $effect.root(() => {
  $effect(() => { if (file.id !== null && !(file.id in state)) state[file.id] = value });
});
