<script>
  let { moveCallback, children, disabled = false, btnClass } = $props();
</script>
<button {disabled} class={btnClass} onclick={moveCallback}>
  {@render children?.()}
</button>