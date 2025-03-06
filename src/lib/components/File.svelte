<script>
  import { remove } from '$lib/state/data.svelte.js';
  import file from '$lib/state/file.svelte.js';

  let { children, id: rawId } = $props();
  const id = $derived(+rawId);

  let hover = $state(false);

  const handleClick = e => {
    file.id = file.id === id ? null : id;
    e.target.blur();
  };

  const handleMouseEnter = () => hover = true;

  const handleMouseLeave = () => hover = false;

  const handleRemove = () => remove(id);
</script>

<div class="relative" onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave} role="button" tabindex="-1">
  <button aria-label="Close" class="absolute hover:text-red-400 right-0" class:hidden={!hover} onclick={handleRemove}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
      <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  </button>
  <button
    class="border border-gray-300 flex flex-col hover:text-red-400 h-fit items-center p-1 rounded-lg text-xs transition-all w-full"
    class:border-dashed={file.id === id}
    class:!border-transparent={file.id !== id}
    class:text-red-400={file.id === id}
    onclick={handleClick}
  >
    <span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    </span>
    <span class="truncate w-full">{@render children()}</span>
  </button>
</div>

