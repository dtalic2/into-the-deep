/* ============================================
   INTO THE DEEP - World Module
   Ocean zones, movement, encounters
   ============================================ */

const World = (() => {
  const MAP_W = 2000;
  const MAP_H = 1400;

  const zones = [
    { id: 'coral-reef', name: 'Coral Reef', levelReq: 1,
      bgClass: 'coral-reef', enemies: ['crab', 'sea-turtle', 'jellyfish', 'seal'],
      boss: 'octopus', coinCount: 16, description: 'Warm, colorful waters teeming with life' },
    { id: 'tidal-shores', name: 'Tidal Shores', levelReq: 3,
      bgClass: 'tidal-shores', enemies: ['crab', 'iguana', 'penguin', 'sea-otter'],
      boss: 'crocodile', coinCount: 20, description: 'Where land meets sea' },
    { id: 'open-ocean', name: 'Open Ocean', levelReq: 5,
      bgClass: 'open-ocean', enemies: ['dolphin', 'manta-ray', 'swordfish', 'jellyfish'],
      boss: 'great-white-shark', coinCount: 24, description: 'Vast blue expanse with powerful predators' },
    { id: 'deep-trench', name: 'Deep Trench', levelReq: 8,
      bgClass: 'deep-trench', enemies: ['anglerfish', 'octopus', 'jellyfish', 'swordfish'],
      boss: 'blue-whale', coinCount: 30, description: 'Crushing depths where strange creatures lurk' },
    { id: 'arctic-waters', name: 'Arctic Waters', levelReq: 10,
      bgClass: 'arctic-waters', enemies: ['seal', 'penguin', 'walrus', 'orca'],
      boss: 'polar-bear', coinCount: 36, description: 'Freezing waters with fearsome hunters' },
    { id: 'luminous-lagoon', name: 'Luminous Lagoon', levelReq: 1,
      bgClass: 'luminous-lagoon', enemies: ['anglerfish', 'jellyfish', 'octopus', 'manta-ray', 'orca'],
      boss: 'blue-whale', coinCount: 50, premium: true,
      description: 'A glowing paradise for premium explorers' },
  ];

  let currentZone = null;
  let entities = [];
  let coins = [];
  let playerPos = { x: 200, y: MAP_H / 2 };

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

    // More enemies spread across the large map
    entities = [];
    const count = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const enemyId = zone.enemies[Math.floor(Math.random() * zone.enemies.length)];
      entities.push({
        id: enemyId,
        x: 300 + Math.random() * (MAP_W - 600),
        y: 150 + Math.random() * (MAP_H - 300),
        isBoss: false,
        level: Math.max(1, gameState.level - 1 + Math.floor(Math.random() * 3)),
        nearby: false,
      });
    }

    // Boss in the far right area — must be discovered
    entities.push({
      id: zone.boss,
      x: MAP_W * 0.75 + Math.random() * (MAP_W * 0.18),
      y: MAP_H * 0.3 + Math.random() * (MAP_H * 0.4),
      isBoss: true,
      level: gameState.level + 2,
      nearby: false,
    });

    // Coins spread across the map
    coins = [];
    for (let i = 0; i < zone.coinCount; i++) {
      coins.push({
        x: 80 + Math.random() * (MAP_W - 160),
        y: 80 + Math.random() * (MAP_H - 160),
        collected: false,
        value: zone.premium ? 3 : 1,
      });
    }

    playerPos = { x: 200, y: MAP_H / 2 };
    return { zone: currentZone, entities, coins, playerPos };
  }

  function movePlayer(dx, dy) {
    playerPos.x = Math.max(30, Math.min(MAP_W - 30, playerPos.x + dx));
    playerPos.y = Math.max(30, Math.min(MAP_H - 30, playerPos.y + dy));
    return playerPos;
  }

  function setPlayerPos(x, y) {
    playerPos.x = Math.max(30, Math.min(MAP_W - 30, x));
    playerPos.y = Math.max(30, Math.min(MAP_H - 30, y));
    return playerPos;
  }

  function checkCollisions() {
    const results = { combat: null, coinsCollected: 0, sameSpecies: false };
    const combatThreshold = 55;  // pixels — walk into an enemy to fight
    const coinThreshold = 45;    // pixels

    for (const ent of entities) {
      const dist = Math.sqrt((playerPos.x - ent.x) ** 2 + (playerPos.y - ent.y) ** 2);
      if (dist < combatThreshold) {
        results.combat = ent;
        break;
      }
    }

    for (const coin of coins) {
      if (coin.collected) continue;
      const dist = Math.sqrt((playerPos.x - coin.x) ** 2 + (playerPos.y - coin.y) ** 2);
      if (dist < coinThreshold) {
        coin.collected = true;
        results.coinsCollected += coin.value;
      }
    }

    return results;
  }

  // Mark entities as nearby for engagement indicators (proximity ring)
  function checkProximity(threshold = 160) {
    for (const ent of entities) {
      const dist = Math.sqrt((playerPos.x - ent.x) ** 2 + (playerPos.y - ent.y) ** 2);
      ent.nearby = dist < threshold;
    }
  }

  function removeEntity(entity) {
    const idx = entities.indexOf(entity);
    if (idx >= 0) entities.splice(idx, 1);
  }

  function getEntities() { return entities; }
  function getCoins() { return coins; }
  function getPlayerPos() { return playerPos; }
  function getCurrentZone() { return currentZone; }
  function getMapSize() { return { w: MAP_W, h: MAP_H }; }

  function checkSameSpecies(playerAnimalId) {
    for (const ent of entities) {
      if (ent.id === playerAnimalId) {
        const dist = Math.sqrt((playerPos.x - ent.x) ** 2 + (playerPos.y - ent.y) ** 2);
        if (dist < 350) return true;
      }
    }
    return false;
  }

  return {
    getZone, getAllZones, enterZone, movePlayer, setPlayerPos,
    checkCollisions, checkProximity, removeEntity, getEntities, getCoins,
    getPlayerPos, getCurrentZone, getMapSize, checkSameSpecies
  };
})();
