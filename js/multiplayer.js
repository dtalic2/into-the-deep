/* ============================================
   INTO THE DEEP - Multiplayer Module
   Local hot-seat multiplayer
   ============================================ */

const Multiplayer = (() => {
  let state = null;

  function init() {
    state = {
      player1: { animalId: null, score: 0, wins: 0 },
      player2: { animalId: null, score: 0, wins: 0 },
      currentPicker: 1, // who is picking their animal
      round: 0,
      maxRounds: 3,
      phase: 'picking', // picking, combat, results
    };
    return state;
  }

  function getState() { return state; }

  function selectAnimal(playerId, animalId) {
    if (!state) return false;
    if (playerId === 1) {
      state.player1.animalId = animalId;
      state.currentPicker = 2;
    } else {
      state.player2.animalId = animalId;
    }
    // Check if both picked
    if (state.player1.animalId && state.player2.animalId) {
      state.phase = 'combat';
    }
    return true;
  }

  function bothSelected() {
    return state && state.player1.animalId && state.player2.animalId;
  }

  function startCombat() {
    if (!state || !bothSelected()) return null;
    state.round++;
    // Player 1 is "player", Player 2 is "enemy" in combat terms
    return Combat.init(state.player1.animalId, state.player2.animalId, 1, false);
  }

  function recordResult(winner) {
    if (!state) return;
    if (winner === 'player') {
      state.player1.score += 100;
      state.player1.wins++;
    } else {
      state.player2.score += 100;
      state.player2.wins++;
    }
  }

  function isMatchOver() {
    if (!state) return true;
    return state.round >= state.maxRounds;
  }

  function getWinner() {
    if (!state) return null;
    if (state.player1.score > state.player2.score) return 'Player 1';
    if (state.player2.score > state.player1.score) return 'Player 2';
    return 'Tie';
  }

  function nextRound() {
    if (!state) return;
    state.player1.animalId = null;
    state.player2.animalId = null;
    state.currentPicker = 1;
    state.phase = 'picking';
  }

  function reset() {
    state = null;
  }

  return { init, getState, selectAnimal, bothSelected, startCombat, recordResult, isMatchOver, getWinner, nextRound, reset };
})();
