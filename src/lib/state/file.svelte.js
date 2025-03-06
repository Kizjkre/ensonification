import save from '$lib/util/save.svelte.js';

const file = $state({ id: null });

save('file', file);

export default file;
