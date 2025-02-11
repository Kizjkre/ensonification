import defaults from '$lib/util/defaults.svelte.js';
import save from '$lib/util/save.svelte.js';

const colorrange = $state({});

defaults(colorrange, { min: 0, max: 1 })
save('colorrange', colorrange);

export default colorrange;
