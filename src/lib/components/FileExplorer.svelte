<script>
  import File from '$lib/components/File.svelte';
  import { data } from '$lib/state/data.svelte.js';
  import file from '$lib/state/file.svelte.js';
  import modifiers from '$lib/state/modifier.svelte.js';

  const handleKeyDown = e => {
    const keys = Object.keys(data);

    switch (e.key) {
      case 'ArrowLeft':
        file.id = +keys[keys.indexOf('' + file.id) - 1] || file.id;
        break;
      case 'ArrowRight':
        file.id = +keys[keys.indexOf('' + file.id) + 1] || file.id;
        break;
      case 'Control':
        modifiers.control = true;
        break;
    }

    if (modifiers.control && e.key.match(/[0-9]/)) file.id = +keys[e.key - 1] || file.id;
  };

  const handleKeyUp = e => (e.key === 'Control') && (modifiers.control = false);
</script>

<svelte:document onkeydown={handleKeyDown} onkeyup={handleKeyUp}></svelte:document>

<section class="auto-rows-max bg-gray-100 dark:bg-gray-700 gap-x-4 gap-y-2 grid grid-cols-explorer h-full overflow-x-hidden overflow-y-scroll p-1 rounded-t-lg w-full">
  {#each Object.entries(data) as [id, { name, data }] (id)}
    <File {id}>{name}</File>
  {/each}
</section>
