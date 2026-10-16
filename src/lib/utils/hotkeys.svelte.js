import { get } from '$lib/state/state.svelte.js';
import { onMount } from 'svelte';

export default () => onMount(() => {
  const state = get();

  document.addEventListener('keyup', e => {
    switch (e.key) {
      case 'Escape':
        state.ui.toggle();
        break;
      case 'Backspace':
        e.target.classList.contains('score') && state.scores.delete();
        break;
    }
  });
});
