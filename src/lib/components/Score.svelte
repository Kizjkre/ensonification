<script>
  import bpm from '$lib/state/bpm.svelte.js';
  import colorstate from '$lib/state/color.svelte.js';
  import colorrange from '$lib/state/colorrange.svelte.js';
  import domain from '$lib/state/domain.svelte.js';
  import file from '$lib/state/file.svelte.js';
  import measure from '$lib/state/measure.svelte.js';
  import mode, { MODE } from '$lib/state/mode.svelte.js';
  import range from '$lib/state/range.svelte.js';
  import staff from '$lib/state/staff.svelte.js';
  import status from '$lib/state/status.svelte.js';
  import xstate from '$lib/state/x.svelte.js';
  import ystate from '$lib/state/y.svelte.js';
  import atoi from '$lib/util/atoi.js';
  import * as d3 from 'd3';
  import { onMount } from 'svelte';

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  let div = $state(null);

  let height = $state(0);
  let width = $state(0);

  let position = $state(0);

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  let read = $state(null);
  let raw = $state({ data: [], columns: [] });
  let ready = $state(false);
  onMount(async () => read = (await import('$lib/util/data.js')).read);

  $effect(async () => {
    if (!read || !file.id) return;

    ready = false;
    raw = await read(file.id);
    await new Promise(r => setTimeout(r, 10));
    ready = true;
  });

  const ytransform = $derived(atoi(raw?.data.map(d => d[raw.columns[ystate[file.id]]]) || []));
  const colortransform = $derived(atoi(raw?.data.map(d => d[raw.columns[colorstate[file.id]]]) || []));

  const xraw = $derived(xstate[file.id] !== -1 ? atoi(raw?.data.map(d => d[raw.columns[xstate[file.id]]]) || []).out : raw.data.map((_, i) => i));
  const yraw = $derived(ytransform.out);
  const colorraw = $derived(colortransform.out);

  $effect(() => { range.values = ytransform.map });
  $effect(() => { domain.values = colortransform.map });

  const nulls = $derived(
    new Set(
      Array(Math.min(xraw?.length, yraw?.length, colorraw?.length))
        .fill()
        .map((_, i) => i)
        .filter((_, i) => isNaN(xraw[i]) || isNaN(yraw[i]) || isNaN(colorraw[i]) || xraw[i] === null || yraw[i] === null || colorraw[i] === null)
    )
  );

  const x = $derived(xraw.filter((_, i) => !nulls.has(i)));
  const y = $derived(yraw.filter((_, i) => !nulls.has(i)));
  const color = $derived(colorraw.filter((_, i) => !nulls.has(i)));
  const coords = $derived(x.map((d, i) => ({ x: d, y: y[i] })));

  const xdomain = $derived([...new Set(x)]);
  const xpad = $derived(0.1 / 50 * (xdomain.length + 2));
  const xscale = $derived.by(() => {
    xdomain.sort((a, b) => a - b);

    return d3.scaleBand()
      .domain([xdomain[0] - 2, xdomain[0] - 1, ...xdomain])
      .range([0, width])
      .padding(xpad);
  });
  const xmin = 5;
  const bandwidth = $derived(xscale.bandwidth() === 0 ? width / (xdomain.length + 2) : xscale.bandwidth() / (1 - xpad));
  const padding = $derived.by(() => {
    const padding = xpad * bandwidth;
    return padding < 1 ? 1 : padding;
  });

  const ypad = 0.01;
  const yscale = $derived.by(() => {
    switch (mode[file.id]) {
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
  const ymin = 2;

  const colordomain = $derived(d3.extent(color || []));
  const colorfunc = $derived(c =>
    d3.interpolateTurbo((c - colordomain[0]) / (colordomain[1] - colordomain[0]) * (colorrange[file.id].max - colorrange[file.id].min) + colorrange[file.id].min));

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  onMount(() => new ResizeObserver(handleResize).observe(div));

  const handleKeyDown = e => {
    if (!file.id) return;

    switch (e.key) {
      case ' ':
        if (status.playing) break;
        measure.value++;
        break;
      case 'Backspace':
        if (status.playing) break;
        measure.value--;
        break;
      case 'Enter':
        if (status.playing) break;
        measure.value = 0;
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
  onMount(async () => audio = await import('$lib/util/audio.svelte.js'));

  const TRANSITION_DURATION = 0;

  let t = -1;
  const start = () => {
    t === -1 && (t = audio.ctx.currentTime);
    audio.ctx.currentTime - t > 60 / bpm[file.id] - TRANSITION_DURATION / 1000 && (t += 60 / bpm[file.id]) && measure.value++;
    position = ((audio.ctx.currentTime - t) * bpm[file.id] / 60) % 1;
    status.playing && requestAnimationFrame(start);
    !status.playing && (t = -1) && (measure.value = (position = 0));
  };

  $effect(async () => {
    if (status.playing) {
      await audio.ctx.resume();
      requestAnimationFrame(start);
    }
  });

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  let fragment;
  onMount(() => fragment = document.createDocumentFragment());

  let g;
  let points = $state([]);
  $effect(() => {
    if (!points.length || !color.length) return;

    switch (mode[file.id]) {
      case MODE.BLOCK:
        color.forEach((c, i) => points[i].setAttribute('fill', colorfunc(c)));
        break;
      case MODE.LINE:
        color.forEach((c, i) => points[i].setAttribute('stroke', colorfunc(c)));
        break;

    }
  });

  $effect(() => {
    if (!coords || !fragment || !g || !ready) return;

    const temp = [];

    switch (mode[file.id]) {
      case MODE.BLOCK:
        coords.forEach(({ x, y }) => {
          const width = xscale.bandwidth();
          const height = yscale.bandwidth();

          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('height', height < ymin ? ymin : height);
          rect.setAttribute('width', width < xmin ? xmin : width);
          rect.setAttribute('x', xscale(x) - +(width < 5) * xmin / 2);
          rect.setAttribute('y', yscale(y) - +(height < 2) * ymin / 2);
          fragment.appendChild(rect);

          temp.push(rect);
        });
        break;
      case MODE.LINE:
        coords.forEach(({ x, y }, i) => {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('stroke-linecap', 'round');
          line.setAttribute('stroke-width', '10');
          line.setAttribute('x1', xscale(x));
          line.setAttribute('x2', xscale(i + 1 >= coords.length ? x : coords[i + 1].x));
          line.setAttribute('y1', yscale(y));
          line.setAttribute('y2', yscale(i + 1 >= coords.length ? y : coords[i + 1].y));
          fragment.appendChild(line);

          temp.push(line);
        });
        break;
    }

    points = temp;

    g.replaceChildren(fragment);
  });
</script>

<svelte:window onkeydown={handleKeyDown} onresize={handleResize} />

<div bind:this={div} class="h-full">
  <svg {height} {width}>
    <g>
      {#each Array(staff[file.id]).fill() as _, i (i)}
        {#if i > 0 && ready}
          <line
            class="dark:stroke-gray-700 stroke-gray-300"
            stroke-width="5"
            x1="0"
            x2={width}
            y1={height / staff[file.id] * i}
            y2={height / staff[file.id] * i}
          ></line>
        {/if}
      {/each}
    </g>
    <g bind:this={g}></g>
    <rect class="dark:fill-gray-800 duration-750 fill-white transition" class:opacity-0={ready} {height} {width} x="0" y="0"></rect>
    <rect class="fill-red-400" {height} width={padding} x={measure.value * bandwidth} y="0"></rect>
    <rect class="fill-red-400/50" {height} width={padding} x={(measure.value + position) * bandwidth} y="0"></rect>
  </svg>
</div>
