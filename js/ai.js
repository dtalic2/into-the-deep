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

  // World AI: wander with species-specific movement personality
  function moveEntities(entities) {
    for (const ent of entities) {
      let sx = 9, sy = 9; // default speed X/Y half-range

      switch (ent.id) {
        // Fast horizontal hunters — patrol like real predators
        case 'great-white-shark':
        case 'swordfish':
          sx = 22; sy = 5; break;

        // Energetic social swimmers
        case 'dolphin':
        case 'orca':
          sx = 18; sy = 14; break;

        // Slow, graceful gliders
        case 'blue-whale':
        case 'manta-ray':
          sx = 10; sy = 4; break;

        // Passive drifters — mostly vertical current movement
        case 'jellyfish':
          sx = 5; sy = 8; break;

        // Deep lurkers — slow and vertical
        case 'anglerfish':
        case 'octopus':
          sx = 7; sy = 11; break;

        // Sideways scuttlers
        case 'crab':
          sx = 15; sy = 3; break;

        // Slow deliberate swimmers
        case 'sea-turtle':
        case 'crocodile':
        case 'iguana':
          sx = 8; sy = 5; break;

        // Medium arctic swimmers
        case 'seal':
        case 'penguin':
        case 'walrus':
          sx = 11; sy = 8; break;

        // Large slow predators
        case 'polar-bear':
          sx = 9; sy = 6; break;
      }

      ent.x += (Math.random() - 0.5) * sx * 2;
      ent.y += (Math.random() - 0.5) * sy * 2;
      ent.x = Math.max(50, Math.min(1950, ent.x));
      ent.y = Math.max(50, Math.min(1350, ent.y));
    }
  }

  return { chooseAction, moveEntities };
})();
