<script>
  let {
    hasPriority,
    move,
    movesRevealed,
    player,
    waitingOnReveal,
  } = $props();

  let _move = $state(move);
  let madeMove = $state(_move !== null);
</script>

<article>
  <header>
    <h1>
      {#if hasPriority}<span>⚔️</span>{/if}
      <span>{player.displayName}</span>
    </h1>
  </header>

  <div class="move-card">
    <div>
      {#if !madeMove && !movesRevealed}<em>Waiting on move...</em>{/if}
      {#if madeMove && waitingOnReveal && !movesRevealed}
        <em>Move Ready. Waiting to Reveal.</em>
      {/if}
      {#if movesRevealed}
        hi
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