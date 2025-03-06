import save from '$lib/util/save.svelte.js';

const matrix = $state([[]]);

save('matrix', matrix);

export default matrix;
