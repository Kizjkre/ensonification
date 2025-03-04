import color from '$lib/state/color.svelte.js';
import domain from '$lib/state/domain.svelte.js';
import file from '$lib/state/file.svelte.js';
import matrix from '$lib/state/matrix.svelte.js';
import measure from '$lib/state/measure.svelte.js';
import mode, { MODE } from '$lib/state/mode.svelte.js';
import range from '$lib/state/range.svelte.js';
import samples from '$lib/state/samples.svelte.js';
import status from '$lib/state/status.svelte.js';
import x from '$lib/state/x.svelte.js';
import y from '$lib/state/y.svelte.js';
import morph from '$lib/util/morph.js?url';

export const ctx = new AudioContext();

export const buffers = {};

let readSample = null;
let readData = null;
let d = null;
const s = $state([]);
const coords = $state(new Set());

$effect.root(() => {
  $effect(async () => {
    // NOTE: Trigger reactivity
    // noinspection BadExpressionStatementJS
    matrix[0];
    Object.values(samples).forEach(s => s); // NOTE: seems sus?

    coords.clear();

    readSample ??= (await import('$lib/util/samples.js')).read;

    matrix.slice(1).forEach((y, i) => {
      i++;
      y.slice(1).forEach(async (sample, j) => {
        if (sample === '') return;

        j++;

        try {
          const x = domain.values[matrix[0][j]];
          const y = range.values[matrix[i][0]];

          const buffer = await (await readSample(samples[sample])).arrayBuffer();
          s[y] ??= [];
          s[y][x] = await ctx.decodeAudioData(buffer);
          coords.add({ x, y });
        } catch {}
      });
    });
  });

  $effect(async () => {
    const m = measure.value - 2;
    if (m < 0) return;
    // noinspection BadExpressionStatementJS
    s; // NOTE: Trigger reactivity

    readData ??= (await import('$lib/util/data.js')).read;
    d ??= (await readData(file.id));

    const current = d.data.filter(row => row[d.columns[x[file.id]]] === m).map(row => ({
      y: row[d.columns[y[file.id]]],
      color: row[d.columns[color[file.id]]]
    }));

    switch (mode[file.id]) {
      case MODE.BLOCK:
        current.forEach(({ y, color }) => {
          try {
            const node = new AudioBufferSourceNode(ctx, { buffer: s[domain.values[color]][range.values[y]] });
            node.connect(ctx.destination);
            node.start();
          } catch {}
        });
        break;
      case MODE.LINE:
        // NOTE: disable spectral morphing for now
        // await ctx.audioWorklet.addModule(morph);
        //
        // current.forEach(({ y, color }) => {
        //   const near = [...coords].toSorted((a, b) => Math.sqrt((a.x - domain.values[color]) ** 2 + (a.y - range.values[y]) ** 2) - Math.sqrt((b.x - domain.values[color]) ** 2 + (b.y - range.values[y]) ** 2));
        //   const factor = Math.sqrt((near[0].x - domain.values[color]) ** 2 + (near[0].y - range.values[y]) ** 2) / Math.sqrt((near[0].x - near[1].x) ** 2 + (near[0].y - near[1].y) ** 2);
        //
        //   const node = new AudioWorkletNode(ctx, 'spectral-morph-processor', { outputChannelCount: [1] });
        //   // NOTE: mono only for now
        //   node.port.postMessage({ type: 'buffers', bufferA: s[near[0].y][near[0].x].getChannelData(0), bufferB: s[near[1].y][near[1].x].getChannelData(0) });
        //   node.port.postMessage({ type: 'morphFactor', value: factor });
        //   node.port.postMessage({ type: 'process' });
        //   node.connect(ctx.destination);
        // });
        break;
    }
  });
});
