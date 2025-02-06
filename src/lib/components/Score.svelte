<script>
  import bpm from '$lib/state/bpm.svelte.js';
  import colorrange from '$lib/state/colorrange.svelte.js';
  import { data } from '$lib/state/data.svelte.js';
  import file from '$lib/state/file.svelte.js';
  import mode, { MODE } from '$lib/state/mode.svelte.js';
  import status from '$lib/state/status.svelte.js';
  import atoi from '$lib/util/atoi.js';
  import * as d3 from 'd3';
  import { onMount } from 'svelte';

  let audio;
  onMount(async () => audio = await import('../util/audio.js'));

  const TRANSITION_DURATION = 50;

  const ypad = 0.01;

  let div, svg;
  let height = $state(400), width = $state(600);
  let measure = $state(0), position = $state(0);

  const xraw = $derived(atoi(data[file.id]?.data.map(d => d[data[file.id].columns[data[file.id].x]]) || []));
  const yraw = $derived(atoi(data[file.id]?.data.map(d => d[data[file.id].columns[data[file.id].y]]) || []));
  const colorraw = $derived(atoi(data[file.id]?.data.map(d => d[data[file.id].columns[data[file.id].color]]) || []));

  const nulls = $derived(
    new Set(
      Array(xraw?.length)
        .fill()
        .map((_, i) => i)
        .filter((_, i) => xraw[i] === null || yraw[i] === null || colorraw[i] === null)
    )
  );

  const x = $derived(xraw.filter((_, i) => !nulls.has(i)));
  const y = $derived(yraw.filter((_, i) => !nulls.has(i)));
  const color = $derived(colorraw.filter((_, i) => !nulls.has(i)));

  const colordomain = $derived(d3.extent(color || []));
  const colorfunc = $derived((_, i) =>
    d3.interpolateTurbo((color[i] - colordomain[0]) / (colordomain[1] - colordomain[0]) * (colorrange.max - colorrange.min) + colorrange.min));

  const xdomain = $derived(data[file.id]?.x !== -1 ? [...new Set(x)] : data[file.id]?.data.map((_, i) => i).filter((_, i) => !nulls.has(i)) || []);
  const xpad = $derived(0.1 / (50 * xdomain.length));
  const xscale = $derived.by(() => {
    xdomain.sort((a, b) => a - b);

    return d3.scaleBand()
      .domain([xdomain[0] - 2, xdomain[0] - 1, ...xdomain])
      .range([0, width])
      .padding(xpad)
  });

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
          .range([height, 0]);
    }
  });
  const bandwidth = $derived(xscale.bandwidth() / (1 - xpad));
  const padding = $derived(xpad * bandwidth);

  // noinspection JSVoidFunctionReturnValueUsed
  onMount(() => {
    handleResize();

    d3.select(svg)
      .selectAll('g#data')
      .data([null])
      .join('g')
      .attr('id', 'data');

    d3.select(svg)
      .selectAll('rect#seeker-continuous')
      .data([null])
      .join('rect')
      .attr('id', 'seeker-continuous')
      .attr('x', measure * bandwidth)
      .attr('y', 0)
      .attr('width', padding)
      .attr('height', height);

    d3.select(svg)
      .selectAll('rect#seeker')
      .data([null])
      .join('rect')
      .attr('id', 'seeker')
      .attr('x', measure * bandwidth)
      .attr('y', 0)
      .attr('width', padding)
      .attr('height', height)
      .attr('fill', 'red');

    const observer = new ResizeObserver(handleResize);
    observer.observe(div);
  });

  $effect(() => {
    switch (mode.value) {
      case MODE.BLOCK:
        d3.select('g#data')
          .selectAll('path')
          .data([])
          .join('path');

        d3.select('g#data')
          .selectAll('rect')
          .data(y || [])
          .join('rect')
          .attr('x', (_, i) => xscale(data[file.id]?.x === -1 ? i : x[i]))
          .attr('y', d => yscale(d))
          .attr('width', xscale.bandwidth())
          .attr('height', yscale.bandwidth())
          .attr('fill', colorfunc);
        break;
      case MODE.LINE:
        d3.select('g#data')
          .selectAll('rect')
          .data([])
          .join('rect');

        const line = d3.line()
          .x(([_, i]) => {
            const scaled = xscale(data[file.id]?.x === -1 ? i : x[i] || x[i - 1]);
            return isNaN(scaled) ? xscale(i - 1) : scaled;
          })
          .y(([d]) => yscale(d));

        d3.select('g#data')
          .selectAll('path')
          .data(y?.map((d, i) => i < y.length - 1 ? [[d, i], [y[i + 1], i + 1]] : [[d, i], [d, i + 1]]) || [])
          .join('path')
          .attr('d', d => line(d))
          .attr('fill', 'none')
          .attr('stroke', colorfunc)
          .attr('stroke-width', 15)
          .attr('stroke-linecap', 'round');
        break;
    }
  });

  $effect(() =>
    d3.select('rect#seeker')
      .attr('height', height)
      .attr('width', padding)
      .transition()
      .duration(TRANSITION_DURATION)
      .attr('x', measure * bandwidth)
  );

  $effect(() =>
    d3.select('rect#seeker-continuous')
      .attr('height', height)
      .attr('width', padding)
      .attr('x', (position + measure) * bandwidth)
  );

  $effect(() =>
    d3.select('rect#seeker-continuous')
      .attr('fill', status.playing ? '#FF000080' : 'transparent')
  )

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
    if (!svg) return;

    const rect = svg.parentElement.getBoundingClientRect();

    height = rect.height;
    width = rect.width;

    d3.select(svg)
      .attr('width', width)
      .attr('height', height);
  };

  let t = -1;
  const start = () => {
    t === -1 && (t = audio.ctx.currentTime);
    audio.ctx.currentTime - t > 60 / bpm.value - TRANSITION_DURATION / 1000 && (t += 60 / bpm.value) && measure++;
    position = (audio.ctx.currentTime - t) * bpm.value / 60;
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
  <svg bind:this={svg} class="absolute top-0"></svg>
</div>
