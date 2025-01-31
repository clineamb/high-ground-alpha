<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import cookie from 'js-cookie';
  import localStore from '$lib/components/localStore.svelte';
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
    // console.log('>> PAYLOAD', payload);
  }

  async function postApi(action, data = {}) {
    data.action = action;
    data.currGameId = gameId || 1;
    const response = await fetch(`/high-ground/api`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  const channelA = supabase.channel(`room-${gameId}`,  {
    config: {
      broadcast: { ack: true }
    }
  });

  ///// ===================

  let displayName = $state(isSpectator ? 'spectator_mode_guest' : '');
  let username = $derived(displayName ? displayName.toLowerCase().replaceAll(' ', '_') : 'spectator_mode_guest');

  let gameState = $state(game);
  let gameStarted = $derived(gameState.game_started);
  let activePlayers = $derived(
    !gameState.players ? '' : gameState.players.trim().split(',')
  );
  let roundMoves = $state(moves);

  let moveSelected = $derived(!!getMove(username));
  let areMovesReady = $derived(roundMoves.length === activePlayers.length);
  let movesRevealed = $derived(roundMoves.every(m => m.revealed));
  let penaltyUsed = $state(false);

  let myPriority = true;
  let revealCurrentMoves = true;


  onMount(async () => {
    channelA
    .on(
      'postgres_changes',
      { event: 'INSERT', table: 'moves', schema: 'public' },
      async (payload) => updateMoves()
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', table: 'moves', schema: 'public' },
      async (payload) => updateMoves()
    )
    .on(
      'postgres_changes', {
        event: 'UPDATE',
        table: 'game',
        schema: 'public',
        filter: `id=eq.${gameId}`
      }, async (payload) => {
        gameState = payload.new;
        updateMoves();
      })
    .on(
      'broadcast',
      { event: 'resetGame'},
      async (payload) => {
        resetGame(payload.clearUsernames);
        window.location.reload();
      })
    .subscribe((status, error) => {
      // console.log('>> STATUS?', status, error);
    });

    if(!isSpectator && browser) {
      if(!displayName && !cookie.get('displayName') || cookie.get('displayName') === 'undefined') {
        displayName = prompt('Username');
        cookie.set('displayName', displayName);
      } else {
        displayName = cookie.get('displayName');
      }
      if(cookie.get('penaltyUsed')) {
        penaltyUsed = cookie.get('penaltyUsed') === 'true';
      }
      addPlayer($state.snapshot(username));
    }
  });

  $effect(() => {
    cookie.set('penaltyUsed', penaltyUsed);
  });

  function usePenalty() {
    if(browser) {
      penaltyUsed = true;
    }
  }

  function getMove(un) {
    return roundMoves.find(m => m.player === un);
  }

  async function addPlayer(playerName) {
    if(username !== 'spectator_mode_guest') {
      const response = await postApi('add-player', { playerName });
    }
  }

  async function updateMoves(cr) {
    const roundMovesData = await postApi('get-moves', {
      current_round: $state.snapshot(gameState.current_round)
    });
    roundMoves = roundMovesData.data;
  }

  async function selectMove(moveName) {
    const response = await postApi('make-move', {
      moveData: {
        'move': moveName,
        'player': $state.snapshot(username),
        'round': $state.snapshot(gameState.current_round),
        'priority': false,
        'revealed': false,
        'game_id': parseInt(gameId, 10)
      }
    });
  }
  
  async function revealMoves() {
    const response = await postApi('reveal-moves', {
      currentRound: $state.snapshot(gameState.current_round)
    });
  }

  async function moveToNextRound() {
    const response = await postApi('next-round'); // should pass game id
  }

  async function startGame() {
    cookie.set('penaltyUsed', false);
    await addPlayer($state.snapshot(username));
    const response = await postApi('start-game', {
      'playerName': username,
    });
  }

  async function resetGame(clearUsernames = false) {
    channelA.send({
      type: 'broadcast',
      event: 'resetGame',
      payload: { clearUsernames }
    });
    cookie.set('penaltyUsed', false);
    const response = await postApi('reset-game');
  }

  async function newGameNames() {
    cookie.set('displayName');
    await resetGame(true);
  }

</script>
<div class="container app">
  {#if gameStarted}
  <div class="grid">
    {#each activePlayers as playerName, index}
    {@const pmove = getMove(playerName)}
      <PlayerCard
        hasPriority={false}
        move={pmove}
        plabel={index % 2 === 0 ? 'lp1' : 'rp1'}
        {playerName}
      />
    {/each}
  </div>
  {:else}
  <article>
    <h2><em>Waiting to start...</em></h2>
    <!-- <h3>Players...</h3>
    {#each gameState.players as player (player.username)}
    <p>{player.displayName}</p>
    {/each} -->
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
        <MoveBtn
          disabled={moveSelected || penaltyUsed }
          moveCallback={() => {
            usePenalty();
            selectMove('penalty');
          }}>🚩 Penalty Move (1/game)</MoveBtn>
      </p>
    </div>
    {/if}
    <div>
      {#if !gameStarted}
        <h2>Hello {displayName}!</h2>
        <MoveBtn moveCallback={startGame} >Start Game</MoveBtn>
      {:else}
        <h3>Go on then...</h3>
        {#if !myPriority}<p><em>Priority player swaps round.</em></p>{/if}
        <MoveBtn
          disabled={false}
          moveCallback={revealMoves}>
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

  <div class="container app">
    <article>
      <header><h3>Dev Controls</h3></header>
      <button onclick={resetGame}>Reset Game</button>
      <button onclick={newGameNames}>Force New Game / New Names</button>
    </article>
  </div>
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