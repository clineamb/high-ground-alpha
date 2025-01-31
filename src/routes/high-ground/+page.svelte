<script>
  import '@picocss/pico/css/pico.amber.min.css';
  import App from '$lib/app/HighGroundApp.svelte';
  let { data } = $props();
</script>

<div class="layout-content">
  <App {...data} />
</div>

<style>
  :global(:root) {
    --pico-font-size: 1rem;
  }

  :global(header > h1),
  :global(header > h2),
  :global(header > h3) {
    margin-bottom: 0;
  }

  .layout-content {
    padding: 2rem;
  }
</style>