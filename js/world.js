/* ============================================
   INTO THE DEEP - World Module
   Ocean zones, movement, encounters
   ============================================ */

const World = (() => {
  const zones = [
    { id: 'coral-reef', name: 'Coral Reef', levelReq: 1,
      bgClass: 'coral-reef', enemies: ['crab', 'sea-turtle', 'jellyfish', 'seal'],
      boss: 'octopus', coinCount: 8, description: 'Warm, colorful waters teeming with life' },
    { id: 'tidal-shores', name: 'Tidal Shores', levelReq: 3,
      bgClass: 'tidal-shores', enemies: ['crab', 'iguana', 'penguin', 'sea-otter'],
      boss: 'crocodile', coinCount: 10, description: 'Where land meets sea' },
    { id: 'open-ocean', name: 'Open Ocean', levelReq: 5,
      bgClass: 'open-ocean', enemies: ['dolphin', 'manta-ray', 'swordfish', 'jellyfish'],
      boss: 'great-white-shark', coinCount: 12, description: 'Vast blue expanse with powerful predators' },
    { id: 'deep-trench', name: 'Deep Trench', levelReq: 8,
      bgClass: 'deep-trench', enemies: ['anglerfish', 'octopus', 'jellyfish', 'swordfish'],
      boss: 'blue-whale', coinCount: 15, description: 'Crushing depths where strange creatures lurk' },
    { id: 'arctic-waters', name: 'Arctic Waters', levelReq: 10,
      bgClass: 'arctic-waters', enemies: ['seal', 'penguin', 'walrus', 'orca'],
      boss: 'polar-bear', coinCount: 18, description: 'Freezing waters with fearsome hunters' },
    { id: 'luminous-lagoon', name: 'Luminous Lagoon', levelReq: 1,
      bgClass: 'luminous-lagoon', enemies: ['anglerfish', 'jellyfish', 'octopus', 'manta-ray', 'orca'],
      boss: 'blue-whale', coinCount: 25, premium: true,
      description: 'A glowing paradise for premium explorers' },
  ];

  let currentZone = null;
  let entities = [];
  let coins = [];
  let playerPos = { x: 50, y: 50 }; // percentage-based

  function getZone(id) {
    return zones.find(z => z.id === id);
  }

  function getAllZones() {
    return zones;
  }

  function enterZone(zoneId, gameState) {
    const zone = getZone(zoneId);
    if (!zone) return null;
    currentZone = zone;

    // Generate entities (enemy animals roaming the zone)
    entities = [];
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const enemyId = zone.enemies[Math.floor(Math.random() * zone.enemies.length)];
      entities.push({
        id: enemyId,
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 60,
        isBoss: false,
        level: Math.max(1, gameState.level - 1 + Math.floor(Math.random() * 3)),
      });
    }

    // Add boss
    entities.push({
      id: zone.boss,
      x: 75 + Math.random() * 15,
      y: 20 + Math.random() * 30,
      isBoss: true,
      level: gameState.level + 2,
    });

    // Generate coins
    coins = [];
    for (let i = 0; i < zone.coinCount; i++) {
      coins.push({
        x: 5 + Math.random() * 90,
        y: 5 + Math.random() * 80,
        collected: false,
        value: zone.premium ? 3 : 1,
      });
    }

    playerPos = { x: 10, y: 50 };

    return { zone: currentZone, entities, coins, playerPos };
  }

  function movePlayer(dx, dy) {
    playerPos.x = Math.max(2, Math.min(95, playerPos.x + dx));
    playerPos.y = Math.max(5, Math.min(85, playerPos.y + dy));
    return playerPos;
  }

  function setPlayerPos(x, y) {
    playerPos.x = Math.max(2, Math.min(95, x));
    playerPos.y = Math.max(5, Math.min(85, y));
    return playerPos;
  }

  function checkCollisions() {
    const results = { combat: null, coinsCollected: 0, sameSpecies: false };
    const threshold = 8;

    // Check entity collisions
    for (const ent of entities) {
      const dist = Math.sqrt((playerPos.x - ent.x) ** 2 + (playerPos.y - ent.y) ** 2);
      if (dist < threshold) {
        results.combat = ent;
        break;
      }
    }

    // Check coin pickups
    for (const coin of coins) {
      if (coin.collected) continue;
      const dist = Math.sqrt((playerPos.x - coin.x) ** 2 + (playerPos.y - coin.y) ** 2);
      if (dist < 6) {
        coin.collected = true;
        results.coinsCollected += coin.value;
      }
    }

    return results;
  }

  function removeEntity(entity) {
    const idx = entities.indexOf(entity);
    if (idx >= 0) entities.splice(idx, 1);
  }

  function getEntities() { return entities; }
  function getCoins() { return coins; }
  function getPlayerPos() { return playerPos; }
  function getCurrentZone() { return currentZone; }

  // Social: check if same species nearby for attraction bonus
  function checkSameSpecies(playerAnimalId) {
    for (const ent of entities) {
      if (ent.id === playerAnimalId) {
        const dist = Math.sqrt((playerPos.x - ent.x) ** 2 + (playerPos.y - ent.y) ** 2);
        if (dist < 20) return true;
      }
    }
    return false;
  }

  return {
    getZone, getAllZones, enterZone, movePlayer, setPlayerPos,
    checkCollisions, removeEntity, getEntities, getCoins,
    getPlayerPos, getCurrentZone, checkSameSpecies
  };
})();
