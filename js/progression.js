/* ============================================
   INTO THE DEEP - Progression Module
   Points, leveling, fitness, breeding
   ============================================ */

const Progression = (() => {

  function xpToLevel(level) {
    return Math.round(50 * Math.pow(level, 1.6));
  }

  function addXP(gameState, amount) {
    // Status boost doubles XP
    if (gameState.statusBoostEnd && Date.now() < gameState.statusBoostEnd) {
      amount *= 2;
    }
    gameState.xp += amount;
    let leveledUp = false;
    while (gameState.xp >= xpToLevel(gameState.level)) {
      gameState.xp -= xpToLevel(gameState.level);
      gameState.level++;
      leveledUp = true;
      // Unlock zones based on level
      updateZoneUnlocks(gameState);
    }
    return { leveledUp, newLevel: gameState.level };
  }

  function updateZoneUnlocks(gameState) {
    const zones = World.getAllZones();
    for (const zone of zones) {
      if (zone.premium) continue;
      if (gameState.level >= zone.levelReq && !gameState.unlockedZones.includes(zone.id)) {
        gameState.unlockedZones.push(zone.id);
      }
    }
  }

  function addCoins(gameState, amount) {
    gameState.coins += amount;
  }

  function spendCoins(gameState, amount) {
    if (gameState.coins < amount) return false;
    gameState.coins -= amount;
    return true;
  }

  function addStatusPoints(gameState, amount) {
    if (gameState.statusBoostEnd && Date.now() < gameState.statusBoostEnd) {
      amount *= 2;
    }
    gameState.statusPoints += amount;
  }

  function updateFitness(gameState, won) {
    if (won) {
      gameState.fitness = Math.min(200, gameState.fitness + 5);
    } else {
      gameState.fitness = Math.max(10, gameState.fitness - 8);
    }
  }

  function checkDailyBonus(gameState) {
    const today = new Date().toDateString();
    if (gameState.dailyPlayDate !== today) {
      gameState.dailyPlayDate = today;
      gameState.fitness = Math.min(200, gameState.fitness + 10);
      return true; // Daily bonus awarded
    }
    return false;
  }

  // ---- Breeding ----

  function getAttraction(animalId1, animalId2) {
    const a1 = Animals.getAnimal(animalId1);
    const a2 = Animals.getAnimal(animalId2);
    if (!a1 || !a2) return 0;

    let attraction = 30; // base

    // Same species = max attraction
    if (animalId1 === animalId2) attraction += 50;
    // Same type bonus
    else if (a1.type === a2.type) attraction += 25;
    // Different type still has some attraction
    else attraction += 10;

    // Rarity bonus
    if (a1.rarity === 'legendary' || a2.rarity === 'legendary') attraction += 10;
    if (a1.rarity === 'rare' || a2.rarity === 'rare') attraction += 5;

    return Math.min(100, attraction);
  }

  function canBreed(gameState) {
    if (gameState.breedCooldownEnd && Date.now() < gameState.breedCooldownEnd) {
      return { can: false, reason: 'cooldown', remaining: gameState.breedCooldownEnd - Date.now() };
    }
    return { can: true };
  }

  function breed(gameState, animalId1, animalId2) {
    const check = canBreed(gameState);
    if (!check.can) return check;

    const a1 = Animals.getAnimal(animalId1);
    const a2 = Animals.getAnimal(animalId2);
    const attraction = getAttraction(animalId1, animalId2);

    // Success chance based on attraction
    if (Math.random() * 100 > attraction) {
      return { success: false, reason: 'low attraction' };
    }

    // Determine offspring
    const parentPool = [animalId1, animalId2];
    const offspringId = parentPool[Math.floor(Math.random() * 2)];

    // Number of offspring
    let count = 1;
    if (attraction >= 80) count = 2;
    if (gameState.ownedBreedingBoosts.includes('extra-eggs')) count += 3;
    if (gameState.ownedBreedingBoosts.includes('baby-boom')) count *= 2;

    const offspring = [];
    for (let i = 0; i < count; i++) {
      offspring.push({
        id: offspringId,
        bornAt: Date.now(),
        parents: [animalId1, animalId2],
      });
    }

    gameState.offspring.push(...offspring);

    // Set cooldown (30 min base, reduced with boosts)
    let cooldownMs = 30 * 60 * 1000;
    if (gameState.ownedBreedingBoosts.includes('fast-breed')) {
      cooldownMs = Math.round(cooldownMs * 0.5);
    }
    gameState.breedCooldownEnd = Date.now() + cooldownMs;

    // XP and status for breeding
    addXP(gameState, 15 * count);
    addStatusPoints(gameState, 5 * count);

    return {
      success: true,
      offspring,
      cooldownMs,
    };
  }

  function sellOffspring(gameState, index) {
    if (index < 0 || index >= gameState.offspring.length) return false;
    const off = gameState.offspring[index];
    const animal = Animals.getAnimal(off.id);
    const value = animal.rarity === 'legendary' ? 50 : animal.rarity === 'rare' ? 25 : 10;
    gameState.offspring.splice(index, 1);
    addCoins(gameState, value);
    return value;
  }

  return {
    xpToLevel, addXP, addCoins, spendCoins, addStatusPoints,
    updateFitness, checkDailyBonus, getAttraction, canBreed, breed,
    sellOffspring, updateZoneUnlocks
  };
})();
