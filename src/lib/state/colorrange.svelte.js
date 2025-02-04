import save from '$lib/util/save.svelte.js';

const colorrangeSvelte = $state({ min: 0, max: 1 });

save('colorrange', colorrangeSvelte);

export default colorrangeSvelte;
