// noinspection JSConstantReassignment

import { data, state } from '$lib/state/state.svelte.js';
import autotype from '$lib/utils/autotype.js';
import { autoType, csvParse } from 'd3';

state.data.add = async files => {
  for await (const file of files) {
    const d = structuredClone(data);
    d.name = file.name;
    d.data = csvParse(await file.text(), autoType);
    d.columns = Object.fromEntries(Object.entries(autotype(d.data)).map(([col, { type }]) => [col, type]));
    d.id = state.utils.free.data.shift() ?? state.data.length;

    state.data[d.id] = d;
  }
}
