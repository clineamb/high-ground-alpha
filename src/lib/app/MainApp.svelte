<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import skio from 'sveltekit-io';
  import cookie from 'js-cookie';
  import {
    injestGameMessage,
    sendGameMessage
  } from '$lib/game/messages';
  import { gameState } from '$lib/game/gameState.svelte';
  import MoveBtn from '$lib/components/MoveBtn.svelte';

  let socket = $state(null);
  let userSockId = $state('unmounted');
  let displayName = $state('');
  let username = $derived(displayName ? displayName.toLowerCase().replaceAll(' ', '_') : 'guest');
  let game = gameState();


  onMount(() => {
    socket = skio.get();
    userSockId = socket.id;
    
    if(!displayName && !cookie.get('displayName')) {
      displayName = prompt('Username');
    } else {
      displayName = cookie.get('displayName');
    }

    sendGameMessage(socket, {
      label: '#game_connection',
      user: {
        displayName,
        username
      },
    });
    // receive server messages and send events
    socket.on('message', message => injestGameMessage(socket, message));
  });

  $effect(() => {
    if(displayName.length <= 0) {
      displayName = prompt('Usermame please...');
    }
  });

  $effect(() => {
    if(username.length > 0 && !cookie.get('username')) {
      cookie.set('username', username);
    }
    if(displayName.length > 0 && !cookie.get('displayName')) {
      cookie.set('displayName', displayName);
    }
  });

  function selectMove(moveKey) {
    if(socket) {
      let newMove = game.makeMove(username, moveKey);
      sendGameMessage(socket, {
        label: "select_move",
        move: newMove
      });
    }
  }

</script>

{#if !displayName}
  <h1>Waiting on user input...</h1>
{:else}
  <h1>User {displayName}</h1>
{/if}

<!-- <p>{data.post.content}</p> -->

<MoveBtn moveCallback={() => selectMove('thrust')}>Thrust</MoveBtn>
<MoveBtn moveCallback={() => selectMove('feint')}>Feint</MoveBtn>
<MoveBtn moveCallback={() => selectMove('parry')}>Parry</MoveBtn>