import defaults from '$lib/util/defaults.svelte.js';
import save from '$lib/util/save.svelte.js';

const scroll = $state({});

defaults(scroll, false);
save('scroll', scroll);

export default scroll;
