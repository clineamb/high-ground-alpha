<script>
  let { moveCallback, children, disabled = false } = $props();
</script>
<button {disabled} onclick={moveCallback}>
  {@render children?.()}
</button>