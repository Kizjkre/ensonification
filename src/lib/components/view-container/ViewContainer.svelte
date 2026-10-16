<script>
  import View from '$lib/components/view/View.svelte';
  import { get } from '$lib/state/state.svelte';

  const { scores, current } = get();

  const score = $derived(scores[current.score]);
</script>

<style src="./style.css"></style>

<section>
  {#each score?.views || [] as { id }}
    <View {id} />
  {/each}
</section>
