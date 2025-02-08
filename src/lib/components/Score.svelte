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

  let seeker = $state(null);
  let continuous = $state(null);

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
  const zip = $derived(x.map((d, i) => ({ x: d, y: y[i], color: color[i] })));

  const xdomain = $derived(data[file.id]?.x !== -1 ? [...new Set(x)] : data[file.id]?.data.map((_, i) => i).filter((_, i) => !nulls.has(i)) || []);
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
    return padding < 2 ? 2 : padding;
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
          .range([height, 0]);
    }
  });

  const colordomain = $derived(d3.extent(color || []));
  const colorfunc = $derived(c =>
    d3.interpolateTurbo((c - colordomain[0]) / (colordomain[1] - colordomain[0]) * (colorrange.max - colorrange.min) + colorrange.min));

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  let PIXI = $state(null);
  let app = $state(null);
  let score = $state(null);

  onMount(async () => {
    PIXI = await import('pixi.js');

    app = new PIXI.Application();
    await app.init({ background: 'white', resizeTo: div });
    div.appendChild(app.canvas);

    score = new PIXI.Container();
    app.stage.addChild(score);

    seeker = PIXI.Sprite.from(PIXI.Texture.WHITE);
    seeker.width = padding;
    seeker.height = height;
    seeker.tint = 'red';
    seeker.x = 0;
    seeker.y = 0;

    continuous = PIXI.Sprite.from(PIXI.Texture.WHITE);
    continuous.width = padding;
    continuous.height = height;
    continuous.tint = 'white';

    app.stage.addChild(continuous, seeker);

    return () => app.removeContext();
  });

  $effect(async () => {
    if (!app || !score || !zip) return;

    score.removeChildren();

    switch (mode.value) {
      case MODE.BLOCK:
        zip.forEach(({ x, y, color }) => {
          const rect = PIXI.Sprite.from(PIXI.Texture.WHITE);
          rect.width = xscale.bandwidth();
          rect.height = yscale.bandwidth();
          rect.tint = colorfunc(color);
          rect.x = xscale(x);
          rect.y = yscale(y);
          score.addChild(rect);
        });
        break;
      case MODE.LINE:
        zip.forEach(({ x, y, color }, i) => {
          const line = new PIXI.Graphics();

          if (i === zip.length - 1) {
            // TODO
            return;
          }

          const xscalex = xscale(x);
          const yscaley = yscale(y);
          const xscalexn = xscale(zip[i + 1].x);
          const yscaleyn = yscale(zip[i + 1].y);
          // const length = Math.sqrt((xscalexn - xscalex) ** 2 + (yscaleyn - yscaley) ** 2);

          // const colorStops = [0xff0000, 0x00ff00, 0x0000ff];
          //
          // // Create a fill gradient
          // const gradientFill = new PIXI.FillGradient(0, 0, xscalexn - xscalex, yscaleyn - yscaley);
          //
          // // Add the color stops to the fill gradient
          // colorStops.forEach((number, index) =>
          // {
          //   const ratio = index / colorStops.length;
          //
          //   gradientFill.addColorStop(ratio, number);
          // });
          //
          // const gradient = new PIXI.FillGradient(xscalex, yscaley, xscalexn, yscaleyn);
          // gradient.addColorStop(0.2, colorfunc(color));
          // gradient.addColorStop(0.8, colorfunc(zip[i + 1].color));

          line.moveTo(xscale(x), yscale(y));
          line.lineTo(xscale(zip[i + 1].x), yscale(zip[i + 1].y));
          line.stroke({ width: 15, color: colorfunc(color) });
          // line.stroke({ width: 15, color: colorfunc(color), fill: gradient });

          // line
          //   .roundRect(0, 0, length, 15, 15)
          //   .fill(gradientFill)
          // // line.pivot.set(length / 2, 7.5);
          // line.position.x = xscalex;
          // line.position.y = yscaley;
          // line.rotation = Math.atan2(yscaleyn - yscaley, xscalexn - xscalex);

          score.addChild(line);
        });

        break;
    }
  });

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  onMount(async () => {
    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(div);

    const { height: h, width: w } = div.getBoundingClientRect();
    width = w;
    height = h;
  });

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

  $effect(() => {
    if (!seeker || !continuous) return;

    seeker.x = measure * bandwidth;
    continuous.x = (position + measure) * bandwidth;
  });

  $effect(() => {
    if (!continuous) return;
    continuous.tint = status.playing ? 0xAA0000 : 0xFFFFFF;
  });

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

<div bind:this={div} class="h-full"></div>
