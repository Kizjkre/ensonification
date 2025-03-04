<script>
  import Keyboard from '$lib/assets/Keyboard.svelte';
  import matrix from '$lib/state/matrix.svelte.js';
</script>

<section class="flex flex-col gap-2 h-full items-center justify-center pt-1 w-full">
  <!--  NOTE: Hacky -->
  {#if matrix[0].length !== 0}
  	<p class="m-0 text-green-400">matrix applied.</p>
  {:else}
    <p class="m-0 text-red-400">no matrix applied.</p>
  {/if}
  <Keyboard />
</section>
