<script>
  let { moveKey } = $props();

  let moveLabel = '';

  switch(moveKey) {
    case 'thrust':
      moveLabel = 'Thrust';
    break;
    case 'feint':
      moveLabel = 'Feint';
    break;
    case 'parry':
      moveLabel = 'Parry';
    break;
  }

</script>


<div class="move">
  <div class="move-img">
    {#if moveKey === 'thrust'}
      🤺
    {/if}
    {#if moveKey === 'feint'}
      🍃
    {/if}
    {#if moveKey === 'parry'}
      ⚔️
    {/if}
    {#if moveKey === 'wait'}
      💭
    {/if}
    {#if moveKey === 'ready'}
      ✔️
    {/if}
  </div>
  {#if moveLabel}
    <h3><em>{moveLabel}</em></h3>
  {/if}
</div>

<style>
  .move {
    text-align: center;
    margin-top: -5%;
  }
  .move-img {
    font-size: 1250%;
  }
</style>