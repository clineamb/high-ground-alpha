<script>
  import '@picocss/pico/css/pico.orange.min.css';
</script>

<div class="layout-content">
  <slot />
</div>

<style>
  :global(:root) {
    --pico-font-size: 1rem;
  }

  .layout-content {
    padding: 2rem;
  }
</style>