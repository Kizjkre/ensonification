<script>
  import Controls from '$lib/components/Controls.svelte';
  import Load from '$lib/components/Load.svelte';
  import Score from '$lib/components/Score.svelte';
  import hotkeys from '$lib/util/hotkeys.js';
  import menu from '$lib/state/menu.svelte.js';
  import init from '$lib/util/init.svelte.js';
  import { init as dinit } from '$lib/state/data.svelte.js';

  init();
  dinit();
</script>

<svelte:window onkeydown={hotkeys}></svelte:window>

<Load />
<div class="dark:bg-gray-800 dark:text-gray-100 grid h-full transition-all duration-700" class:cursor-none={!menu.open} class:grid-rows-main={menu.open} class:grid-rows-mainFullscreen={!menu.open}>
  <main>
    <Score />
  </main>
  <aside>
    <Controls />
  </aside>
</div>
