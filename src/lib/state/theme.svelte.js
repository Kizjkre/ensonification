import { onMount } from 'svelte';

export let theme = $state({ dark: false });

export const init = () => onMount(() => {
  const dark = matchMedia('(prefers-color-scheme: dark)');

  if (dark) theme.dark = true;

  dark.addEventListener('change', ({ matches }) => theme.dark = matches);
});
