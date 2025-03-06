import save from '$lib/util/save.svelte.js';

const menu = $state({ open: true });

save('menu', menu);

export default menu;
