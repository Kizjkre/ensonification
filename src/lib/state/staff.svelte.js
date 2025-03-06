import defaults from '$lib/util/defaults.svelte.js';
import save from '$lib/util/save.svelte.js';

const staff = $state({});

defaults(staff, 1);
save('staff', staff);

export default staff;
