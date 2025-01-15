<script>
  import MoveImg from '$lib/components/MoveImg.svelte';
  let {
    hasPriority,
    move,
    movesRevealed,
    player,
    waitingOnReveal,
  } = $props();
  let madeMove = $state(move !== null);
</script>

<article>
  <header>
    <h1>
      {#if hasPriority}<span>🎖️</span>{/if}
      <span>{player.displayName}</span>
    </h1>
  </header>

  <div class="move-card">
    <div>
      {#if !madeMove}
        <MoveImg moveKey="wait"/>
        <em>Waiting on move...</em>
      {/if}
      {#if madeMove && !waitingOnReveal}
        <MoveImg moveKey="ready"/>
        <em>Move Selected!</em>
      {/if}
      {#if movesRevealed && move?.revealed}
        <MoveImg moveKey={move.moveKey} />
      {/if}
    </div>
  </div>
</article>


<style>
  article,
  header {
    border-radius: 25px;
  }
  header {
    padding-top: 2rem;
  }
  article h1 {
    text-align: center;
  }
  .move-card {
    text-align: center;
    height: 0;
    width: 100%;
    padding-bottom: 100%;
    
  }
  .move-card > div {
    padding-top: 10%;
  }
</style>