import bpm from '$lib/state/bpm.svelte.js';
import color from '$lib/state/color.svelte.js';
import colorrange from '$lib/state/colorrange.svelte.js';
import { data } from '$lib/state/data.svelte.js';
import file from '$lib/state/file.svelte.js';
import load from '$lib/state/load.svelte.js';
import matrix from '$lib/state/matrix.svelte.js';
import menu from '$lib/state/menu.svelte.js';
import mode from '$lib/state/mode.svelte.js';
import samples from '$lib/state/samples.svelte.js';
import staff from '$lib/state/staff.svelte.js';
import x from '$lib/state/x.svelte.js';
import y from '$lib/state/y.svelte.js';
import { onMount } from 'svelte';

const get = key => JSON.parse(localStorage.getItem(key));

export default () => onMount(() => {
  Object.assign(bpm, get('bpm'));
  Object.assign(color, get('color'));
  Object.assign(colorrange, get('colorrange'));
  Object.assign(data, get('data'));
  Object.assign(file, get('file'));
  Object.assign(matrix, get('matrix'));
  Object.assign(menu, get('menu'));
  Object.assign(mode, get('mode'));
  Object.assign(samples, get('samples'));
  Object.assign(staff, get('staff'));
  Object.assign(x, get('x'));
  Object.assign(y, get('y'));

  load.value = true;
});
