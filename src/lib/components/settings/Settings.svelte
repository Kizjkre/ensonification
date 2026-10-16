<script>
  import Browser from '$lib/components/browser/Browser.svelte';
  import FABContainer from '$lib/components/fab-container/FABContainer.svelte';
  import ViewContainer from '$lib/components/view-container/ViewContainer.svelte';
  import { get } from '$lib/state/state.svelte';

  const { ui } = get();
</script>

<style src="./style.css"></style>

<section data-hidden={!ui.shown}>
  <main>
    <FABContainer></FABContainer>
    <Browser></Browser>
    <ViewContainer></ViewContainer>
  </main>
</section>
