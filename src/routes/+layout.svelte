<script>
  import favicon from '$lib/assets/favicon.svg';
  import { set } from '$lib/state/state.svelte.js';
  import hotkeys from '$lib/utils/hotkeys.svelte.js';
  import '$lib/state/actions.js';
  import '$lib/style.css';

  let { children } = $props();

  hotkeys();
  set();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>ensonification interface</title>
</svelte:head>

{@render children()}
