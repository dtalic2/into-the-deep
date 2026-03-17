/* ============================================
   INTO THE DEEP - AI Module
   AI opponent behavior
   ============================================ */

const AI = (() => {

  function chooseAction(combatState) {
    const enemy = combatState.enemy;
    const player = combatState.player;

    const hpPercent = enemy.currentHp / enemy.maxHp;
    const playerHpPercent = player.currentHp / player.maxHp;

    // Boss AI is smarter
    if (combatState.isBoss) {
      return bossStrategy(enemy, player, hpPercent, playerHpPercent);
    }

    // Basic AI strategy
    const roll = Math.random();

    // Low HP: more likely to defend
    if (hpPercent < 0.3) {
      if (roll < 0.4) return 'defend';
      if (roll < 0.7) return 'special';
      return 'attack';
    }

    // Player low HP: go aggressive
    if (playerHpPercent < 0.3) {
      if (roll < 0.5) return 'special';
      return 'attack';
    }

    // Normal: balanced
    if (roll < 0.5) return 'attack';
    if (roll < 0.75) return 'special';
    return 'defend';
  }

  function bossStrategy(enemy, player, hpPercent, playerHpPercent) {
    const roll = Math.random();

    // Boss special pattern: use special more often
    if (hpPercent < 0.2) {
      // Desperate: all-out special
      return roll < 0.6 ? 'special' : 'attack';
    }

    if (hpPercent < 0.5 && roll < 0.3) {
      return 'defend'; // Occasional strategic defense
    }

    // Punish defending players
    if (player.defending) {
      return roll < 0.7 ? 'special' : 'attack';
    }

    // Default boss aggression
    if (roll < 0.4) return 'special';
    if (roll < 0.8) return 'attack';
    return 'defend';
  }

  // World AI: move entities slightly
  function moveEntities(entities) {
    for (const ent of entities) {
      ent.x += (Math.random() - 0.5) * 2;
      ent.y += (Math.random() - 0.5) * 2;
      ent.x = Math.max(5, Math.min(92, ent.x));
      ent.y = Math.max(5, Math.min(85, ent.y));
    }
  }

  return { chooseAction, moveEntities };
})();
