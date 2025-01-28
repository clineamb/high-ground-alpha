<script module>
  import { browser } from '$app/environment';
  import { localStore } from '$lib/components/localStore.svelte';
  import { haveHoursPassed } from '$lib/services/timekit';

  export class GameState {
    clientPlayer = $state(null)
    lastUpdated = $state(null)
    log = $state([])
    moves = $state([])
    players = $state([])
    turnIdx = $state(0)
    store = $state(null)
    started = $state(false)
    priorityPlayer = $state('')
  
    constructor() {
      if(browser) {
        this.store = localStore('game', {});

        let storedGame = this.store?.value;
        if(storedGame) {
          if(haveHoursPassed(24, storedGame.lastUpdated)) {
            this.newGame();
          } else {
            this.players = storedGame.players;
            this.moves = storedGame.moves;
            this.turnIdx = storedGame.turnIdx;
            this.lastUpdated = storedGame.lastUpdated;
            this.started = storedGame.started;
            this.priorityPlayer = storedGame.priorityPlayer;
          }
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
    }
    startGame() {
      if(!this.started) {
        this.started = true;
        this.updateTimestamp();
        this.addLog('Game started');
      }
    }
    setPriority(username) {
      this.priorityPlayer = username;
      this.updateTimestamp();
    }
    swapPriority() {
      let nextPrio = this.players.filter(p => p.username !== this.priorityPlayer);
      if(nextPrio[0]) {
        this.setPriority(nextPrio[0].username);
      } else {
        console.log('>> ERROR ANOTHER PLAYER NOT FOUND?');
      }
    }
    // PLAYER RELATED ===========
    whoHasPriority() {
      return this.priorityPlayer;
    }
    findPlayer(username) {
      return this.players.find(p => p.username === username);
    }
    removeSpectator() {
      this.players = this.players.filter(p => p.username !== 'spectator');
    }
    addPlayer(userObjStr, isClientPlayer = false) {
      const userObj = JSON.parse(userObjStr);
      // don't do shit
      let existingUser = this.players.find(p => p.username === userObj.username);
      if(userObj.username === 'spectator') {
        return;
      }
      if(existingUser?.username === 'spectator') {
        // remove the player
        this.removeSpectator();
        this.updateTimestamp();
        return;
      }
      if(!existingUser) {
        userObj.created = Date.now();
        userObj.penaltyUsed = false;
        userObj.score = 0;
        this.players.push(userObj);
        existingUser = userObj;
        this.addLog(`${userObj.displayName} joined.`, userObj.created);
      }
      if(isClientPlayer && !this.clientPlayer) {
        this.clientPlayer = existingUser;
      }
      this.updateTimestamp();
      return;
    }
    // MAKING MOVES ==========
    findMove(cb) {
      return this.moves.find(cb);
    }
    getCurrMoves() {
      return this.moves.filter(m => m.turn === this.turnIdx);
    }
    getPlayerMove(username, turn = this.turnIdx) {
      let move = this.findMove(m => {
        return m.username === username && m.turn === turn
      });
      if(!move) {
        return null;
      }
      return $state.snapshot(move);
    }
    didPlayerMakeMove(username, turn = this.turnIdx) {
      return this.getPlayerMove(username, turn = this.turnIdx) !== null;
    }
    makeMove(username, moveKey) {
      let moveObj = this.makeMoveObj(username, moveKey);
      let didPlayerMakeMove = this.didPlayerMakeMove(username);
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
      let didPlayerMakeMove = this.didPlayerMakeMove(moveData.username, moveData.turnIdx);
      if(!didPlayerMakeMove && !moveData?.doNotSend) {
        this.moves.push(moveData);
        if(moveData.moveKey === 'penalty') {
          this.usePenaltyMove(moveData.username);
        }
        this.updateTimestamp();
      }
    }
    areMovesReady() {
      let cms = this.getCurrMoves();
      return cms.length === this.players.length;
    }
    haveMovesBeenRevealed() {
      let cms = this.getCurrMoves();
      return cms.every(m => m.revealed);
    }
    // REVEAL ==========
    revealRound() {
      let currMoves = this.getCurrMoves();
      currMoves.forEach(m => {
        m.revealed = true;
      });
      this.updateTimestamp();
    }
    usePenaltyMove(username) {
      let p = this.findPlayer(username);
      if(p) {
        p.penaltyUsed = true;
        return true;
      }
      return false;
    }
    didPlayerUsePenalty(username) {
      let p = this.findPlayer(username);
      if(!p) {
        return false;
      }
      if(typeof p?.penaltyUsed === 'undefined') {
        p.penaltyUsed = false;
      }
      return p.penaltyUsed;
    }
    // TURN PROGRESSION =========
    updateTurnIdx(setNum) {
      if(setNum) {
        this.turnIdx = setNum;
      } else {
        this.turnIdx++;
      }
      this.updateTimestamp();
      return this.turnIdx;
    }
    goToNextTurn() {
      this.swapPriority();
      this.updateTurnIdx();
    }
    updateTimestamp() {
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
        priorityPlayer: this.priorityPlayer
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
    // === clear
    newGame() {
      this.store.expireLocalStore();
    }
  }

  export function gameState(gameJson = {}) {
    return new GameState(gameJson);
  }
</script>
