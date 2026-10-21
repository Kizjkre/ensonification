<script>
  import bpm from '$lib/state/bpm.svelte.js';
  import colorstate from '$lib/state/color.svelte.js';
  import colorrange from '$lib/state/colorrange.svelte.js';
  import domain from '$lib/state/domain.svelte.js';
  import file from '$lib/state/file.svelte.js';
  import livePoints from '$lib/state/live-points.svelte.js';
  import measure from '$lib/state/measure.svelte.js';
  import mode, { MODE } from '$lib/state/mode.svelte.js';
  import range from '$lib/state/range.svelte.js';
  import scale from '$lib/state/scale.svelte.js';
  import server from '$lib/state/server.svelte.js';
  import scroll from '$lib/state/scroll.svelte.js';
  import staff from '$lib/state/staff.svelte.js';
  import status from '$lib/state/status.svelte.js';
  import xstate from '$lib/state/x.svelte.js';
  import ystate from '$lib/state/y.svelte.js';
  import atoi from '$lib/util/atoi.js';
  import createScoreRenderer from '$lib/util/score-renderer.js';
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
  const yvalues = $derived([
    ...(raw?.data.map(d => d[raw.columns[ystate[file.id]]]) || []),
    ...appendedPoints.map(d => d.y)
  ]);
  const colorvalues = $derived([
    ...(raw?.data.map(d => d[raw.columns[colorstate[file.id]]]) || []),
    ...appendedPoints.map(d => d.color)
  ]);
  const ytransform = $derived(atoi(yvalues));
  const colortransform = $derived(atoi(colorvalues));

  const baseXraw = $derived(xstate[file.id] !== -1
    ? atoi(raw?.data.map(d => d[raw.columns[xstate[file.id]]]) || []).out
    : raw.data.map((_, i) => i));
  const xraw = $derived.by(() => {
    if (!appendedPoints.length) return baseXraw;

    const lastX = baseXraw.reduce((maximum, value) =>
      Number.isFinite(value) ? Math.max(maximum, value) : maximum, -1);
    return [...baseXraw, ...appendedPoints.map((_, i) => lastX + i + 1)];
  });
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

  const validIndices = $derived(
    Array.from({ length: Math.min(xraw?.length, yraw?.length, colorraw?.length) }, (_, i) => i)
      .filter(i => !nulls.has(i))
  );
  const baseXCount = $derived(new Set(
    validIndices
      .filter(i => i < raw.data.length)
      .map(i => xraw[i])
  ).size);
  const x = $derived(xraw.filter((_, i) => !nulls.has(i)));
  const y = $derived(yraw.filter((_, i) => !nulls.has(i)));
  const color = $derived(colorraw.filter((_, i) => !nulls.has(i)));
  const coords = $derived(x.map((d, i) => ({ x: d, y: y[i] })));

  const xdomain = $derived([...new Set(x)]);
  const xpad = $derived(0.1 / 50 * ((scroll[file.id] ? baseXCount : xdomain.length) + 2));
  const xscale = $derived.by(() => {
    xdomain.sort((a, b) => a - b);

    return d3.scaleBand()
      .domain([xdomain[0] - 2, xdomain[0] - 1, ...xdomain])
      .range([0, scroll[file.id]
        ? width * (xdomain.length + 2) / (baseXCount + 2)
        : width])
      .padding(xpad);
  });
  const blockOrder = $derived.by(() =>
    coords.map((_, i) => i).sort((a, b) => xscale(coords[a].x) - xscale(coords[b].x))
  );
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
  const selectedColorRange = $derived(colorrange[file.id] || { min: 0, max: 1 });
  const dataScale = $derived(scroll[file.id] && Number.isFinite(scale[file.id]) && scale[file.id] > 0 ? scale[file.id] : 1);
  const scrollCoordinate = progress => {
    const xValue = xdomain[0] + progress - 2;
    const mapped = xscale(xValue);
    if (Number.isFinite(mapped)) return mapped;

    const firstX = xdomain[0];
    const firstMapped = xscale(firstX);
    return Number.isFinite(firstMapped)
      ? firstMapped + (xValue - firstX) * bandwidth
      : progress * bandwidth;
  };
  const scrollOffset = $derived(scroll[file.id]
    ? width * 0.3 + padding / 2 - scrollCoordinate(measure.value + position) * dataScale
    : 0);
  const playheadPoints = $derived.by(() => {
    if (!bandwidth) return [];

    const xColumn = xstate[file.id];
    const yColumn = ystate[file.id];
    const colorColumn = colorstate[file.id];

    return coords.map((point, i) => {
      const index = validIndices[i];
      const row = raw.data[index];
      const appended = index >= raw.data.length ? appendedPoints[index - raw.data.length] : null;
      return {
        progress: xscale(point.x) / bandwidth,
        datum: {
          x: xColumn === -1 ? index : row ? row[raw.columns[xColumn]] : xraw[index],
          y: row ? row[raw.columns[yColumn]] : appended?.y,
          color: row ? row[raw.columns[colorColumn]] : appended?.color
        }
      };
    }).filter(point => Number.isFinite(point.progress))
      .sort((a, b) => a.progress - b.progress);
  });

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const colorComponents = value => {
    const parsed = d3.color(value);
    return parsed
      ? [parsed.r / 255, parsed.g / 255, parsed.b / 255, parsed.opacity]
      : [0, 0, 0, 0];
  };

  const palette = new Uint8Array(256 * 4);
  for (let i = 0; i < 256; i++) {
    const color = d3.color(d3.interpolateTurbo(i / 255));
    palette.set([color.r, color.g, color.b, 255], i * 4);
  }

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
    if (!dragging || !width) return;

    scale[file.id] = Math.min(
      100,
      Math.max(0.05, dragStartScale * Math.exp((event.clientX - dragStartX) / width))
    );
  };

  const handlePointerUp = () => {
    dragging = false;
  };

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  let audio;
  onMount(async () => audio = await import('$lib/util/audio.svelte.js'));

  const TRANSITION_DURATION = 0;

  let t = -1;
  let lastPlayheadProgress = null;
  let lastPlayheadFileId = null;

  const postDatum = async datum => {
    if (!server.connected) return;

    try {
      const response = await fetch('http://localhost:4433/datum', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datum)
      });

      if (!response.ok) {
        throw new Error(`POST /datum failed with status ${response.status}.`);
      }
    } catch (error) {
      console.error('Unable to send score datum to the local server:', error);
    }
  };

  const notifyCrossedPoints = currentProgress => {
    if (lastPlayheadFileId !== file.id) {
      lastPlayheadFileId = file.id;
      lastPlayheadProgress = null;
    }

    if (lastPlayheadProgress === null) {
      const epsilon = Math.max(1, Math.abs(currentProgress)) * Number.EPSILON * 4;
      lastPlayheadProgress = currentProgress - epsilon;
    }

    if (currentProgress < lastPlayheadProgress) {
      lastPlayheadProgress = currentProgress;
      return;
    }

    let low = 0;
    let high = playheadPoints.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (playheadPoints[middle].progress <= lastPlayheadProgress) low = middle + 1;
      else high = middle;
    }

    for (let i = low; i < playheadPoints.length && playheadPoints[i].progress <= currentProgress; i++) {
      void postDatum(playheadPoints[i].datum);
    }

    lastPlayheadProgress = currentProgress;
  };

  const start = () => {
    if (!file.id) {
      t = -1;
      measure.value = 0;
      position = 0;
      lastPlayheadProgress = null;
      renderer?.clear();
      return;
    }

    t === -1 && (t = audio.ctx.currentTime);
    audio.ctx.currentTime - t > 60 / bpm[file.id] - TRANSITION_DURATION / 1000 && (t += 60 / bpm[file.id]) && measure.value++;
    position = ((audio.ctx.currentTime - t) * bpm[file.id] / 60) % 1;
    const progress = scroll[file.id]
      ? scrollCoordinate(measure.value + position) / bandwidth
      : measure.value + position;
    notifyCrossedPoints(progress);
    status.playing && requestAnimationFrame(start);
    if (!status.playing) {
      t = -1;
      measure.value = 0;
      position = 0;
      lastPlayheadProgress = null;
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

    const lineMode = mode[file.id] === MODE.LINE;
    const staffCount = staff[file.id];
    const staffRects = new Float32Array(Math.max(0, staffCount - 1) * 4);
    const rectangles = new Float32Array(lineMode ? 0 : coords.length * 4);
    const lines = new Float32Array(lineMode ? coords.length * 4 : 0);

    for (let i = 1; i < staffCount; i++) {
      const offset = (i - 1) * 4;
      staffRects.set([0, height / staffCount * i - 2.5, width, 5], offset);
    }

    if (lineMode) {
      for (let i = 0; i < coords.length; i++) {
        const current = coords[i];
        const next = coords[i + 1] || current;
        const offset = i * 4;
        lines.set([
          xscale(current.x), yscale(current.y),
          xscale(next.x), yscale(next.y)
        ], offset);
      }
    } else {
      blockOrder.forEach((index, i) => {
        const { x, y } = coords[index];
        const offset = i * 4;
        const rectWidth = xscale.bandwidth();
        const rectHeight = yscale.bandwidth();
        rectangles.set([
          xscale(x) - +(rectWidth < xmin) * xmin / 2,
          yscale(y) - +(rectHeight < ymin) * ymin / 2,
          rectWidth < xmin ? xmin : rectWidth,
          rectHeight < ymin ? ymin : rectHeight
        ], offset);
      });
    }

    instance.setGeometry(staffRects, rectangles, lines);
    untrack(draw);
  });

  $effect(() => {
    const instance = renderer;
    if (!instance || !file.id || !ready) return;

    const lineColors = new Float32Array(color.length * 2);
    for (let i = 0; i < color.length; i++) {
      lineColors[i * 2] = color[i];
      lineColors[i * 2 + 1] = color[i + 1] ?? color[i];
    }

    instance.setColors(
      lineColors,
      Float32Array.from(blockOrder, index => color[index])
    );
    untrack(draw);
  });

  const draw = () => {
    if (!renderer) return;
    if (!file.id) {
      renderer.clear();
      return;
    }

    const fixedPlayhead = width * 0.3;
    const measurePlayhead = scroll[file.id]
      ? fixedPlayhead - padding / 2 - position * bandwidth * dataScale
      : measure.value * bandwidth;
    const positionPlayhead = scroll[file.id]
      ? fixedPlayhead - padding / 2
      : (measure.value + position) * bandwidth;
    const playheads = new Float32Array([
      measurePlayhead, 0, padding, height,
      positionPlayhead, 0, padding, height
    ]);

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
    class:cursor-grabbing={dragging}
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
    onlostpointercapture={handlePointerUp}
  ></canvas>
  <div bind:this={backgroundSample} aria-hidden="true" class="pointer-events-none absolute h-px w-px bg-white opacity-0 dark:bg-gray-800"></div>
  <div bind:this={staffColorSample} aria-hidden="true" class="pointer-events-none absolute h-px w-px bg-gray-300 opacity-0 dark:bg-gray-700"></div>
  {#if renderError}
    <div role="alert" class="absolute inset-0 grid place-items-center bg-white p-4 text-center text-red-600 dark:bg-gray-800">
      Unable to render the score: {renderError}
    </div>
  {/if}
</div>
