/* ============================================
   INTO THE DEEP - Storage Module
   Save/Load game state via localStorage
   ============================================ */

const Storage = (() => {
  const KEY = 'into_the_deep_save';

  const defaultState = () => ({
    coins: 50,
    level: 1,
    xp: 0,
    statusPoints: 0,
    fitness: 100,
    wins: 0,
    losses: 0,
    selectedAnimal: null,
    unlockedAnimals: ['dolphin', 'crab', 'sea-turtle'],
    equippedCosmetics: {},    // { animalId: ['cosmetic-id', ...] }
    ownedCosmetics: [],
    offspring: [],
    breedCooldownEnd: 0,
    currentZone: 'coral-reef',
    unlockedZones: ['coral-reef'],
    purchasedPremiumWorld: false,
    ownedBreedingBoosts: [],
    statusBoostEnd: 0,
    dailyPlayDate: null,
    totalPlayTime: 0,
    lastSave: Date.now(),
  });

  function save(state) {
    try {
      state.lastSave = Date.now();
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const saved = JSON.parse(raw);
      // Merge with defaults so new fields are added on update
      return { ...defaultState(), ...saved };
    } catch (e) {
      console.warn('Load failed:', e);
      return defaultState();
    }
  }

  function reset() {
    localStorage.removeItem(KEY);
    return defaultState();
  }

  function hasSave() {
    return localStorage.getItem(KEY) !== null;
  }

  return { save, load, reset, hasSave, defaultState };
})();
