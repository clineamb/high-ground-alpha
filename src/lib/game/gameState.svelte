<script module>
  import { browser } from '$app/environment';
  import { localStore } from '$lib/components/localStore.svelte';

  export class GameState {
    clientPlayer = $state(null)
    lastTouchTime = $state(null);
    lastUpdated = $state(null)
    log = $state([])
    moves = $state([])
    players = $state([])
    turnIdx = $state(0)
    store = $state(null)
    started = $state(false)
    priorityUser = $state('')
  
    constructor() {
      if(browser) {
        this.store = localStore('game', {});

        let storedGame = this.store?.value;
        if(storedGame) {
          this.players = storedGame.players;
          this.moves = storedGame.moves;
          this.turnIdx = storedGame.turnIdx;
          this.lastUpdated = storedGame.lastUpdated;
          this.started = storedGame.started;
          this.priorityUser = storedGame.priorityUser;
          this.touch();
        }
      }
    
      $effect(() => {
        if(this.lastUpdated) {
          this.store.value = this.makeGameInfoObj();
        }
      });
    }
    addLog(msg, timestampOverride) {
      let timestamp = Date.now();
      if(timestampOverride) {
        timestamp = timestampOverride;
      }
      this.log.push({ msg, timestamp });
      this.log.sort((a, b) => b.timestamp - a.timestamp);
      this.touch();
    }
    startGame() {
      if(!this.started) {
        this.started = true;
        this.updateTimestamp();
        this.addLog('Game started');
      }
    }
    setPriority(username) {
      this.priorityUser = username;
      this.updateTimestamp();
    }
    swapPriority() {
      let nextPrio = this.players.filter(p => p.username !== this.priorityUser);
      if(nextPrio[0]) {
        this.setPriority($state.snapshot(nextPrio[0]));
      } else {
        console.log('>> ERROR ANOTHER PLAYER NOT FOUND?');
      }
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
        this.addLog(`${userObj.displayName} joined.`, userObj.created);
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
      return this.moves.filter(m => m.turn === this.turnIdx);
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
    areMovesReady() {
      let cms = this.getCurrMoves();
      return cms.length === this.players.length;
    }
    // REVEAL ==========
    revealRound() {
      let currMoves = this.getCurrMoves();
      console.lg
      currMoves.forEach(m => {
        m.revealed = true;
      });
      this.updateTimestamp();
    }
    // TURN PROGRESSION =========
    updateTurnIdx() {
      this.turnIdx++;
      this.updateTimestamp();
      return this.turnIdx;
    }
    goToNextTurn() {
      this.swapPriority();
      this.updateTurnIdx();
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
        players: [].concat(this.players),
        moves: this.moves,
        turnIdx: this.turnIdx,
        lastUpdated: this.lastUpdated,
        started: this.started,
        // log: this.log,
        priorityUser: this.priorityUser
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
