<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import cookie from 'js-cookie';
  import { gameState } from '$lib/game/gameState2.svelte';
  // ui components
  import MoveBtn from '$lib/components/MoveBtn.svelte';
  import PlayerCard from '$lib/components/PlayerCard.svelte';
  import { supabase } from '$lib/supabaseClient';

  const channelA = supabase.channel('room-1',  {
    config: {
      broadcast: { ack: true }
    }
  });

  // Simple function to log any messages we receive
  function messageReceived(payload) {
    console.log('>> received', payload)
  }

  let { isSpectator, moves } = $props();
  let displayName = $state('');
  let gameStarted = true;
  let game = { turnIdx: 0 };
  let moveSelected = false;
  let myPriority = true;
  let penaltyUsed = false;
  let areMovesReady = true;
  let revealCurrentMoves = true;
  let movesRevealed = true;
  let moveToNextRound = true;

  onMount(() => {
    channelA
    .on(
      'postgres_changes',
      { event: 'INSERT', table: 'moves', schema: 'public' },
      (payload) => messageReceived(payload)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', table: 'moves', schema: 'public' },
      (payload) => messageReceived(payload)
    )
    .on(
      'broadcast',
      { event: 'Test message' },
      (payload) => messageReceived(payload)
    )
    .subscribe((status, error) => {
      console.log('>> STATUS?', status, error);
    });

    if(!isSpectator) {
      if(!displayName && !cookie.get('displayName')) {
        displayName = prompt('Username');
        cookie.set('displayName', displayName);
      } else {
        displayName = cookie.get('displayName');
      }
    }
  });


  async function apiPostMove(moveData) {
    const response = await fetch('/high-ground/api/make-move', {
      method: 'POST',
      body: JSON.stringify(moveData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async function selectMove(moveName) {
    const test = await apiPostMove({ moveName });
    console.log(test);
  }

</script>

<ul>
  {#each moves as m}
    <li>{m.move}</li>
  {/each}
</ul>

<div class="container app">
  {#if gameStarted}
  <h2>Round {game.turnIdx + 1}</h2>
  <div class="grid">
    {#each game.players as player (player.username)}
      {#if player.username !== 'spectator'}
        <PlayerCard
          player={player}
          hasPriority={game.whoHasPriority() === player.username}
          move={game.getPlayerMove(player.username)}
        />
      {/if}
    {/each}
  </div>
  {:else}
  <article>
    <h2><em>Waiting to start...</em></h2>
    <h3>Players...</h3>
    {#each game.players as player (player.username)}
    <p>{player.displayName}</p>
    {/each}
  </article>
  {/if}
</div>

{#if !isSpectator}
  <div class="container app controls grid">
    {#if gameStarted}
    <div>
      <h3>Make your move....</h3>
      <p>
        <MoveBtn disabled={moveSelected} moveCallback={() => selectMove('thrust')}>🤺 Thrust</MoveBtn>
        <MoveBtn disabled={moveSelected} moveCallback={() => selectMove('feint')}>🍃 Feint</MoveBtn>
        <MoveBtn disabled={moveSelected} moveCallback={() => selectMove('parry')}>⚔️ Parry</MoveBtn>
      </p>
      <p>
        <MoveBtn disabled={moveSelected || penaltyUsed } moveCallback={() => selectMove('penalty')}>🚩 Penalty Move (1/game)</MoveBtn>
      </p>
    </div>
    {/if}
    <!-- <div>
      {#if !gameStarted}
        <h2>Hello {displayName}!</h2>
        <MoveBtn moveCallback={startGame} >Start Game (I'm First Player)</MoveBtn>
      {:else}
        <h3>Go on then...</h3>
        {#if !myPriority}<p><em>Priority player swaps round.</em></p>{/if}
        <MoveBtn
          disabled={!myPriority || !areMovesReady}
          moveCallback={revealCurrentMoves}>
          Reveal Moves
        </MoveBtn>
        <MoveBtn
          disabled={!myPriority || !movesRevealed}
          moveCallback={moveToNextRound}>
          Move to Next Round
        </MoveBtn>
      {/if}
    </div> -->
  </div>

  <!-- <div class="container app">
    <article>
      <header><h3>Dev Controls</h3></header>
      <button onclick={newGameAndNewUsername}>Change Name & Force New Game</button>
      <button onclick={forceNewGame}>Force New Game</button>
      <button onclick={forceNewGameEveryone}>Force New For Everyone</button>
    </article>
  </div> -->
{/if}
<style>
  .app {
    border-radius: 25px;
    max-width: 1000px;
    margin: 50px auto;
    text-align: center;
  }
  .controls {
    padding: 2rem;
    border: 1px solid var(--pico-primary-border);
  }
</style>