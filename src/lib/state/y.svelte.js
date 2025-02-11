import defaults from '$lib/util/defaults.svelte.js';
import save from '$lib/util/save.svelte.js';

const y = $state({});

defaults(y, 1);
save('y', y);

export default y;
