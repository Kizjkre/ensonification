<script>
  import load from '$lib/state/load.svelte.js';
  import { onMount } from 'svelte';

  let splash = $state();
  let text = $state();
  let title;
  let covered = $state(true);
  let xtext = $state(0), ytext = $state(0);
  let xtitle = $state(0), ytitle = $state(0);

  onMount(() => {
    title = document.getElementById('title');

    handleResize();
  });

  $effect(() => {
    if (!load.value || !text) return;

    text.style.left = `${ xtext }px`;
    text.style.position = 'absolute';
    text.style.top = `${ ytext }px`;
    text.style.transform = `translate(${ xtitle - xtext }px, ${ ytitle - ytext }px)`;
  });

  $effect(() => {
    if (!load.value) return;

    setTimeout(() => {
      const { matches } = matchMedia('(prefers-color-scheme: dark)');
      if (!matches) text.style.opacity = 0;
      splash.style.opacity = 0;
    }, 1000);
    setTimeout(() => covered = false, 3000);
  });

  const handleResize = () => {
    if (!covered) return; // TODO: find way to remove listener instead.

    const textRect = text.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();

    xtext = textRect.x;
    ytext = textRect.y;
    xtitle = titleRect.x;
    ytitle = titleRect.y;
  };
</script>

<svelte:window onresize={handleResize} />

{#if covered}
  <section bind:this={splash} class="absolute bg-gray-800 duration-[2s] flex gap-8 h-full items-center justify-center transition-all w-full z-30">
    <div class="h-12">
      <h1 bind:this={text} class="duration-1000 font-display font-normal m-0 text-white transition-all">
        ensonification.
      </h1>
    </div>
    <div class="animate-spin border-8 border-transparent border-t-gray-600 h-12 rounded-full w-12"></div>
  </section>
{/if}
