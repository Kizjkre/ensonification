<script>
  const { children, title, ...other } = $props();

  let tooltip;

  const onmouseenter = () => {
    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';
  };

  const onmouseleave = () => {
    tooltip.style.opacity = '0';
    setTimeout(() => tooltip.style.display = 'none', 100);
  };
</script>

<style src="./style.css"></style>

<section>
  <button {onmouseenter} {onmouseleave} {...other}>
    {@render children?.()}
  </button>

  <div bind:this={tooltip}>
    {title}
  </div>
</section>
