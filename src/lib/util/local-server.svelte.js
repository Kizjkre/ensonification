import bpm from '$lib/state/bpm.svelte.js';
import file from '$lib/state/file.svelte.js';
import livePoints from '$lib/state/live-points.svelte.js';
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
        const datum = event.data.data;
        if (!file.id || !datum || datum.y == null || datum.color == null) return;

        if (livePoints.fileId !== file.id) {
          livePoints.fileId = file.id;
          livePoints.points = [];
        }

        livePoints.points = [...livePoints.points, { y: datum.y, color: datum.color }];
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
