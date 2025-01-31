<script>
  import MoveImg from '$lib/components/MoveImg.svelte';
  let {
    hasPriority,
    move = { waiting: true },
    playerName,
    plabel
  } = $props();
</script>

<article>
  <header>
    <h1>
      {#if hasPriority}<span>🎖️</span>{/if}
      <span>{plabel} - {playerName}</span>
    </h1>
  </header>

  <div class="move-card">
    <div>
      {#if move.waiting}
        <MoveImg {plabel} moveKey="wait"/>
        <em>Waiting on move...</em>
      {:else if move !== null && !move?.revealed}
        <MoveImg {plabel}  moveKey="ready"/>
        <em>Move Selected!</em>
      {:else if move?.revealed}
        <MoveImg {plabel} moveKey={move.move} />
      {/if}
    </div>
  </div>
</article>


<style>
  header h1 {
    padding: 0.5rem;
  }
  article {
    max-width: 500px;
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