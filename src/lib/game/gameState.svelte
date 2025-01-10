<script module>
  import { browser } from '$app/environment';
  import { localStore } from '$lib/components/localStore.svelte';

  export class GameState {
    players = $state([])
    moves = $state([])
    turnIdx = $state(0)
    lastUpdated = $state(null)
    store = $state(null)
    initialized = false

    constructor() {
      if(browser) {
        this.store = localStore('game', {});
      }
      $effect(() => {
        // if the store changes (most likely)
        // check if this game was initialized and load it up
        if(this.store?.value?.initialized) {
          let storedGame = this.store?.value;
          this.players = storedGame.players;
          this.moves = storedGame.moves;
          this.turnIdx = storedGame.turnIdx;
          this.lastUpdated = storedGame.lastUpdated
          this.initialized = true;
        }
      });

      $effect(() => {
        // react to any of these changing and update
        // localstorage
        if(
          this.players ||
          this.moves ||
          this.turnIdx ||
          this.initialized
        ) {
          this.updateTimestamp();
          this.store.value = this.makeGameInfoObj();
        }
      });
    }
    makeMove(username, moveKey) {
      let moveObj = this.makeMoveObj(username, moveKey);
      this.moves.push(moveObj);
      return moveObj; // return for the socket
    }
    getCurrMoves() {
      return this.moves.filter(m => m.turnIDx === this.turnIdx);
    }
    nextTurn() {
      this.turnIdx++;
      return this.turnIdx;
    }
    updateTimestamp() {
      this.lastUpdated = Date.now();
    }
    makeGameInfoObj() {
      // to make an obj that doesn't include store
      return {
        players: this.players,
        moves: this.moves,
        turnIdx: this.turnIdx,
        lastUpdated: this.lastUpdated,
        initialized: this.initialized
      };
    }
    makeMoveObj(username, key, priority = false) {
      return {
        username,
        moveKey: key,
        revealed: false,
        priority,
        timestamp: Date.now(),
        turn: this.turnIdx
      };
    }
  }

  export function gameState(gameJson = {}) {
    return new GameState(gameJson);
  }
</script>
