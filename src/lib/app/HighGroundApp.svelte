<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import cookie from 'js-cookie';
  // ui components
  import MoveBtn from '$lib/components/MoveBtn.svelte';
  import PlayerCard from '$lib/components/PlayerCard.svelte';
  import { supabase } from '$lib/supabaseClient';

  let {
    // qps
    isSpectator = false,
    gameId = 1,
    // supa
    moves = [],
    game = {}
  } = $props();

  // Simple function to log any messages we receive
  function messageReceived(payload) {
    console.log('>> PAYLOAD', payload);

    if(payload.eventType === 'UPDATE') {
      
    }
  }

  async function getApi(data = {}) {
    let qStr = Object.keys(data).map(k => {
      return `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`;
    }).join('&');
    const response = await fetch(`/high-ground/api?${qStr}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  }

  async function postApi(action, data = {}) {
    data.action = action;
    const response = await fetch(`high-ground/api`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  }

  
  const channelA = supabase.channel(`room-${gameId}`,  {
    config: {
      broadcast: { ack: true }
    }
  });

  ///// ===================

  let displayName = $state('');
  let username = $derived(displayName ? displayName.toLowerCase().replaceAll(' ', '_') : 'guest');

  let gameState = $state(game);
  let gameStarted = $derived(gameState.game_started);
  let moveSelected = false;
  let myPriority = true;
  let penaltyUsed = false;
  let areMovesReady = true;
  let revealCurrentMoves = true;
  let movesRevealed = true;

  channelA
    .on(
      'broadcast',
      { event: 'Test message' },
      (payload) => messageReceived(payload)
    )
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
    .on('presence', { event: 'sync' }, () => {
      const newState = channelA.presenceState();
      console.log('>>>>> sync', newState);
    })
    .subscribe((status, error) => {
      console.log('>> STATUS?', status, error);
    });

  onMount(async () => {
    if(!isSpectator) {
      if(!displayName && !cookie.get('displayName')) {
        displayName = prompt('Username');
        cookie.set('displayName', displayName);
      } else {
        displayName = cookie.get('displayName');
      }
    }
  });

  async function selectMove(moveName) {
    const response = await postApi('make-move', {
      moveName,
      'playerName': username,
    });
  }

  async function startGame() {
    const response = await postApi('start-game', {
      'playerName': username,
    });
  }

  async function moveToNextRound() {
    const response = await postApi('next-round'); // should pass game id
  }

</script>
<div class="container app">
  {#if gameStarted}
  <div class="grid">
    {#each gameState.players as player (player.username)}
      {#if player.username !== 'spectator'}
        <PlayerCard
          player={player}
          hasPriority={false}
          move={moves[0]}
        />
      {/if}
    {/each}
  </div>
  {:else}
  <article>
    <h2><em>Waiting to start...</em></h2>
    <h3>Players...</h3>
    {#each gameState.players as player (player.username)}
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
    <div>
      {#if !gameStarted}
        <h2>Hello {displayName}!</h2>
        <MoveBtn moveCallback={startGame} >Start Game (I'm First Player)</MoveBtn>
      {:else}
        <h3>Go on then...</h3>
        {#if !myPriority}<p><em>Priority player swaps round.</em></p>{/if}
        <MoveBtn
          disabled={false}
          moveCallback={revealCurrentMoves}>
          Reveal Moves
        </MoveBtn>
        <MoveBtn
          disabled={false}
          moveCallback={moveToNextRound}>
          Move to Next Round
        </MoveBtn>
      {/if}
    </div>
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