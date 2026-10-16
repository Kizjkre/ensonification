<script>
  import File from '$lib/components/file/File.svelte';
  import { state } from '$lib/state/state.svelte.js';

  let div;
  const handleReset = e => e.target === div && state.current.reset();
</script>

<style src="./style.css"></style>

<div bind:this={div} role="button" tabindex="-1" onclick={handleReset} onkeyup={handleReset}>
  {#each state.scores as score}
  	{#if score}
  		<File id={score.id} />
  	{/if}
  {/each}
</div>
