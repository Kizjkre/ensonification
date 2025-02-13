<script>
  import File from '$lib/components/File.svelte';
  import { data } from '$lib/state/data.svelte.js';
</script>

<section class="auto-rows-max bg-gray-100 dark:bg-gray-700 gap-x-4 gap-y-2 grid grid-cols-explorer h-full overflow-x-hidden overflow-y-scroll p-1 rounded-t-lg w-full">
  {#each Object.entries(data) as [id, name] (id)}
    <File {id}>{name}</File>
  {/each}
</section>
