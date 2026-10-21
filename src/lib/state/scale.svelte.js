import defaults from '$lib/util/defaults.svelte.js';
import save from '$lib/util/save.svelte.js';

const scale = $state({});

defaults(scale, 1);
save('scale', scale);

export default scale;
