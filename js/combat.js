/* ============================================
   INTO THE DEEP - Combat Module
   Turn-based battle engine
   ============================================ */

const Combat = (() => {
  let state = null;

  function init(playerAnimalId, enemyAnimalId, enemyLevel = 1, isBoss = false) {
    const player = { ...Animals.getAnimal(playerAnimalId) };
    const enemy = { ...Animals.getAnimal(enemyAnimalId) };

    // Scale enemy stats by level
    const scale = 1 + (enemyLevel - 1) * 0.15;
    enemy.hp = Math.round(enemy.hp * scale);
    enemy.attack = Math.round(enemy.attack * scale);
    enemy.defense = Math.round(enemy.defense * scale);

    if (isBoss) {
      enemy.hp = Math.round(enemy.hp * 1.5);
      enemy.attack = Math.round(enemy.attack * 1.2);
      enemy.name = 'Boss ' + enemy.name;
    }

    state = {
      player: {
        ...player,
        currentHp: player.hp,
        maxHp: player.hp,
        defending: false,
        debuffs: {},
        combo: 0,
      },
      enemy: {
        ...enemy,
        currentHp: enemy.hp,
        maxHp: enemy.hp,
        defending: false,
        debuffs: {},
        combo: 0,
      },
      turn: 'player',
      log: [],
      finished: false,
      winner: null,
      isBoss,
      turnCount: 0,
    };
    return state;
  }

  function getState() { return state; }

  function playerAction(action) {
    if (!state || state.finished || state.turn !== 'player') return null;
    state.player.defending = false;
    state.turnCount++;

    let result = { action, playerDmg: 0, enemyDmg: 0, log: '', effects: [] };

    // Apply poison before action
    result = applyDebuffs(state.player, result, 'player');

    if (state.player.currentHp <= 0) {
      return endCombat('enemy');
    }

    switch (action) {
      case 'attack':
        result = doAttack(state.player, state.enemy, result);
        if (result.hit) state.player.combo++;
        else state.player.combo = 0;
        break;
      case 'defend':
        state.player.defending = true;
        state.player.combo = 0;
        result.log = `${state.player.name} braces for impact!`;
        result.effects.push('defend');
        break;
      case 'special':
        result = doSpecial(state.player, state.enemy, result);
        if (result.hit) state.player.combo += 2;
        break;
    }

    // Check combo bonus
    if (state.player.combo >= 3) {
      result.comboBonus = true;
      result.effects.push('combo');
    }

    state.log.push(result.log);

    // Check enemy down
    if (state.enemy.currentHp <= 0) {
      state.enemy.currentHp = 0;
      return endCombat('player');
    }

    state.turn = 'enemy';
    return result;
  }

  function enemyAction(aiChoice) {
    if (!state || state.finished || state.turn !== 'enemy') return null;
    state.enemy.defending = false;

    let result = { action: aiChoice, playerDmg: 0, enemyDmg: 0, log: '', effects: [] };

    // Apply poison
    result = applyDebuffs(state.enemy, result, 'enemy');
    if (state.enemy.currentHp <= 0) {
      return endCombat('player');
    }

    switch (aiChoice) {
      case 'attack':
        result = doAttack(state.enemy, state.player, result, true);
        break;
      case 'defend':
        state.enemy.defending = true;
        result.log = `${state.enemy.name} guards!`;
        result.effects.push('enemy-defend');
        break;
      case 'special':
        result = doSpecial(state.enemy, state.player, result, true);
        break;
    }

    state.log.push(result.log);

    if (state.player.currentHp <= 0) {
      state.player.currentHp = 0;
      return endCombat('enemy');
    }

    state.turn = 'player';
    return result;
  }

  function doAttack(attacker, defender, result, isEnemy = false) {
    const variance = 0.8 + Math.random() * 0.4;
    const comboMult = attacker.combo >= 3 ? 1.5 : 1;
    let dmg = Math.round(attacker.attack * variance * comboMult);

    // Check blind debuff (50% miss chance)
    if (attacker.debuffs.blind && attacker.debuffs.blind > 0) {
      if (Math.random() < 0.5) {
        result.log = `${attacker.name} misses (blinded)!`;
        result.hit = false;
        attacker.debuffs.blind--;
        return result;
      }
      attacker.debuffs.blind--;
    }

    // Check stun
    if (attacker.debuffs.stun && attacker.debuffs.stun > 0) {
      result.log = `${attacker.name} is stunned!`;
      result.hit = false;
      attacker.debuffs.stun--;
      return result;
    }

    if (defender.defending) {
      dmg = Math.round(dmg * 0.3);
      result.effects.push('blocked');
    } else {
      dmg = Math.max(1, dmg - Math.round(defender.defense * 0.5));
    }

    defender.currentHp = Math.max(0, defender.currentHp - dmg);
    result.hit = true;
    if (isEnemy) {
      result.playerDmg = dmg;
    } else {
      result.enemyDmg = dmg;
    }
    result.log = `${attacker.name} attacks for ${dmg} damage!`;
    result.effects.push(isEnemy ? 'player-hit' : 'enemy-hit');
    return result;
  }

  function doSpecial(attacker, defender, result, isEnemy = false) {
    const spec = attacker.special;

    // Check stun
    if (attacker.debuffs.stun && attacker.debuffs.stun > 0) {
      result.log = `${attacker.name} is stunned and can't use ${spec.name}!`;
      result.hit = false;
      attacker.debuffs.stun--;
      return result;
    }

    if (spec.isDefense) {
      attacker.defending = true;
      result.log = `${attacker.name} uses ${spec.name}! Full block!`;
      result.effects.push('special-defend');
      result.hit = true;
      return result;
    }

    const comboMult = attacker.combo >= 3 ? 1.3 : 1;
    let dmg = Math.round(spec.damage * comboMult);
    if (defender.defending) {
      dmg = Math.round(dmg * 0.4);
    } else {
      dmg = Math.max(1, dmg - Math.round(defender.defense * 0.3));
    }

    defender.currentHp = Math.max(0, defender.currentHp - dmg);
    if (isEnemy) {
      result.playerDmg = dmg;
    } else {
      result.enemyDmg = dmg;
    }
    result.log = `${attacker.name} uses ${spec.name} for ${dmg} damage!`;
    result.hit = true;
    result.effects.push(isEnemy ? 'player-hit' : 'enemy-hit');
    result.effects.push('special');

    // Apply debuff
    if (spec.debuff) {
      defender.debuffs[spec.debuff] = (defender.debuffs[spec.debuff] || 0) + 2;
      result.log += ` ${defender.name} is ${spec.debuff}ed!`;
    }

    return result;
  }

  function applyDebuffs(combatant, result, who) {
    if (combatant.debuffs.poison && combatant.debuffs.poison > 0) {
      const poisonDmg = 5;
      combatant.currentHp = Math.max(0, combatant.currentHp - poisonDmg);
      combatant.debuffs.poison--;
      result.log = `${combatant.name} takes ${poisonDmg} poison damage! ` + result.log;
      if (who === 'player') result.playerDmg += poisonDmg;
      else result.enemyDmg += poisonDmg;
    }
    return result;
  }

  function endCombat(winner) {
    state.finished = true;
    state.winner = winner;

    const rewards = { coins: 0, xp: 0, statusPoints: 0 };
    if (winner === 'player') {
      rewards.coins = state.isBoss ? 50 : 15 + Math.floor(Math.random() * 15);
      rewards.xp = state.isBoss ? 80 : 25 + Math.floor(Math.random() * 25);
      rewards.statusPoints = state.isBoss ? 30 : 10;
      // Combo bonus
      if (state.player.combo >= 3) {
        rewards.coins = Math.round(rewards.coins * 1.5);
        rewards.xp = Math.round(rewards.xp * 1.5);
      }
    }

    return {
      finished: true,
      winner,
      rewards,
      log: winner === 'player' ? 'Victory!' : 'Defeated...',
      effects: [winner === 'player' ? 'victory' : 'defeat'],
    };
  }

  return { init, getState, playerAction, enemyAction };
})();
