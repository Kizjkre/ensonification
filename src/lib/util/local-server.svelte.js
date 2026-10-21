import bpm from '$lib/state/bpm.svelte.js';
import file from '$lib/state/file.svelte.js';
import server from '$lib/state/server.svelte.js';
import status from '$lib/state/status.svelte.js';
import Worker from '$lib/util/workers/local-server.js?worker';
import { onMount } from 'svelte';

let worker;

export const init = () => {
  onMount(() => {
    worker = new Worker();

    worker.onmessage = event => {
      if (event.data.type === 'connection') {
        server.connected = event.data.connected;
        return;
      }

      if (event.data.type === 'data') {
        console.log('Processed data received from worker:', event.data.data);
      }
    };
  });
};

$effect.root(() => {
  $effect(() => {
    if (!status.playing || !server.connected) return;

    worker.postMessage(['bpm', bpm[file.id]]);
  });
})
