<script>
  import { onMount, onDestroy } from 'svelte';
  import Worker from '$lib/util/workers/sse.js?worker';

  let maxData = 'Waiting for data...';
  let worker;

  onMount(() => {
    worker = new Worker();

    worker.onmessage = event => {
      const cleanData = event.data;
      // Update your DOM smoothly
      console.log("Processed data received from worker:", cleanData);
    };
  });
</script>

<p>{ maxData }</p>
