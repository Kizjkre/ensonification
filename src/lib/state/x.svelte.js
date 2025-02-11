import save from '$lib/util/save.svelte.js';
import defaults from '$lib/util/defaults.svelte.js';

const x = $state({});

defaults(x, 0);
save('x', x);

export default x;
