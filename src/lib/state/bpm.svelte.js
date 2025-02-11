import defaults from '$lib/util/defaults.svelte.js';
import save from '$lib/util/save.svelte.js';

const bpm = $state({});

defaults(bpm, 60);
save('bpm', bpm);

export default bpm;
