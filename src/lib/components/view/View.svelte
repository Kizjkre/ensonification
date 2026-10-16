<script>
  import { get } from '../../state/state.svelte.js';

  const { id, children } = $props();

  const { ui, scores, current } = get();

  const score = $derived(scores[current.score]);
  const view = $derived(score.views[id]);

  const onclick = () => ui.views.toggle(id);
</script>

<style src="./style.css"></style>

<section>
  <button {onclick} title="show/hide view">
    <input bind:value={view.name} type="text" class="name" placeholder="new view" size={view.name.length || 'new view'.length}>
    <span class="indicator"></span>
  </button>
  <main class:open={ui.views[id]}>
    {@render children?.()}
  </main>
</section>
