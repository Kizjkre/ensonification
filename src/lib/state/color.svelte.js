import defaults from '$lib/util/defaults.svelte.js';
import save from '$lib/util/save.svelte.js';

const color = $state({});

defaults(color, 2);
save('color', color);

export default color;
