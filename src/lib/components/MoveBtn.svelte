<script>
  import { onMount } from 'svelte';
  import skio from 'sveltekit-io';

  export let moveKey = 'feint';
  let socket;

  onMount(() => {
    socket = skio.get();
  });

  function greet() {
    if(socket) {
      socket.emit('message', {
        message: "select_move",
        id: socket.id,
        move: {
          moveKey,
          priority: false
        }
      });
    }
  }
</script>
<button onclick={greet}>
  <slot>Button Label</slot>
</button>