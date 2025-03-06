<script>
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
  <title>Ensonification</title>
</svelte:head>

{@render children()}
