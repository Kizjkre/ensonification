<script>
  import bpm from '$lib/state/bpm.svelte.js';
  import colorrange from '$lib/state/colorrange.svelte.js';
  import { data } from '$lib/state/data.svelte.js';
  import staff from '$lib/state/staff.svelte.js';
  import x from '$lib/state/x.svelte.js';
  import y from '$lib/state/y.svelte.js';
  import color from '$lib/state/color.svelte.js';
  import file from '$lib/state/file.svelte.js';
  import mode, { MODE } from '$lib/state/mode.svelte.js';
  import { onMount } from 'svelte';

  let left = $state(null), right = $state(null), range;
  let target = $state(null);
  let lastTarget = $state(null);
  let rect = $state({ left: 0, right: 0 });
  let read = $state(null);
  let columns = $state(null);
  onMount(async () => read = (await import('$lib/util/data.js')).read);

  $effect(async () => {
    if (!read || !file.id) return;

    columns = (await read(file.id)).columns;
  });
  $inspect(columns);

  $effect(() => {
    if (!file.id || !(colorrange[file.id])) return;

    left.style.transform = `translateX(${ colorrange[file.id].min * (rect.right - rect.left) - left.getBoundingClientRect().width / 2 }px)`;
    right.style.transform = `translateX(${ colorrange[file.id].max * (rect.right - rect.left) - right.getBoundingClientRect().width / 2 }px)`

    setTimeout(() => {
      left.classList.remove('transition-all');
      right.classList.remove('transition-all');
    }, 150);
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
      if (newPos > colorrange[file.id].max) {
        colorrange[file.id].min = colorrange[file.id].max;
        return;
      }
      colorrange[file.id].min = newPos;
    }
    if (target === right) {
      if (newPos < colorrange[file.id].min) {
        colorrange[file.id].max = colorrange[file.id].min;
        return;
      }
      colorrange[file.id].max = newPos;
    }
  };

  const handleMouseup = () => {
    lastTarget = target;
    target = null;
  };

  const handleResize = () => rect = range.getBoundingClientRect();

  const handleSpectrum = e => {
    const percentage = (e.clientX - rect.left) / (rect.right - rect.left);

    left.classList.add('transition-all');
    right.classList.add('transition-all');

    if (Math.abs(percentage - colorrange[file.id].min) > Math.abs(percentage - colorrange[file.id].max)) {
      colorrange[file.id].max = percentage;
    } else {
      colorrange[file.id].min = percentage;
    }
  };

  onMount(handleResize);
</script>

<svelte:document
  onmousedown={handleMousedown}
  onmousemove={handleMousemove}
  onmouseup={handleMouseup}
  onresize={handleResize}
></svelte:document>

<section class="gap-x-2 grid grid-cols-6 grid-rows-3">
  <div class="col-span-6 flex gap-4 justify-between">
    <h3 class="dark:text-gray-100 font-normal m-0">score settings.</h3>
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
      <button class="h-full" onclick={handleSpectrum}>
        <img alt="Turbo spectrum" class="h-full m-0 rounded-full" draggable="false" src="./assets/spectrum.png">
      </button>
    </div>
  </div>
  {#if file.id in data && columns}
  	<div class="flex flex-col row-span-2">
      <label class="px-2" for="x">x-axis</label>
      <select bind:value={x[file.id]} class="border-2 border-gray-100 dark:bg-gray-800 px-2 rounded" onchange={handleBlur} id="x">
        {#each columns as column, i (i)}
          <option selected={file.id in y || i !== 0 ? '' : 'selected'}  value={i}>{column}</option>
        {/each}
        <option value={-1}>none</option>
      </select>
    </div>
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="y">y-axis</label>
      <select bind:value={y[file.id]} class="border-2 border-gray-100 dark:bg-gray-800 px-2 rounded" onchange={handleBlur} id="y">
        {#each columns as column, i (i)}
          <option selected={file.id in y || i !== 1 ? '' : 'selected'} value={i}>{column}</option>
        {/each}
        <option value={-1}>none</option>
      </select>
    </div>
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="color">color</label>
      <select bind:value={color[file.id]} class="border-2 border-gray-100 dark:bg-gray-800 px-2 rounded" onchange={handleBlur} id="color">
        {#each columns as column, i (i)}
          <option selected={file.id in y || i !== 2 ? '' : 'selected'} value={i}>{column}</option>
        {/each}
        <option value={-1}>none</option>
      </select>
    </div>
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="bpm">bpm</label>
      <input bind:value={bpm[file.id]} class="border-2 border-gray-100 dark:bg-gray-800 px-2 rounded" id="bpm" max="240" min="20" type="number">
    </div>
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="mode">mode</label>
      <select bind:value={mode[file.id]} class="border-2 border-gray-100 dark:bg-gray-800 px-2 rounded" onchange={handleBlur} id="mode">
        {#each Object.values(MODE) as m}
          <option value={m}>{m}</option>
        {/each}
      </select>
    </div>
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="staff">staff</label>
      <input bind:value={staff[file.id]} class="border-2 border-gray-100 dark:bg-gray-800 px-2 rounded" id="staff" max="20" min="1" type="number">
    </div>
  {:else}
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="x">x-axis</label>
      <select class="border-2 border-gray-100 cursor-not-allowed dark:bg-gray-800 px-2 rounded" disabled id="x">
        <option value="0">select a dataset</option>
      </select>
    </div>
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="y">y-axis</label>
      <select class="border-2 border-gray-100 cursor-not-allowed dark:bg-gray-800 px-2 rounded" disabled id="y">
        <option value="0">select a dataset</option>
      </select>
    </div>
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="color">color</label>
      <select class="border-2 border-gray-100 cursor-not-allowed dark:bg-gray-800 px-2 rounded" disabled id="color">
        <option value="0">select a dataset</option>
      </select>
    </div>
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="bpm">bpm</label>
      <input class="border-2 border-gray-100 cursor-not-allowed dark:bg-gray-800 px-2 rounded" disabled id="bpm" max="240" min="20" placeholder="select a dataset" type="number">
    </div>
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="mode">mode</label>
      <select class="border-2 border-gray-100 cursor-not-allowed dark:bg-gray-800 px-2 rounded" disabled id="mode">
        <option value="0">select a dataset</option>
      </select>
    </div>
    <div class="flex flex-col row-span-2">
      <label class="px-2" for="staff">staff</label>
      <input class="border-2 border-gray-100 cursor-not-allowed dark:bg-gray-800 px-2 rounded" disabled id="staff" max="20" min="1" placeholder="select a dataset" type="number">
    </div>
  {/if}
</section>
