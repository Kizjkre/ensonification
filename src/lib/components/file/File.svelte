<script>
  import { get } from '$lib/state/state.svelte.js';
  import { onMount } from 'svelte';

  const { id } = $props();

  const { current, scores } = get();

  const onclick = () => current.setScore(id);
  const oninput = e => e.target.value = e.target.value.trimStart();
  const onchange = e => e.target.blur();

  let input;
  onMount(() => {
    input.focus();
  })
</script>

<style src="./style.css"></style>

<button aria-label="score" class="score" class:selected={id === current.score} {onclick}>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
       class="icon icon-tabler icons-tabler-outline icon-tabler-clef-staff">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M15 15h6" />
    <path d="M15 11h6" />
    <path d="M11 19h10" />
    <path
      d="M11 12a4.16 4.16 0 0 1 -5.62 3.89a3.78 3.78 0 0 1 -2.38 -3.39a3.42 3.42 0 0 1 2.34 -3.38l3.79 -1.42a2.89 2.89 0 0 0 1.87 -2.7a2 2 0 0 0 -2 -2a2 2 0 0 0 -2 2v14a2 2 0 0 1 -2 2a2 2 0 0 1 -2 -2" />
  </svg>
  <input bind:this={input} bind:value={scores[id].name} type="text" placeholder="new score" {oninput} {onchange}>
</button>
