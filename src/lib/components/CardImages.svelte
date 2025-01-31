<script module>
  // load the images
  import lp1ThrustCard from '$lib/images/lp1_thrust_card.png';
  import lp1FeintCard from '$lib/images/lp1_feint_card.png';
  import lp1ParryCard from '$lib/images/lp1_parry_card.png';
  import rp1ThrustCard from '$lib/images/rp1_thrust_card.png';
  import rp1FeintCard from '$lib/images/rp1_feint_card.png';
  import rp1ParryCard from '$lib/images/rp1_parry_card.png';
  import penaltyCard from '$lib/images/penalty.png';

  const cards = {
    lp1: {
      card: {
        thrust: lp1ThrustCard,
        feint: lp1FeintCard,
        parry: lp1ParryCard
      },
      win: {}
    },
    rp1: {
      card: {
        thrust: rp1ThrustCard,
        feint: rp1FeintCard,
        parry: rp1ParryCard
      },
      win: {}
    }
  };

  export function getCardImage(player, move, type = 'card') {
    return cards[player][type][move] || null;
  }

  export function getPenaltyCard() {
    return penaltyCard;
  }
</script>