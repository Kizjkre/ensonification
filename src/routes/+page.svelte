<script>
  import Controls from '$lib/components/Controls.svelte';
  import Load from '$lib/components/Load.svelte';
  import Score from '$lib/components/Score.svelte';
  import { handleKeydown, handleKeyUp } from '$lib/util/hotkeys.js';
  import menu from '$lib/state/menu.svelte.js';
  import init from '$lib/util/init.svelte.js';
  import { init as dinit } from '$lib/state/data.svelte.js';
  import { init as tinit } from '$lib/state/theme.svelte.js';

  init();
  dinit();
  tinit();

  // NOTE: https://stackoverflow.com/questions/29032884/why-is-a-signaling-server-needed-for-webrtc
</script>

<svelte:window onkeydown={handleKeydown} onkeyup={handleKeyUp}></svelte:window>

<Load />
<div class="dark:bg-gray-800 dark:text-gray-100 grid h-full transition-all duration-700" class:cursor-none={!menu.open} class:grid-rows-main={menu.open} class:grid-rows-mainFullscreen={!menu.open}>
  <main>
    <Score />
  </main>
  <aside>
    <Controls />
  </aside>
</div>
