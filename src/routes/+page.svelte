<script>

  import { onMount } from 'svelte';
  import skio from 'sveltekit-io';
  import MoveBtnComponent from '$lib/components/MoveBtn.svelte';

  onMount(() => {

    const socket = skio.get();

    socket.on('message', message => {
      console.log("Server sent:", message);
    });

    socket.emit('message', {message: 'Hello from client !'});
  });

</script>

<MoveBtnComponent/>