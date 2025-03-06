import save from '$lib/util/save.svelte.js';

const status = $state({ playing: false });

save('status', status);

export default status;
