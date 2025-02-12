import bpm from '$lib/state/bpm.svelte.js';
import color from '$lib/state/color.svelte.js';
import colorrange from '$lib/state/colorrange.svelte.js';
import file from '$lib/state/file.svelte.js';
import mode from '$lib/state/mode.svelte.js';
import staff from '$lib/state/staff.svelte.js';
import x from '$lib/state/x.svelte.js';
import y from '$lib/state/y.svelte.js';
import save from '$lib/util/save.svelte.js';
import { onMount } from 'svelte';

let fsadd = $state(null);
let fsremove = $state(null);

export const init = () => onMount(async () => {
  const { add, remove } = await import('$lib/util/data.js');
  fsadd = add;
  fsremove = remove;
});

export const data = $state({});

export const add = (name, d) => {
  const id = Date.now();
  data[id] = name;
  file.id = id;
  fsadd(id, JSON.stringify({ data: d, columns: d.columns }));
  return id;
};

export const remove = id => {
  delete data[id];
  delete bpm[id];
  delete color[id];
  delete colorrange[id];
  delete mode[id];
  delete staff[id];
  delete x[id];
  delete y[id];

  fsremove(id);

  file.id = null;
};

save('data', data);
