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
	import gameLogic from '$lib/hooks/game-logic';
  // ui components
  import MoveBtn from '$lib/components/MoveBtn.svelte';
  import PlayerCard from '$lib/components/PlayerCard.svelte';

  let socket = $state(null);
  let userSockId = $state('unmounted');
  let displayName = $state('');
  let username = $derived(displayName ? displayName.toLowerCase().replaceAll(' ', '_') : 'guest');
  let game = gameState();
  let myPriority = $state(false);
  let moveSelected = $state(false);
  let areMovesReady = $state(false);
  let movesRevealed = $state(false);
  let displayMoves = $state([])

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

  function resetLocalRound() {
    moveSelected = false;
    movesRevealed = false;
    areMovesReady = false;
  }

  function doIHavePriority() {
    return (game.whoHasPriority() === username);
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
        areMovesReady = game.areMovesReady();
      break;
      case 'next_turn':
        game.setPriority(data.newPriorityPlayer);
        game.updateTurnIdx();
        myPriority = doIHavePriority();
        resetLocalRound();
      break;
      case 'start_game':
        game.setPriority(data.firstPlayer);
        game.startGame();
      break;
      case 'reveal_moves':
        movesRevealed = true;
        game.revealRound();
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
    });

    if(game.started) {
      if(game.areMovesReady()) {
        moveSelected = true;
      }
      if(displayMoves.length > 0) {
        movesRevealed = true;
      }
      areMovesReady = game.areMovesReady();
      myPriority = doIHavePriority();
    }
    // receive server messages and send events
    socket.on('message', message => injestGameMessage(socket, message, incomingMessageHandler));
  });

  $effect(() => {
    if(username.length > 0 && !cookie.get('username')) {
      cookie.set('username', username);
    }
  });

  $effect(() => {
    displayMoves = game.moves
      .filter(m => m.turn === game.turnIdx)
      .map(m => {
        return {
          ...m,
          'player': game.findPlayer(m.username)
        };
    });
    areMovesReady = game.areMovesReady();
  });

  function selectMove(moveKey) {
    if(socket) {
      let newMove = game.makeMove(username, moveKey, myPriority);
      moveSelected = true;
      if(newMove.doNotSend !== true) {
        sendGameMessage(socket, {
          label: "select_move",
          move: newMove,
          fromUsername: $state.snapshot(username)
        });
      } else {
        alert('You selected your move already...');
        moveSelected = true; // jic it didn't get set before
      }
      areMovesReady = game.areMovesReady();
    }
  }

  function revealCurrentMoves() {
    game.revealRound();
    movesRevealed = true;
    sendGameMessage(socket, {
      label: 'reveal_moves',
      fromUsername: $state.snapshot(username),
    });
  }

  function moveToNextRound() {
    game.goToNextTurn();
    resetLocalRound();
    myPriority = doIHavePriority();
    sendGameMessage(socket, {
      label: 'next_turn',
      fromUsername: $state.snapshot(username),
      newPriorityPlayer: game.whoHasPriority(),
    });
  }

  function startGame() {
    if(!game.started) {
      let usernameStr = '' + $state.snapshot(username);
      game.setPriority(usernameStr);
      game.startGame();
      sendGameMessage(socket, {
        label: 'start_game',
        firstPlayer: usernameStr,
        fromUsername: $state.snapshot(username)
      });
    }
  }

</script>

<div class="container app">
  <div class="grid">
    {#each game.players as player (player.username)}
    {@const madeMove = game.didPlayerMakeMove(player.username)}
      <PlayerCard
        player={player}
        hasPriority={game.whoHasPriority() === player.username}
        move={game.getPlayerMove()}
        waitingOnReveal={areMovesReady}
        movesRevealed

      />
    {/each}
  </div>
</div>

<div class="container app controls grid">
  <div>
    <h3>Make your move....</h3>
  </div>
  <div>
    <h3>Game flow</h3>
  </div>
</div>

<div class="container">
  {#if !displayName}
    <h1>Waiting on user input...</h1>
  {:else}
    <h1>You Are: {displayName}</h1>
  {/if}

  {#if displayMoves && movesRevealed}
    {#each displayMoves as dm}
      <p>{dm.moveKey} - {dm.player.displayName}</p>
    {/each}
  {/if}

  {#if gameStarted}
    <div class="move-actions">
      <h3>Take a stance...</h3>
      <MoveBtn disabled={moveSelected} moveCallback={() => selectMove('thrust')}>Thrust</MoveBtn>
      <MoveBtn disabled={moveSelected} moveCallback={() => selectMove('feint')}>Feint</MoveBtn>
      <MoveBtn disabled={moveSelected} moveCallback={() => selectMove('parry')}>Parry</MoveBtn>
    </div>
    <div class="meta-actions">
      <h3>Go on then.</h3>
      <MoveBtn disabled={!areMovesReady} moveCallback={revealCurrentMoves}>Reveal Moves</MoveBtn>
      <MoveBtn disabled={!movesRevealed} moveCallback={moveToNextRound}>Move to Next Round</MoveBtn>
    </div>
  {/if}

  <div>
    {#if !gameStarted}
    <MoveBtn moveCallback={startGame} >Start Game (I'm First Player)</MoveBtn>
    {/if}
    <h2>Active Players</h2>
    <ul>
      {#each game.players as player (player.username)}
        <li style:background-color={game.whoHasPriority() === player.username ? 'yellow' : 'transparent'}>{player.displayName}</li>
      {/each}
    </ul>
  </div>
</div>


<style>
  .app {
    border-radius: 25px;
    padding: 2rem;
    max-width: 1000px;
    margin: 50px auto;
  }
  .controls {
    border: 1px solid var(--pico-primary-border);
  }
</style>