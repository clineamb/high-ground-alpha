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

  // dervied from game state helpers
  let gameStarted = $derived(game?.started)

  function getClientPlayerDetails() {
    const u = $state.snapshot(username);
    const dn = $state.snapshot(displayName);
    return JSON.stringify({
      username: u,
      displayName: dn
    });
  }
  
  function incomingMessageHandler(label, data, isBroadcast = false) {
    switch(label) {
      case 'player_joined':
        if(data.user.username !== username && !game.findPlayer(data.user.username)) {
          game.addPlayer(JSON.stringify(data.user));
          sendGameMessage(socket, {
            label: 'player_sync',
            user: getClientPlayerDetails(),
            fromSocketId: userSockId
          });
          alert(data.user.displayName + ' joined!');
        }
      break;
      case 'move_selected':
        // make sure we're not getting our own move
        if(data.fromUsername !== username) {
          game.receiveMove(data.move);
        }
      break;
      case 'start_game':
        console.log('>> starting game?', data);
        if(data.sync) {
          game.overrideGame(data.gameObj);
        }
        startGame();
      break;
      default:
        console.log('>> unhandled on client', data);
    }
  }

  onMount(() => {
    socket = skio.get();
    userSockId = socket.id;
    
    if(!displayName && !cookie.get('displayName')) {
      displayName = prompt('Username');
      cookie.set('displayName', displayName);
    } else {
      displayName = cookie.get('displayName');
    }
    
    game.addPlayer(getClientPlayerDetails(), true);
    sendGameMessage(socket, {
      label: 'game_connection',
      user: getClientPlayerDetails(),
      fromSocketId: socket.id
    });
    // receive server messages and send events
    socket.on('message', message => injestGameMessage(socket, message, incomingMessageHandler));
  });

  $effect(() => {
    if(username.length > 0 && !cookie.get('username')) {
      cookie.set('username', username);
    }
  });

  function selectMove(moveKey) {
    if(socket) {
      let newMove = game.makeMove(username, moveKey);
      if(newMove.doNotSend !== true) {
        sendGameMessage(socket, {
          label: "select_move",
          move: newMove,
          fromUsername: $state.snapshot(username)
        });
      } else {
        alert('You selected your move already...');
      }
    }
  }

  function revealCurrentMoves() {
    
  }

  function moveToNextRound() {

  }

  function startGame() {
    if(!game.started) {
      game.startGame();
      sendGameMessage(socket, {
        label: 'start_game',
      });
    }
  }

</script>

{#if !displayName}
  <h1>Waiting on user input...</h1>
{:else}
  <h1>You Are: {displayName}</h1>
{/if}

{#if gameStarted}
  <div class="move-actions">
    <h3>Take a stance...</h3>
    <MoveBtn moveCallback={() => selectMove('thrust')}>Thrust</MoveBtn>
    <MoveBtn moveCallback={() => selectMove('feint')}>Feint</MoveBtn>
    <MoveBtn moveCallback={() => selectMove('parry')}>Parry</MoveBtn>
  </div>
  <div class="meta-actions">
    <h3>Go on then.</h3>
    <MoveBtn moveCallback={revealCurrentMoves}>Reveal Moves</MoveBtn>
    <MoveBtn moveCallback={moveToNextRound}>Move to Next Round</MoveBtn>
  </div>
{/if}

<div>
  {#if !gameStarted}
  <MoveBtn moveCallback={startGame} disabled={game}>Start Game</MoveBtn>
  {/if}
  <h2>Active Players</h2>
  <ul>
    {#each game.players as player (player.username)}
      <li>{player.displayName}</li>
    {/each}
  </ul>
</div>

<div>
  <h3>Log</h3>
  <ul>
    {#each game.log as l (l.timestamp)} 
    {@const timestr = new Date(l.timestamp).toString() }
    <li>{l.msg} ({timestr})</li>
    {/each}
  </ul>
</div>

<style>
  div {
    margin: 1rem 0;
  }
</style>