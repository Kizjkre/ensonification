import bpm from '$lib/state/bpm.svelte.js';
import file from '$lib/state/file.svelte.js';
import status from '$lib/state/status.svelte.js';
import Worker from '$lib/util/workers/local-server.js?worker';
import { onMount } from 'svelte';

let worker;

export const init = () => {
  onMount(() => {
    worker = new Worker();

    worker.onmessage = event => {
      const data = event.data;
      console.log('Processed data received from worker:', data);
    };
  });
};

$effect.root(() => {
  $effect(() => {
    if (!status.playing) return;

    worker.postMessage(['bpm', bpm[file.id]]);
  });
})
