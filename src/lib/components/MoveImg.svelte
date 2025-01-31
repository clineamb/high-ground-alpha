<script>
  import { getCardImage, getPenaltyCard } from '$lib/components/CardImages.svelte';
  let { moveKey, plabel = 'lp1' } = $props();
  let moveLabel = $state('');

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
    case 'penalty':
      moveLabel = 'PENALTY!';
    break;
  }

</script>


<div class="move">
  <div class="move-img">
    {#if moveKey === 'thrust'}
      <img src={getCardImage(plabel, 'thrust')} alt="Thrust" />
    {/if}
    {#if moveKey === 'feint'}
      <img src={getCardImage(plabel, 'feint')} alt="Feint" />
    {/if}
    {#if moveKey === 'parry'}
      <img src={getCardImage(plabel, 'parry')} alt="Parry" />
    {/if}
    {#if moveKey === 'wait'}
      💭
    {/if}
    {#if moveKey === 'ready'}
      ✔️
    {/if}
    {#if moveKey === 'penalty'}
    <img src={getPenaltyCard()} alt="Penalty!" />
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