<script>
  import Button from '$lib/components/Button.svelte';
  import { add as addData } from '$lib/state/data.svelte.js';
  import file from '$lib/state/file.svelte.js';
  import matrix from '$lib/state/matrix.svelte.js';
  import menu from '$lib/state/menu.svelte.js';
  import status from '$lib/state/status.svelte.js';
  import { onMount } from 'svelte';
  import Worker from '$lib/util/workers/csv.js?worker';

  let samples;
  onMount(async () => samples = await import('../util/samples.js'));

  let name = null;
  let worker = null;

  onMount(() => {
    worker = new Worker();

    worker.onmessage = e => {
      const { action, payload } = e.data;
      switch (action) {
        case 'data':
          const id = addData(name, payload);
          file.id ??= id;
          break;
        case 'matrix':
          Object.assign(matrix, payload);
          break;
      }
    };
  });

  const handleStart = () => status.playing = !status.playing;

  const handleData = e => {
    Array.from(e.target.files).forEach(async f => {
      const raw = await f.text();
      worker.postMessage({ action: 'data', payload: raw });
      name = f.name;
    });
    e.target.value = null;
    e.target.blur();
  };

  const handleSamples = e => {
    try {
      Array.from(e.target.files).forEach(async file => (await samples).add(file.name, await file.arrayBuffer()));
    } catch {
    }
    e.target.value = null;
    e.target.blur();
  };

  const handleMatrix = async e => worker.postMessage({ action: 'matrix', payload: await e.target.files[0].text() });

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
