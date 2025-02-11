<script>
  import Button from '$lib/components/Button.svelte';
  import { add as addData } from '$lib/state/data.svelte.js';
  import file from '$lib/state/file.svelte.js';
  import matrix from '$lib/state/matrix.svelte.js';
  import menu from '$lib/state/menu.svelte.js';
  import status from '$lib/state/status.svelte.js';
  import { autoType, csvParse, csvParseRows } from 'd3-dsv';
  import { onMount } from 'svelte';

  let samples;
  onMount(async () => samples = await import('../util/samples.js'));

  const handleStart = () => status.playing = !status.playing;

  const handleData = e => {
    Array.from(e.target.files).forEach(async f => {
      const raw = await f.text();
      try {
        const id = addData(f.name, csvParse(raw, autoType));
        file.id ??= id;
      } catch {}
    });
    e.target.value = null;
    e.target.blur();
  };

  const handleSamples = e => {
    try {
      Array.from(e.target.files).forEach(async file => (await samples).add(file.name, await file.arrayBuffer()));
    } catch {}
    e.target.value = null;
    e.target.blur();
  };

  const handleMatrix = async e => Object.assign(matrix, csvParseRows(await e.target.files[0].text()));

  const handleClear = async () => {
    await (await samples)?.clear(); // TODO: temp bypass for Firefox
    localStorage.clear();
    location.reload();
  };

  const handleMenu = () => menu.open = false;
</script>

<section class="grid grid-rows-6 h-full pb-4 text-sm">
  <div>
    <h3 class="dark:text-gray-100 font-normal m-0">menu.</h3>
  </div>
  <div>
    <Button onclick={handleStart}>{status.playing ? 'stop' : 'start'}</Button>
  </div>
  <div>
    <Button><label class="cursor-pointer" for="upload-data">upload data</label></Button>
    <input accept="text/csv" class="hidden" id="upload-data" multiple onchange={handleData} type="file">
  </div>
  <div>
    <Button><label class="cursor-pointer" for="upload-samples">upload samples</label></Button>
    <input accept="audio/*" class="hidden" id="upload-samples" multiple onchange={handleSamples} type="file">
  </div>
  <div>
    <Button><label class="cursor-pointer" for="upload-map-matrix">upload map matrix</label></Button>
    <input accept="text/csv" class="hidden" id="upload-map-matrix" onchange={handleMatrix} type="file">
  </div>
  <div>
    <Button ondblclick={handleClear}>clear cache</Button>
  </div>
  <div>
    <Button onclick={handleMenu}>hide menu</Button>
  </div>
</section>
