<script>
  let { children, ...attrs } = $props();
</script>

<button class="hover:text-red-400 transition-all" {...attrs}>{@render children()}</button>
