<script>
  import bpm from '$lib/state/bpm.svelte.js';
  import colorrange from '$lib/state/colorrange.svelte.js';
  import { data } from '$lib/state/data.svelte.js';
  import file from '$lib/state/file.svelte.js';
  import mode, { MODE } from '$lib/state/mode.svelte.js';
  import { onMount } from 'svelte';

  let left = $state(null), right = $state(null), range;
  let target = $state(null);
  let lastTarget = $state(null);
  let rect = $state({ left: 0, right: 0 });

  $effect(() => {
    left.style.transform = `translateX(${ colorrange.min * (rect.right - rect.left) }px)`;
    right.style.transform = `translateX(${ colorrange.max * (rect.right - rect.left) }px)`;
  });

  const handleBlur = e => e.target.blur();

  const handleMousedown = e => {
    if (e.target !== left && e.target !== right) return;

    target = e.target;
  };

  const handleMousemove = e => {
    if (!target) return;

    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.right - rect.left));
    let newPos = x / (rect.right - rect.left);

    if (target === left) {
      if (newPos > colorrange.max) {
        colorrange.min = colorrange.max;
        return;
      }
      colorrange.min = newPos;
    }
    if (target === right) {
      if (newPos < colorrange.min) {
        colorrange.max = colorrange.min;
        return;
      }
      colorrange.max = newPos;
    }
  };

  const handleMouseup = () => {
    lastTarget = target;
    target = null;
  };

  const handleResize = () => rect = range.getBoundingClientRect();

  onMount(handleResize);
</script>

<svelte:document
  onmousedown={handleMousedown}
  onmousemove={handleMousemove}
  onmouseup={handleMouseup}
  onresize={handleResize}
></svelte:document>

<section class="gap-x-2 grid grid-cols-5 grid-rows-3">
  <div class="col-span-5 flex gap-4 justify-between">
    <h3 class="font-normal m-0">score settings.</h3>
    <div bind:this={range} class="relative w-1/2">
      <button
        aria-label="left slider"
        bind:this={left}
        class="absolute active:outline active:outline-black bg-gray-200 h-[120%] hover:outline hover:outline-black left-0 rounded top-[-10%] w-2 z-10"
        class:!z-20={target === left || lastTarget === left}
      ></button>
      <button
        aria-label="right slider"
        bind:this={right}
        class="absolute active:outline active:outline-black bg-gray-200 h-[120%] hover:outline hover:outline-black left-0 rounded top-[-10%] w-2 z-10"
        class:!z-20={target === right || lastTarget === right}
      ></button>
      <img alt="Turbo spectrum" class="h-full m-0" draggable="false" src="./assets/spectrum.png">
    </div>
  </div>
  {#if file.id in data}
  	<div class="flex flex-col row-span-2">
      <label class="px-2" for="x">x-axis</label>
      <select bind:value={data[file.id].x} class="border-2 border-gray-100 px-2 rounded" onchange={handleBlur} id="x">
        {#each data[file.id].columns as column, i (i)}
          <option value={i}>{column}</option>
        {/each}
        <option value={-1}>none</option>
      </select>
    </div>
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="y">y-axis</label>
      <select bind:value={data[file.id].y} class="border-2 border-gray-100 px-2 rounded" onchange={handleBlur} id="y">
        {#each data[file.id].columns as column, i (i)}
          <option value={i}>{column}</option>
        {/each}
        <option value={-1}>none</option>
      </select>
    </div>
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="color">color</label>
      <select bind:value={data[file.id].color} class="border-2 border-gray-100 px-2 rounded" onchange={handleBlur} id="color">
        {#each data[file.id].columns as column, i (i)}
          <option value={i}>{column}</option>
        {/each}
        <option value={-1}>none</option>
      </select>
    </div>
  {:else}
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="x">x-axis</label>
      <select class="border-2 border-gray-100 px-2 rounded" disabled id="x">
        <option value="0">select a dataset</option>
      </select>
    </div>
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="y">y-axis</label>
      <select class="border-2 border-gray-100 px-2 rounded" disabled id="y">
        <option value="0">select a dataset</option>
      </select>
    </div>
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="color">color</label>
      <select class="border-2 border-gray-100 px-2 rounded" disabled id="color">
        <option value="0">select a dataset</option>
      </select>
    </div>
  {/if}
  <div class="flex flex-col row-span-2">
    <label class="px-2" for="bpm">bpm</label>
    <input bind:value={bpm.value} class="border-2 border-gray-100 px-2 rounded" id="bpm" max="240" min="20" type="number">
  </div>
  <div class="flex flex-col row-span-2">
    <label class="px-2" for="mode">mode</label>
    <select bind:value={mode.value} class="border-2 border-gray-100 px-2 rounded" onchange={handleBlur} id="mode">
      {#each Object.values(MODE) as m}
        <option value={m}>{m}</option>
      {/each}
    </select>
  </div>
</section>
