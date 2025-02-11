<script>
  import bpm from '$lib/state/bpm.svelte.js';
  import file from '$lib/state/file.svelte.js';
  import status from '$lib/state/status.svelte.js';
  import { onMount } from 'svelte';
  import colorrange from '$lib/state/colorrange.svelte.js';
  import { data } from '$lib/state/data.svelte.js';
  import mode, { MODE } from '$lib/state/mode.svelte.js';
  import atoi from '$lib/util/atoi.js';
  import * as d3 from 'd3';

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  let div = $state(null);

  let height = $state(0);
  let width = $state(0);

  let measure = $state(0);
  let position = $state(0);

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const xraw = $derived(data[file.id]?.x !== -1 ? atoi(data[file.id]?.data.map(d => d[data[file.id].columns[data[file.id].x]]) || []) : data[file.id]?.data.map((_, i) => i));
  const yraw = $derived(atoi(data[file.id]?.data.map(d => d[data[file.id].columns[data[file.id].y]]) || []));
  const colorraw = $derived(atoi(data[file.id]?.data.map(d => d[data[file.id].columns[data[file.id].color]]) || []));

  const nulls = $derived(
    new Set(
      Array(Math.min(xraw?.length, yraw?.length, colorraw?.length))
        .fill()
        .map((_, i) => i)
        .filter((_, i) => isNaN(xraw[i]) || isNaN(yraw[i]) || isNaN(colorraw[i]) || xraw[i] === null || yraw[i] === null || colorraw[i] === null)
    )
  );

  const x = $derived(xraw.length > 0 ? xraw.filter((_, i) => !nulls.has(i)) : Array(Math.min(yraw.length, colorraw.length) - nulls.size).fill().map((_, i) => i));
  const y = $derived(yraw.filter((_, i) => !nulls.has(i)));
  const color = $derived(colorraw.filter((_, i) => !nulls.has(i)));
  const zip = $derived(x.map((d, i) => ({ x: d, y: y[i], color: color[i] })));

  const xdomain = $derived([...new Set(x)]);
  const xpad = $derived(0.1 / 50 * (xdomain.length + 2));
  const xscale = $derived.by(() => {
    xdomain.sort((a, b) => a - b);

    return d3.scaleBand()
      .domain([xdomain[0] - 2, xdomain[0] - 1, ...xdomain])
      .range([0, width])
      .padding(xpad);
  });
  const bandwidth = $derived(xscale.bandwidth() === 0 ? width / (xdomain.length + 2) : xscale.bandwidth() / (1 - xpad));
  const padding = $derived.by(() => {
    const padding = xpad * bandwidth;
    return padding < 1 ? 1 : padding;
  });

  const ypad = 0.01;
  const yscale = $derived.by(() => {
    switch (mode.value) {
      case MODE.BLOCK:
        return d3.scaleBand()
          .domain([...new Set(y)].sort((a, b) => a - b))
          .range([height, 0])
          .padding(ypad);
      case MODE.LINE:
        return d3.scaleLinear()
          .domain(d3.extent(y))
          .range([height - 10 - ypad * 2, ypad * 2]);
    }
  });

  const colordomain = $derived(d3.extent(color || []));
  const colorfunc = $derived(c =>
    d3.interpolateTurbo((c - colordomain[0]) / (colordomain[1] - colordomain[0]) * (colorrange.max - colorrange.min) + colorrange.min));

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  onMount(() => new ResizeObserver(handleResize).observe(div));

  const handleKeyDown = e => {
    if (!file.id) return;

    switch (e.key) {
      case ' ':
        if (status.playing) break;
        measure++;
        break;
      case 'Backspace':
        if (status.playing) break;
        measure--;
        break;
      case 'Enter':
        if (status.playing) break;
        measure = 0;
        break;
      case 'Shift':
        status.playing = !status.playing;
        break;
    }
  };

  const handleResize = () => {
    if (!div) return;

    const rect = div.getBoundingClientRect();

    height = rect.height;
    width = rect.width;
  };

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  let audio;
  onMount(async () => audio = await import('../util/audio.js'));

  const TRANSITION_DURATION = 0;

  let t = -1;
  const start = () => {
    t === -1 && (t = audio.ctx.currentTime);
    audio.ctx.currentTime - t > 60 / bpm.value - TRANSITION_DURATION / 1000 && (t += 60 / bpm.value) && measure++;
    position = ((audio.ctx.currentTime - t) * bpm.value / 60) % 1;
    status.playing && requestAnimationFrame(start);
    !status.playing && (t = -1) && (measure = (position = 0));
  };

  $effect(async () => {
    if (status.playing) {
      await audio.ctx.resume();
      requestAnimationFrame(start);
    }
  });
</script>

<svelte:window onkeydown={handleKeyDown} onresize={handleResize} />

<div bind:this={div} class="h-full">
  <svg {height} {width}>
    <g>
      {#if mode.value === MODE.BLOCK}
        {#each zip as { x, y, color }, i (i)}
        	<rect fill={colorfunc(color)} height={yscale.bandwidth()} width={xscale.bandwidth()} x={xscale(x)} y={yscale(y)}></rect>
        {/each}
      {:else if mode.value === MODE.LINE}
        {#each zip as { x, y, color }, i (i)}
        	{#if i === zip.length - 1}
        		<line stroke={colorfunc(color)} stroke-linecap="round" stroke-width="10" x1={xscale(x)} x2={xscale(x)} y1={yscale(y)} y2={yscale(y)}></line>
        	{:else}
        		<line stroke={colorfunc(color)} stroke-linecap="round" stroke-width="10" x1={xscale(x)} x2={xscale(zip[i + 1].x)} y1={yscale(y)} y2={yscale(zip[i + 1].y)}></line>
        	{/if}
        {/each}
      {/if}
    </g>
    <rect fill="#ff0000" {height} width={padding} x={measure * bandwidth} y="0"></rect>
    <rect fill="#ff000080" {height} width={padding} x={(measure + position) * bandwidth} y="0"></rect>
  </svg>
</div>
