<script module>
  import { browser } from '$app/environment';
  import { localStore } from '$lib/components/localStore.svelte';

  export class Player {
    username = $state('')
    displayName = $state('')
    priority = $state(false)
    points = $state(0);

    constructor(displayName) {
      this.displayName = displayName;
      this.created = Date.now();
    }
  }

  export class GameState {
    clientPlayer = $state(null)
    lastTouchTime = $state(null);
    lastUpdated = $state(null)
    log = $state([])
    moves = $state([])
    players = $state([])
    turnIdx = $state(0)
    store = $state(null)
  
    constructor() {
      if(browser) {
        this.store = localStore('game', {});

        let storedGame = this.store?.value;
        if(storedGame) {
          this.players = storedGame.players;
          this.moves = storedGame.moves;
          this.turnIdx = storedGame.turnIdx;
          this.lastUpdated = storedGame.lastUpdated;
          this.touch();
        }
      }
    
      $effect(() => {
        if(this.lastUpdated) {
          this.store.value = this.makeGameInfoObj();
        }
      });
    }

    // PLAYER RELATED ===========
    findPlayer(username) {
      this.touch();
      return this.players.find(p => p.username === username);
    }
    addPlayer(userObjStr, isClientPlayer = false) {
      const userObj = JSON.parse(userObjStr);
      let existingUser = this.players.find(p => p.username === userObj.username);
      if(!existingUser) {
        userObj.created = Date.now();
        this.players.push(userObj);
        existingUser = userObj;
      }
      if(isClientPlayer && !this.clientPlayer) {
        this.clientPlayer = existingUser;
      }
      this.updateTimestamp();
    }
    // MAKING MOVES ==========
    findMove(cb) {
      this.touch();
      return this.moves.find(cb);
    }
    getCurrMoves() {
      return this.moves.filter(m => m.turnIDx === this.turnIdx);
    }
    makeMove(username, moveKey) {
      let moveObj = this.makeMoveObj(username, moveKey);
      let didPlayerMakeMove = this.findMove(m => {
        return m.username === username && m.turn === this.turnIdx
      });
      if(!didPlayerMakeMove) {
        this.moves.push(moveObj);
        this.updateTimestamp();
        return moveObj;
      }
      return {
        doNotSend: true
      };
    }
    receiveMove(moveData) {
      let didPlayerMakeMove = this.findMove(m => {
        return m.username === moveData.username && m.turn === moveData.turnIdx
      });
      if(!!!didPlayerMakeMove && !moveData?.doNotSend) {
        this.moves.push(moveData);
        this.updateTimestamp();
      }
    }
    // TURN PROGRESSION =========
    nextTurn() {
      this.turnIdx++;
      return this.turnIdx;
    }

    touch() {
      this.lastTouchTime = Date.now();
    }
    updateTimestamp() {
      this.touch();
      this.lastUpdated = Date.now();
    }
    // OBJECT BUILDERS ==========
    makeGameInfoObj() {
      // to make an obj that doesn't include store
      // don't send clientplayer or store
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
