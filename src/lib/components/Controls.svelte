<script>
  import FileSystem from '$lib/components/FileExplorer.svelte';
  import Menu from '$lib/components/Menu.svelte';
  import Pad from '$lib/components/Pad.svelte';
  import Settings from '$lib/components/Settings.svelte';
</script>

<aside class="shadow-controls gap-2 grid grid-cols-12 grid-flow-row-dense grid-rows-2 h-full px-8 pt-2 rounded-lg">
  <section class="col-span-3 row-span-2">
    <Menu />
  </section>
  <section class="col-span-6">
    <Settings />
  </section>
  <section class="col-span-6">
    <FileSystem />
  </section>
  <section class="col-span-3">
    <Pad />
  </section>
  <section class="col-span-3 flex items-end justify-end">
    <section class="flex flex-col items-end justify-end pb-4">
      <h1 class="dark:text-gray-100 font-display font-normal m-0" id="title">ensonification.</h1>
      <!--suppress JSUnresolvedReference -->
      <h6 class="text-xs">version {meta.version}, built {meta.date}.</h6>
    </section>
  </section>
</aside>
