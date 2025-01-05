<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import skio from 'sveltekit-io';
  import {
    injestGameMessage,
    sendGameMessage
  } from '$lib/game/messages';
  import MoveBtn from '$lib/components/MoveBtn.svelte';

  // let { data } = $props();
  let socket = $state(null);
  let userSockId = $state('unmounted');
  let username = '';
  let displayName = $state('');

  onMount(() => {
    socket = skio.get();
    userSockId = socket.id;

    // #TODO: get user info and make it nice
    // displayName = prompt('Your Name');
    displayName = userSockId;
    username = displayName ? displayName.toLowerCase().replaceAll(' ', '_') : 'guest';
  
    // send a message when log on
    sendGameMessage(socket, {
      message: `game_connection`, 
      sockId: socket.id,
      displayName,
      username
    });

    // receive server messages and send events
    socket.on('message', message => injestGameMessage(socket, message));
  });

  function makeMove(moveKey) {
    if(socket) {
      sendGameMessage(socket, {
        message: "select_move",
        move: {
          moveKey,
          revealed: false,
          priority: false
        }
      });
    }
  }

</script>

<h1>User {displayName}</h1>

<!-- <p>{data.post.content}</p> -->

<MoveBtn moveCallback={() => makeMove('thrust')}>Thrust</MoveBtn>
<MoveBtn moveCallback={() => makeMove('feint')}>Feint</MoveBtn>
<MoveBtn moveCallback={() => makeMove('parry')}>Parry</MoveBtn>