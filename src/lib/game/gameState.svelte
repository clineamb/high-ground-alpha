<script module>
  import { browser } from '$app/environment';
  import { localStore } from '$lib/components/localStore.svelte';

  export class GameState {
    players = $state([])
    moves = $state([])
    turnIdx = $state(0)
    lastUpdated = $state(null)
    store = $state(null)
    clientPlayer = $state(null)
  
    constructor() {
      if(browser) {
        this.store = localStore('game', {});
      }
      $effect(() => {
        // if the store changes (most likely)
        // check if this game was initialized and load it up
        let storedGame = this.store?.value;
        if(storedGame) {
          this.players = storedGame.players;
          this.moves = storedGame.moves;
          this.turnIdx = storedGame.turnIdx;
          this.lastUpdated = storedGame.lastUpdated
        }
      });

      $effect(() => {
        if(this.lastUpdated) {
          this.store.value = this.makeGameInfoObj();
        }
      });
    }
    addPlayer(userObjStr, isClientPlayer = false) {
      console.log(userObjStr);
      const userObj = JSON.parse(userObjStr);
      let existingUser = this.players.find(p => p.username === userObj.username);
      if(!existingUser) {
        this.players.push(userObj);
        existingUser = userObj;
      }
      if(isClientPlayer && !this.clientPlayer) {
        this.clientPlayer = existingUser;
      }
      this.updateTimestamp();
    }
    makeMove(username, moveKey) {
      let moveObj = this.makeMoveObj(username, moveKey);
      let didPlayerMakeMove = this.moves.find(m => {
        return m.username === username && m.turn === this.turnIdx
      })
      if(!didPlayerMakeMove) {
        this.moves.push(moveObj);
        this.updateTimestamp();
      }
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
