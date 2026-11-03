<script>
  import bpm from '$lib/state/bpm.svelte.js';
  import colorstate from '$lib/state/color.svelte.js';
  import colorrange from '$lib/state/colorrange.svelte.js';
  import cutoff from '$lib/state/cutoff.svelte.js';
  import domain from '$lib/state/domain.svelte.js';
  import file from '$lib/state/file.svelte.js';
  import livePoints from '$lib/state/live-points.svelte.js';
  import measure from '$lib/state/measure.svelte.js';
  import menu from '$lib/state/menu.svelte.js';
  import mode, { MODE } from '$lib/state/mode.svelte.js';
  import range from '$lib/state/range.svelte.js';
  import scale from '$lib/state/scale.svelte.js';
  import server from '$lib/state/server.svelte.js';
  import scroll from '$lib/state/scroll.svelte.js';
  import staff from '$lib/state/staff.svelte.js';
  import status from '$lib/state/status.svelte.js';
  import xstate from '$lib/state/x.svelte.js';
  import ystate from '$lib/state/y.svelte.js';
  import { colorComponents, createPalette } from '$lib/util/score/color.js';
  import { buildPlayheadPoints, filterScoreData, prepareScoreValues } from '$lib/util/score/data.js';
  import { createPlayheadGeometry, createScoreColors, createScoreGeometry } from '$lib/util/score/geometry.js';
  import { getHoveredDatum } from '$lib/util/score/interaction.js';
  import { createPlayheadNotifier } from '$lib/util/score/playback.js';
  import { createXLayout, createYScale, getScrollCoordinate } from '$lib/util/score/scales.js';
  import createScoreRenderer from '$lib/util/score/renderer.js';
  import * as d3 from 'd3';
  import { onMount, untrack } from 'svelte';

  let container = $state(null);
  let canvas = $state(null);
  let backgroundSample = $state(null);
  let staffColorSample = $state(null);
  let renderer = $state(null);
  let renderError = $state(null);
  let backgroundColor = [1, 1, 1, 1];
  let staffColor = [0.8, 0.8, 0.8, 1];

  let height = $state(0);
  let width = $state(0);
  let position = $state(0);
  let coverOpacity = $state(1);
  let colorSchemeVersion = $state(0);
  let dragging = $state(false);
  let hoveredDatum = $state(null);
  let dragStartX = 0;
  let dragStartScale = 1;

  let read = $state(null);
  let raw = $state({ data: [], columns: [] });
  let ready = $state(false);
  onMount(async () => read = (await import('$lib/util/data.js')).read);

  $effect(async () => {
    const id = file.id;
    if (!read || !id) {
      ready = false;
      raw = { data: [], columns: [] };
      return;
    }

    ready = false;
    const next = await read(id);
    if (file.id !== id) return;
    raw = next;
    await new Promise(r => setTimeout(r, 10));
    if (file.id === id) ready = true;
  });

  const appendedPoints = $derived(livePoints.fileId === file.id ? livePoints.points : []);
  const values = $derived.by(() => prepareScoreValues({
    raw,
    appendedPoints,
    xColumn: xstate[file.id],
    yColumn: ystate[file.id],
    colorColumn: colorstate[file.id]
  }));
  const xraw = $derived(values.x);
  const yraw = $derived(values.y);
  const colorraw = $derived(values.color);

  $effect(() => {
    range.values = values.yMap;
  });
  $effect(() => {
    domain.values = values.colorMap;
  });

  const filtered = $derived.by(() => filterScoreData(xraw, yraw, colorraw, raw.data.length));
  const validIndices = $derived(filtered.validIndices);
  const baseXCount = $derived(filtered.baseXCount);
  const x = $derived(filtered.x);
  const y = $derived(filtered.y);
  const color = $derived(filtered.color);
  const coords = $derived(filtered.coords);

  const xLayout = $derived.by(() => createXLayout({
    x, coords, width, baseXCount, scrollEnabled: scroll[file.id]
  }));
  const xdomain = $derived(xLayout.xdomain);
  const xscale = $derived(xLayout.xscale);
  const blockOrder = $derived(xLayout.blockOrder);
  const bandwidth = $derived(xLayout.bandwidth);
  const padding = $derived(xLayout.padding);
  const xmin = 5;
  const yscale = $derived(createYScale({ mode: mode[file.id], y, height, blockMode: MODE.BLOCK, lineMode: MODE.LINE }));
  const ymin = 2;

  const colordomain = $derived(d3.extent(color || []));
  const selectedColorRange = $derived(colorrange[file.id] || { min: 0, max: 1 });
  const dataScale = $derived(scroll[file.id] && Number.isFinite(scale[file.id]) && scale[file.id] > 0 ? scale[file.id] : 1);
  const scrollOffset = $derived(scroll[file.id]
    ? width * 0.3 + padding / 2 - getScrollCoordinate(measure.value + position, xscale, xdomain, bandwidth) * dataScale
    : 0);
  const playheadPoints = $derived.by(() => {
    return buildPlayheadPoints({
      coords,
      validIndices,
      raw,
      appendedPoints,
      xColumn: xstate[file.id],
      yColumn: ystate[file.id],
      colorColumn: colorstate[file.id],
      xValues: xraw,
      xscale,
      bandwidth
    });
  });

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const palette = createPalette();

  const handleResize = () => {
    if (!container) return;

    const rect = container.getBoundingClientRect();
    height = rect.height;
    width = rect.width;
    renderer?.resize(width, height, window.devicePixelRatio || 1);
  };

  onMount(() => {
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const updateThemeColors = () => {
      backgroundColor = colorComponents(getComputedStyle(backgroundSample).backgroundColor);
      staffColor = colorComponents(getComputedStyle(staffColorSample).backgroundColor);
      colorSchemeVersion++;
    };
    const handleColorSchemeChange = () => updateThemeColors();
    colorScheme.addEventListener('change', handleColorSchemeChange);

    let observer;
    try {
      renderer = createScoreRenderer(canvas, palette);
      updateThemeColors();
      handleResize();
      observer = new ResizeObserver(handleResize);
      observer.observe(container);
    } catch (error) {
      renderError = error instanceof Error ? error.message : String(error);
    }

    return () => {
      observer?.disconnect();
      colorScheme.removeEventListener('change', handleColorSchemeChange);
      renderer?.destroy();
    };
  });

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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

  const handlePointerDown = event => {
    if (!scroll[file.id] || event.button !== 0) return;

    event.preventDefault();
    dragging = true;
    dragStartX = event.clientX;
    dragStartScale = dataScale;
    canvas.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = event => {
    if (dragging) {
      if (!width) return;

      scale[file.id] = Math.min(
        100,
        Math.max(0.05, dragStartScale * Math.exp((event.clientX - dragStartX) / width))
      );
      hoveredDatum = null;
      return;
    }

    if (!menu.open || !file.id || !ready || !width || !height) {
      hoveredDatum = null;
      return;
    }

    hoveredDatum = getHoveredDatum({
      event,
      canvas,
      enabled: menu.open && Boolean(file.id) && ready,
      width,
      height,
      mode: mode[file.id],
      blockMode: MODE.BLOCK,
      lineMode: MODE.LINE,
      coords,
      blockOrder,
      xscale,
      yscale,
      dataScale,
      scrollOffset,
      padding,
      scrollEnabled: scroll[file.id],
      xmin,
      ymin,
      validIndices,
      raw,
      appendedPoints,
      xColumn: xstate[file.id],
      yColumn: ystate[file.id],
      colorColumn: colorstate[file.id],
      xValues: xraw
    });
  };

  const handlePointerUp = () => {
    dragging = false;
  };

  const handlePointerLeave = () => {
    hoveredDatum = null;
  };

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  let audio;
  onMount(async () => audio = await import('$lib/util/audio.svelte.js'));

  const TRANSITION_DURATION = 0;

  let t = -1;
  const playheadNotifier = createPlayheadNotifier(() => server.connected);

  const start = () => {
    if (!file.id) {
      t = -1;
      measure.value = 0;
      position = 0;
      playheadNotifier.reset();
      renderer?.clear();
      return;
    }

    t === -1 && (t = audio.ctx.currentTime);
    audio.ctx.currentTime - t > 60 / bpm[file.id] - TRANSITION_DURATION / 1000 && (t += 60 / bpm[file.id]) && measure.value++;
    position = ((audio.ctx.currentTime - t) * bpm[file.id] / 60) % 1;
    const progress = scroll[file.id]
      ? getScrollCoordinate(measure.value + position, xscale, xdomain, bandwidth) / bandwidth
      : measure.value + position;
    playheadNotifier.notify(file.id, progress, playheadPoints, cutoff.value, appendedPoints.length);
    status.playing && requestAnimationFrame(start);
    if (!status.playing) {
      t = -1;
      measure.value = 0;
      position = 0;
      playheadNotifier.reset();
    }
  };

  $effect(async () => {
    if (status.playing) {
      await audio.ctx.resume();
      requestAnimationFrame(start);
    }
  });

  $effect(() => {
    if (!ready) {
      coverOpacity = 1;
      return;
    }

    const initialOpacity = untrack(() => coverOpacity);
    const startTime = performance.now();
    let frame;
    const animate = now => {
      const progress = Math.min((now - startTime) / 750, 1);
      coverOpacity = initialOpacity * (1 - progress);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  });

  $effect(() => {
    const instance = renderer;
    if (!instance || !file.id || !ready || !width || !height) return;

    const { staffRects, rectangles, lines } = createScoreGeometry({
      lineMode: mode[file.id] === MODE.LINE,
      staffCount: staff[file.id],
      height,
      width,
      coords,
      blockOrder,
      xscale,
      yscale,
      xmin,
      ymin
    });
    instance.setGeometry(staffRects, rectangles, lines);
    untrack(draw);
  });

  $effect(() => {
    const instance = renderer;
    if (!instance || !file.id || !ready) return;

    const { lineColors, blockColors } = createScoreColors(color, blockOrder);
    instance.setColors(lineColors, blockColors);
    untrack(draw);
  });

  const draw = () => {
    if (!renderer) return;
    if (!file.id) {
      renderer.clear();
      return;
    }

    const playheads = createPlayheadGeometry({
      scrollEnabled: scroll[file.id],
      width,
      height,
      padding,
      position,
      bandwidth,
      dataScale,
      measure: measure.value
    });

    renderer.draw({
      coverColor: backgroundColor,
      coverOpacity,
      staffColor,
      playheads,
      colorDomain: colordomain[0] == null ? [0, 1] : colordomain,
      colorRange: [selectedColorRange.min, selectedColorRange.max],
      scrollOffset,
      dataScale: scroll[file.id] ? dataScale : 1,
      blockGap: scroll[file.id] ? padding : 0
    });
  };

  $effect(() => {
    colorSchemeVersion;
    file.id;
    measure.value;
    position;
    scroll[file.id];
    scale[file.id];
    width;
    height;
    draw();
  });
</script>

<svelte:window onkeydown={handleKeyDown} onresize={handleResize} />

<div bind:this={container} class="relative h-full overflow-hidden">
  <canvas
    bind:this={canvas}
    class="block h-full w-full"
    class:cursor-ew-resize={scroll[file.id] && !dragging}
    class:cursor-crosshair={!scroll[file.id] && hoveredDatum}
    class:cursor-grabbing={dragging}
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerleave={handlePointerLeave}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
    onlostpointercapture={handlePointerUp}
  ></canvas>
  {#if menu.open && hoveredDatum}
    <div
      role="tooltip"
      class="absolute pointer-events-none z-10 max-w-48 break-all rounded bg-gray-900 px-2 py-1 text-xs text-white shadow"
      style:left="{hoveredDatum.left}px"
      style:top="{hoveredDatum.top}px"
    >{hoveredDatum.value}</div>
  {/if}
  <div bind:this={backgroundSample} aria-hidden="true"
       class="pointer-events-none absolute h-px w-px bg-white opacity-0 dark:bg-gray-800"></div>
  <div bind:this={staffColorSample} aria-hidden="true"
       class="pointer-events-none absolute h-px w-px bg-gray-300 opacity-0 dark:bg-gray-700"></div>
  {#if renderError}
    <div role="alert"
         class="absolute inset-0 grid place-items-center bg-white p-4 text-center text-red-600 dark:bg-gray-800">
      Unable to render the score: {renderError}
    </div>
  {/if}
</div>
