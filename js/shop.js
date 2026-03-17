/* ============================================
   INTO THE DEEP - Shop Module
   Store UI and purchase logic
   ============================================ */

const Shop = (() => {

  const coinBundles = [
    { id: 'starter', name: 'Starter Pack', coins: 100, price: '$0.99', icon: '\u{1FA99}' },
    { id: 'deep-dive', name: 'Deep Dive Pack', coins: 500, price: '$3.99', icon: '\u{1F30A}', popular: false },
    { id: 'ocean-master', name: 'Ocean Master', coins: 2050, price: '$9.99', icon: '\u{1F31F}', popular: true, bonus: '+50 bonus coins!' },
    { id: 'whale', name: 'Whale Bundle', coins: 5000, price: '$19.99', icon: '\u{1F433}', bonus: '+500 bonus coins!' },
  ];

  const cosmetics = [
    { id: 'jellyfish-aura', name: 'Invisible Jellyfish Aura', desc: 'Ethereal shimmer surrounds your animal',
      price: 300, cssClass: 'cosmetic-jellyfish-aura', icon: '\u{1FABC}' },
    { id: 'red-patches', name: 'Red Light Patches', desc: 'Bioluminescent glow under the eyes',
      price: 200, cssClass: 'cosmetic-red-patches', icon: '\u{1F534}' },
    { id: 'golden-scales', name: 'Golden Scales', desc: 'Gleaming golden shimmer on your animal',
      price: 250, cssClass: 'cosmetic-golden-scales', icon: '\u2728' },
    { id: 'neon-tentacles', name: 'Neon Tentacles', desc: 'Electric neon glow effect',
      price: 350, cssClass: 'cosmetic-neon-tentacles', icon: '\u{1F7E2}' },
    { id: 'coral-crown', name: 'Crown of Coral', desc: 'A majestic coral crown',
      price: 400, cssClass: 'cosmetic-coral-crown', icon: '\u{1F451}' },
  ];

  const breedingBoosts = [
    { id: 'extra-eggs', name: 'Extra Eggs', desc: '+3 offspring per breeding cycle',
      price: 250, icon: '\u{1F95A}' },
    { id: 'baby-boom', name: 'Baby Boom', desc: 'Double all offspring',
      price: 400, icon: '\u{1F423}' },
    { id: 'fast-breed', name: 'Speed Hatch', desc: 'Halve breeding cooldown time',
      price: 300, icon: '\u26A1' },
  ];

  const premiumItems = [
    { id: 'luminous-lagoon', name: 'Luminous Lagoon Access', desc: 'Unlock the premium glowing world zone',
      price: 800, icon: '\u2728', type: 'zone' },
    { id: 'status-boost', name: 'Status Boost (1hr)', desc: '2x points and XP for 1 hour of play',
      price: 150, icon: '\u{1F680}', type: 'boost', consumable: true },
  ];

  function getCoinBundles() { return coinBundles; }
  function getCosmetics() { return cosmetics; }
  function getBreedingBoosts() { return breedingBoosts; }
  function getPremiumItems() { return premiumItems; }

  function getUnlockableAnimals(gameState) {
    return Animals.getAll().filter(a => !gameState.unlockedAnimals.includes(a.id) && a.unlockCost > 0);
  }

  function buyAnimal(gameState, animalId) {
    const animal = Animals.getAnimal(animalId);
    if (!animal || gameState.unlockedAnimals.includes(animalId)) return { success: false, reason: 'already owned' };
    if (!Progression.spendCoins(gameState, animal.unlockCost)) return { success: false, reason: 'not enough coins' };
    gameState.unlockedAnimals.push(animalId);
    // Initialize level tracking for newly purchased animal
    gameState.animalLevels[animalId] = 1;
    gameState.animalXp[animalId] = 0;
    return { success: true };
  }

  function buyCosmetic(gameState, cosmeticId) {
    const item = cosmetics.find(c => c.id === cosmeticId);
    if (!item) return { success: false, reason: 'invalid item' };
    if (gameState.ownedCosmetics.includes(cosmeticId)) return { success: false, reason: 'already owned' };
    if (!Progression.spendCoins(gameState, item.price)) return { success: false, reason: 'not enough coins' };
    gameState.ownedCosmetics.push(cosmeticId);
    return { success: true };
  }

  function equipCosmetic(gameState, animalId, cosmeticId) {
    if (!gameState.ownedCosmetics.includes(cosmeticId)) return false;
    if (!gameState.equippedCosmetics[animalId]) gameState.equippedCosmetics[animalId] = [];
    if (gameState.equippedCosmetics[animalId].includes(cosmeticId)) {
      // Unequip
      gameState.equippedCosmetics[animalId] = gameState.equippedCosmetics[animalId].filter(c => c !== cosmeticId);
    } else {
      gameState.equippedCosmetics[animalId].push(cosmeticId);
    }
    return true;
  }

  function buyBreedingBoost(gameState, boostId) {
    const item = breedingBoosts.find(b => b.id === boostId);
    if (!item) return { success: false, reason: 'invalid item' };
    if (gameState.ownedBreedingBoosts.includes(boostId)) return { success: false, reason: 'already owned' };
    if (!Progression.spendCoins(gameState, item.price)) return { success: false, reason: 'not enough coins' };
    gameState.ownedBreedingBoosts.push(boostId);
    return { success: true };
  }

  function buyPremium(gameState, itemId) {
    const item = premiumItems.find(p => p.id === itemId);
    if (!item) return { success: false, reason: 'invalid item' };

    if (item.type === 'zone') {
      if (gameState.purchasedPremiumWorld) return { success: false, reason: 'already purchased' };
      if (!Progression.spendCoins(gameState, item.price)) return { success: false, reason: 'not enough coins' };
      gameState.purchasedPremiumWorld = true;
      gameState.unlockedZones.push('luminous-lagoon');
      return { success: true };
    }

    if (item.type === 'boost') {
      if (!Progression.spendCoins(gameState, item.price)) return { success: false, reason: 'not enough coins' };
      gameState.statusBoostEnd = Date.now() + 60 * 60 * 1000;
      return { success: true };
    }

    return { success: false, reason: 'unknown type' };
  }

  // Simulate "real money" purchase (adds coins)
  function purchaseCoinBundle(gameState, bundleId) {
    const bundle = coinBundles.find(b => b.id === bundleId);
    if (!bundle) return { success: false };
    // In a real game this would go through a payment provider
    gameState.coins += bundle.coins;
    return { success: true, coins: bundle.coins };
  }

  return {
    getCoinBundles, getCosmetics, getBreedingBoosts, getPremiumItems,
    getUnlockableAnimals, buyAnimal, buyCosmetic, equipCosmetic,
    buyBreedingBoost, buyPremium, purchaseCoinBundle
  };
})();
