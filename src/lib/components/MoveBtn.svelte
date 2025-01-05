<script>
  let { moveCallback, children } = $props();
</script>
<button onclick={moveCallback}>
  {@render children?.()}
</button>