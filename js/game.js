/* ============================================
   INTO THE DEEP - Main Game Module
   State machine, rendering, event handlers
   ============================================ */

const Game = (() => {
  let gameState = null;
  let currentScreen = 'title';
  let worldAnimFrame = null;
  let combatEnemy = null;
  let multiMode = false;
  let multiTurn = 'player'; // player or enemy (for multiplayer combat)
  let breedSlot = 0;
  let breedAnimals = [null, null];
  let shopReturnScreen = 'title';

  // ---- Init ----
  function init() {
    gameState = Storage.load();
    Progression.updateZoneUnlocks(gameState);
    createBubbles();
    bindEvents();
    showScreen('title');
    startAutoSave();
    Progression.checkDailyBonus(gameState) && toast('Daily bonus! +10 Fitness', 'toast-level');
  }

  // ---- Screen management ----
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById('screen-' + id);
    if (screen) screen.classList.add('active');
    currentScreen = id;

    // Screen-specific setup
    switch (id) {
      case 'title': renderTitle(); break;
      case 'select': renderAnimalSelect(); break;
      case 'world': renderWorld(); break;
      case 'combat': break; // set up by startCombat
      case 'shop': renderShop('bundles'); break;
      case 'breeding': renderBreeding(); break;
      case 'profile': renderProfile(); break;
      case 'multiplayer': renderMultiplayer(); break;
    }
  }

  // ---- Bubbles ----
  function createBubbles() {
    const container = document.getElementById('bubbles');
    container.innerHTML = '';
    for (let i = 0; i < 20; i++) {
      const b = document.createElement('div');
      b.className = 'bubble';
      const size = 4 + Math.random() * 12;
      b.style.width = size + 'px';
      b.style.height = size + 'px';
      b.style.left = Math.random() * 100 + '%';
      b.style.bottom = -(Math.random() * 20) + '%';
      b.style.animationDuration = (8 + Math.random() * 12) + 's';
      b.style.animationDelay = Math.random() * 10 + 's';
      container.appendChild(b);
    }
  }

  // ---- Toast notifications ----
  function toast(msg, cls = '') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = 'toast ' + cls;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  // ---- Update coin displays ----
  function updateCoins() {
    document.querySelectorAll('.coin-display').forEach(el => {
      el.textContent = gameState.coins + ' coins';
    });
  }

  // ---- Title Screen ----
  function renderTitle() {
    updateCoins();
    // Animated swimming animals on title
    const container = document.getElementById('title-swimming');
    container.innerHTML = '';
    const titleAnimals = ['dolphin', 'sea-turtle', 'jellyfish', 'manta-ray'];
    titleAnimals.forEach((id, i) => {
      const div = document.createElement('div');
      div.className = 'swimming-animal';
      div.innerHTML = Animals.getSVG(id);
      div.style.width = '50px';
      div.style.height = '50px';
      div.style.bottom = (20 + i * 40) + 'px';
      div.style.animationDuration = (12 + i * 4) + 's';
      div.style.animationDelay = (i * 3) + 's';
      container.appendChild(div);
    });
  }

  // ---- Animal Select ----
  function renderAnimalSelect(filter = 'all') {
    updateCoins();
    const grid = document.getElementById('animal-grid');
    grid.innerHTML = '';
    const animals = Animals.getByType(filter);

    animals.forEach(a => {
      const card = document.createElement('div');
      const isUnlocked = gameState.unlockedAnimals.includes(a.id);
      card.className = 'animal-card' + (isUnlocked ? '' : ' locked');
      if (gameState.selectedAnimal === a.id) card.classList.add('selected');

      const lvl = Progression.getAnimalLevel(gameState, a.id);
      const tier = Animals.tierLabel(a.maxLevel);
      card.innerHTML = `
        <div class="card-art">${Animals.getSVG(a.id)}</div>
        <div class="card-name">${a.name}</div>
        <div class="card-rarity rarity-${a.rarity}">${a.rarity}</div>
        ${isUnlocked
          ? `<div class="card-level">Lv ${lvl}/${a.maxLevel}</div>`
          : `<div class="card-level card-level-locked">${a.unlockCost} coins</div>`}
        <div class="card-tier tier-${tier.toLowerCase()}">Tier ${tier}</div>
      `;
      card.onclick = () => showAnimalPreview(a, isUnlocked);
      grid.appendChild(card);
    });

    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
  }

  function showAnimalPreview(animal, isUnlocked) {
    const panel = document.getElementById('animal-preview');
    panel.classList.remove('hidden');

    document.getElementById('preview-art').innerHTML = Animals.getSVG(animal.id);
    const lvl = Progression.getAnimalLevel(gameState, animal.id);
    const tier = Animals.tierLabel(animal.maxLevel);
    document.getElementById('preview-name').textContent = animal.name;
    const typeBadge = document.getElementById('preview-type');
    typeBadge.textContent = animal.type;
    typeBadge.className = 'badge badge-' + animal.type;

    // Show level-scaled stats for owned animals, base stats for locked
    const scaled = isUnlocked ? Animals.getScaledStats(animal.id, lvl) : null;
    const displayHp = scaled ? scaled.hp : animal.hp;
    const displayAtk = scaled ? scaled.attack : animal.attack;
    const displayDef = scaled ? scaled.defense : animal.defense;
    const displaySpd = scaled ? scaled.speed : animal.speed;

    // Max stat scales with max possible level to show potential
    const maxScaled = Animals.getScaledStats(animal.id, animal.maxLevel);
    const max = Math.max(Animals.getMaxStat(), maxScaled ? maxScaled.hp : 150);

    const xp = Progression.getAnimalXp(gameState, animal.id);
    const xpNeeded = Animals.animalXpToNext(lvl);
    const atMax = lvl >= animal.maxLevel;

    document.getElementById('preview-stats').innerHTML = `
      <div class="preview-level-info">
        <span class="preview-level-badge tier-${tier.toLowerCase()}">Tier ${tier}</span>
        <span class="preview-level-text">Lv ${lvl} / ${animal.maxLevel}</span>
        ${!atMax && isUnlocked ? `<div class="bar-container" style="flex:1"><div class="bar" style="width:${(xp/xpNeeded)*100}%;background:var(--xp-purple)"></div></div>
        <span style="font-size:.6rem;color:#aaa">${xp}/${xpNeeded} XP</span>` : ''}
        ${atMax ? '<span style="font-size:.65rem;color:var(--coin-gold)">MAX</span>' : ''}
      </div>
    ` + [
      { name: 'HP', val: displayHp, cls: 'stat-hp' },
      { name: 'ATK', val: displayAtk, cls: 'stat-atk' },
      { name: 'DEF', val: displayDef, cls: 'stat-def' },
      { name: 'SPD', val: displaySpd, cls: 'stat-spd' },
    ].map(s => `
      <div class="stat-row">
        <span class="stat-name">${s.name}</span>
        <div class="bar-container"><div class="bar ${s.cls}" style="width:${(s.val / max) * 100}%"></div></div>
        <span style="font-size:.65rem;width:24px;text-align:right">${s.val}</span>
      </div>
    `).join('');

    document.getElementById('preview-special').textContent = animal.special.name + ': ' + animal.special.desc;

    const selectBtn = document.getElementById('btn-select-animal');
    const buyBtn = document.getElementById('btn-buy-animal');

    if (isUnlocked) {
      selectBtn.classList.remove('hidden');
      buyBtn.classList.add('hidden');
      selectBtn.onclick = () => {
        gameState.selectedAnimal = animal.id;
        Storage.save(gameState);
        panel.classList.add('hidden');
        showScreen('world');
      };
    } else {
      selectBtn.classList.add('hidden');
      buyBtn.classList.remove('hidden');
      buyBtn.textContent = `Unlock (${animal.unlockCost} coins)`;
      buyBtn.onclick = () => {
        const result = Shop.buyAnimal(gameState, animal.id);
        if (result.success) {
          toast(`Unlocked ${animal.name}!`, 'toast-coins');
          Storage.save(gameState);
          renderAnimalSelect();
          showAnimalPreview(animal, true);
        } else {
          toast('Not enough coins!', 'toast-error');
        }
      };
    }
  }

  // ---- World ----
  function renderWorld() {
    if (!gameState.selectedAnimal) {
      showScreen('select');
      return;
    }
    updateCoins();
    const aLvl = Progression.getAnimalLevel(gameState, gameState.selectedAnimal);
    const aData = Animals.getAnimal(gameState.selectedAnimal);
    document.getElementById('level-world').textContent = `Lv ${aLvl}/${aData.maxLevel}`;

    const zoneId = gameState.currentZone || 'coral-reef';
    const worldData = World.enterZone(zoneId, gameState);
    const zone = worldData.zone;

    document.getElementById('zone-title').textContent = zone.name;

    // Zone background
    const map = document.getElementById('world-map');
    map.innerHTML = `<div class="zone-bg ${zone.bgClass}"></div>`;

    // Add decorations
    addZoneDecorations(map, zone);

    // Player
    const playerEl = document.getElementById('player-in-world');
    playerEl.innerHTML = Animals.getSVG(gameState.selectedAnimal);
    applyCosmetics(playerEl, gameState.selectedAnimal);
    updatePlayerWorldPos();

    // Entities
    renderWorldEntities();

    // Coins
    renderWorldCoins();

    // HUD
    document.getElementById('hud-animal-art').innerHTML = Animals.getSVG(gameState.selectedAnimal);
    updateWorldHUD();

    // Zone nav
    renderZoneNav();

    // Start world loop
    if (worldAnimFrame) cancelAnimationFrame(worldAnimFrame);
    worldLoop();

    // Touch/click to move
    const viewport = document.getElementById('world-viewport');
    viewport.onclick = (e) => {
      const rect = viewport.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      World.setPlayerPos(x, y);
      updatePlayerWorldPos();
    };
  }

  function addZoneDecorations(map, zone) {
    const decoCount = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < decoCount; i++) {
      const deco = document.createElement('div');
      deco.className = 'zone-decor';
      deco.style.left = (5 + Math.random() * 90) + '%';
      deco.style.bottom = Math.random() * 30 + '%';
      if (zone.id === 'coral-reef') {
        deco.className += ' coral';
        deco.textContent = ['🪸', '🌿', '🐚'][Math.floor(Math.random() * 3)];
      } else if (zone.id === 'deep-trench') {
        deco.textContent = ['🪨', '💀'][Math.floor(Math.random() * 2)];
      } else if (zone.id === 'arctic-waters') {
        deco.textContent = ['❄️', '🧊'][Math.floor(Math.random() * 2)];
      } else {
        deco.textContent = ['🌊', '🫧', '🪸'][Math.floor(Math.random() * 3)];
      }
      deco.style.fontSize = (1 + Math.random()) + 'rem';
      deco.style.opacity = 0.2 + Math.random() * 0.3;
      map.appendChild(deco);
    }
  }

  function updatePlayerWorldPos() {
    const pos = World.getPlayerPos();
    const el = document.getElementById('player-in-world');
    el.style.left = pos.x + '%';
    el.style.top = pos.y + '%';
  }

  function renderWorldEntities() {
    const container = document.getElementById('world-entities');
    container.innerHTML = '';
    for (const ent of World.getEntities()) {
      const el = document.createElement('div');
      el.className = 'world-entity' + (ent.isBoss ? ' boss' : '');
      el.innerHTML = Animals.getSVG(ent.id);
      el.style.left = ent.x + '%';
      el.style.top = ent.y + '%';
      el.onclick = (e) => {
        e.stopPropagation();
        startCombat(ent);
      };
      container.appendChild(el);
    }
  }

  function renderWorldCoins() {
    const container = document.getElementById('world-coins');
    container.innerHTML = '';
    for (const coin of World.getCoins()) {
      if (coin.collected) continue;
      const el = document.createElement('div');
      el.className = 'world-coin';
      el.style.left = coin.x + '%';
      el.style.top = coin.y + '%';
      container.appendChild(el);
    }
  }

  function updateWorldHUD() {
    const animal = Animals.getAnimal(gameState.selectedAnimal);
    document.getElementById('hud-hp').style.width = '100%';
    document.getElementById('hud-fitness').style.width = Math.min(100, gameState.fitness / 2) + '%';
  }

  function renderZoneNav() {
    const nav = document.getElementById('zone-nav');
    nav.innerHTML = '';
    for (const zone of World.getAllZones()) {
      const btn = document.createElement('button');
      const unlocked = gameState.unlockedZones.includes(zone.id);
      const isPremium = zone.premium;
      btn.className = 'zone-btn' +
        (zone.id === gameState.currentZone ? ' active' : '') +
        (!unlocked ? ' locked' : '') +
        (isPremium ? ' premium' : '');
      btn.textContent = zone.name + (isPremium && !unlocked ? ' 🔒' : '');
      if (unlocked) {
        btn.onclick = () => {
          gameState.currentZone = zone.id;
          Storage.save(gameState);
          renderWorld();
        };
      }
      nav.appendChild(btn);
    }
  }

  function worldLoop() {
    // Move AI entities
    AI.moveEntities(World.getEntities());

    // Check collisions
    const collision = World.checkCollisions();

    if (collision.coinsCollected > 0) {
      Progression.addCoins(gameState, collision.coinsCollected);
      updateCoins();
      renderWorldCoins();
      toast('+' + collision.coinsCollected + ' coins!', 'toast-coins');
    }

    // Check same species attraction
    if (World.checkSameSpecies(gameState.selectedAnimal)) {
      // Temporary stat buff shown in HUD
      document.getElementById('hud-fitness').style.background = 'linear-gradient(90deg, var(--attraction-pink), var(--shallow-cyan))';
    } else {
      document.getElementById('hud-fitness').style.background = '';
    }

    // Re-render entity positions
    const entityEls = document.querySelectorAll('.world-entity');
    const entities = World.getEntities();
    entityEls.forEach((el, i) => {
      if (entities[i]) {
        el.style.left = entities[i].x + '%';
        el.style.top = entities[i].y + '%';
      }
    });

    if (currentScreen === 'world') {
      worldAnimFrame = requestAnimationFrame(() => setTimeout(worldLoop, 200));
    }
  }

  // ---- Combat ----
  function startCombat(entity) {
    if (worldAnimFrame) cancelAnimationFrame(worldAnimFrame);
    combatEnemy = entity;

    const playerAnimalLvl = Progression.getAnimalLevel(gameState, gameState.selectedAnimal);
    const combatState = Combat.init(
      gameState.selectedAnimal,
      entity.id,
      entity.level,
      entity.isBoss,
      playerAnimalLvl
    );

    showScreen('combat');
    renderCombat(combatState);
  }

  function renderCombat(combatState) {
    // Background matches current zone
    const zone = World.getCurrentZone();
    document.getElementById('combat-bg').className = 'combat-bg';
    if (zone) {
      document.getElementById('combat-bg').innerHTML = `<div class="zone-bg ${zone.bgClass}" style="opacity:.5"></div>`;
    }

    // Names with levels
    document.getElementById('combat-player-name').textContent =
      combatState.player.name + ' Lv' + (combatState.player.animalLevel || 1);
    document.getElementById('combat-enemy-name').textContent =
      combatState.enemy.name + ' Lv' + (combatState.enemy.animalLevel || 1);

    // Art
    const playerArt = document.getElementById('combat-player-art');
    playerArt.innerHTML = Animals.getSVG(combatState.player.id);
    applyCosmetics(playerArt, combatState.player.id);

    document.getElementById('combat-enemy-art').innerHTML = Animals.getSVG(combatState.enemy.id);

    // Special button label
    document.getElementById('btn-special').textContent = combatState.player.special.name;

    updateCombatUI(combatState);
  }

  function updateCombatUI(combatState) {
    const pHp = combatState.player.currentHp / combatState.player.maxHp * 100;
    const eHp = combatState.enemy.currentHp / combatState.enemy.maxHp * 100;
    document.getElementById('combat-player-hp').style.width = pHp + '%';
    document.getElementById('combat-enemy-hp').style.width = eHp + '%';
    document.getElementById('combat-player-hp-text').textContent =
      combatState.player.currentHp + '/' + combatState.player.maxHp;
    document.getElementById('combat-enemy-hp-text').textContent =
      combatState.enemy.currentHp + '/' + combatState.enemy.maxHp;

    // HP bar color
    document.getElementById('combat-player-hp').style.background =
      pHp < 25 ? 'var(--hp-red)' : '';
    document.getElementById('combat-enemy-hp').style.background =
      eHp < 25 ? 'var(--hp-red)' : '';

    // Enable/disable actions
    const isPlayerTurn = combatState.turn === 'player' && !combatState.finished;
    document.getElementById('btn-attack').disabled = !isPlayerTurn;
    document.getElementById('btn-defend').disabled = !isPlayerTurn;
    document.getElementById('btn-special').disabled = !isPlayerTurn;
  }

  function doCombatAction(action) {
    const combatState = Combat.getState();
    if (!combatState || combatState.finished) return;

    // Player action
    const result = Combat.playerAction(action);
    if (!result) return;

    // Animate
    animateCombat(result, 'player');
    showCombatLog(result.log);

    // Show combo
    if (result.comboBonus) {
      showCombo(combatState.player.combo);
    }

    if (result.finished) {
      handleCombatEnd(result);
      return;
    }

    // Enemy turn after delay
    setTimeout(() => {
      const aiAction = multiMode ? null : AI.chooseAction(combatState);
      if (!multiMode) {
        const enemyResult = Combat.enemyAction(aiAction);
        if (enemyResult) {
          animateCombat(enemyResult, 'enemy');
          showCombatLog(enemyResult.log);
          if (enemyResult.finished) {
            handleCombatEnd(enemyResult);
            return;
          }
        }
      }
      updateCombatUI(Combat.getState());
    }, 800);

    updateCombatUI(combatState);
  }

  function animateCombat(result, who) {
    const playerArt = document.getElementById('combat-player-art');
    const enemyArt = document.getElementById('combat-enemy-art');

    for (const effect of result.effects) {
      if (effect === 'enemy-hit') {
        enemyArt.classList.add('hit');
        spawnHitParticles(enemyArt);
        setTimeout(() => enemyArt.classList.remove('hit'), 300);
      }
      if (effect === 'player-hit') {
        playerArt.classList.add('hit');
        spawnHitParticles(playerArt);
        setTimeout(() => playerArt.classList.remove('hit'), 300);
      }
      if (effect === 'defend' || effect === 'special-defend') {
        (who === 'player' ? playerArt : enemyArt).classList.add('defending');
        setTimeout(() => {
          playerArt.classList.remove('defending');
          enemyArt.classList.remove('defending');
        }, 500);
      }
      if (who === 'player' && (result.action === 'attack' || result.action === 'special')) {
        playerArt.classList.add('attacking');
        setTimeout(() => playerArt.classList.remove('attacking'), 400);
      }
      if (who === 'enemy' && (result.action === 'attack' || result.action === 'special')) {
        enemyArt.classList.add('attacking');
        setTimeout(() => enemyArt.classList.remove('attacking'), 400);
      }
    }
  }

  function spawnHitParticles(targetEl) {
    const container = document.getElementById('combat-effects');
    const rect = targetEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const cx = rect.left - containerRect.left + rect.width / 2;
    const cy = rect.top - containerRect.top + rect.height / 2;

    for (let i = 0; i < 6; i++) {
      const p = document.createElement('div');
      p.className = 'hit-particle';
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.setProperty('--dx', (Math.random() - 0.5) * 80 + 'px');
      p.style.setProperty('--dy', (Math.random() - 0.5) * 80 + 'px');
      p.style.background = ['var(--coral)', 'var(--coin-gold)', 'white'][Math.floor(Math.random() * 3)];
      container.appendChild(p);
      setTimeout(() => p.remove(), 500);
    }
  }

  function showCombatLog(msg) {
    const log = document.getElementById('combat-log');
    log.innerHTML = `<span class="log-entry">${msg}</span>`;
  }

  function showCombo(count) {
    const el = document.getElementById('combo-display');
    document.getElementById('combo-count').textContent = count;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 1500);
  }

  function handleCombatEnd(result) {
    updateCombatUI(Combat.getState());

    setTimeout(() => {
      if (multiMode) {
        handleMultiCombatEnd(result);
        return;
      }

      const won = result.winner === 'player';
      gameState.wins += won ? 1 : 0;
      gameState.losses += won ? 0 : 1;
      Progression.updateFitness(gameState, won);

      if (won && combatEnemy) {
        World.removeEntity(combatEnemy);
      }

      // Show result screen
      document.getElementById('result-title').textContent = won ? 'Victory!' : 'Defeated...';
      document.getElementById('result-title').style.color = won ? 'var(--premium-glow)' : 'var(--coral)';

      const animal = Animals.getAnimal(gameState.selectedAnimal);
      document.getElementById('result-art').innerHTML = Animals.getSVG(gameState.selectedAnimal);

      const rewardsEl = document.getElementById('result-rewards');
      if (won) {
        const r = result.rewards;
        Progression.addCoins(gameState, r.coins);
        const lvl = Progression.addXP(gameState, r.xp);
        Progression.addStatusPoints(gameState, r.statusPoints);

        // Award animal XP to the selected animal
        const animalXpGain = r.xp + Math.round(r.statusPoints * 0.5);
        const animalLvl = Progression.addAnimalXP(gameState, gameState.selectedAnimal, animalXpGain);
        const animalData = Animals.getAnimal(gameState.selectedAnimal);
        const currentAnimalLv = Progression.getAnimalLevel(gameState, gameState.selectedAnimal);

        rewardsEl.innerHTML = `
          <div class="reward-item coins">+${r.coins} Coins</div>
          <div class="reward-item xp">+${r.xp} XP</div>
          <div class="reward-item status">+${r.statusPoints} Status Points</div>
          <div class="reward-item" style="color:var(--shallow-cyan)">+${animalXpGain} ${animalData.name} XP (Lv ${currentAnimalLv}/${animalData.maxLevel})</div>
          ${lvl.leveledUp ? `<div class="reward-item" style="color:var(--premium-glow)">LEVEL UP! Now Level ${lvl.newLevel}!</div>` : ''}
          ${animalLvl.leveledUp ? `<div class="reward-item" style="color:var(--coin-gold)">${animalData.name} leveled up to Lv ${animalLvl.newLevel}!</div>` : ''}
          ${animalLvl.maxed ? `<div class="reward-item" style="color:var(--coin-gold)">${animalData.name} is MAX LEVEL!</div>` : ''}
        `;
        if (lvl.leveledUp) toast('Level Up! Now Level ' + lvl.newLevel, 'toast-level');
        if (animalLvl.leveledUp) toast(animalData.name + ' reached Lv ' + animalLvl.newLevel + '!', 'toast-level');
      } else {
        rewardsEl.innerHTML = `
          <div class="reward-item" style="color:var(--coral)">Fitness decreased</div>
          <div class="reward-item">Try a different strategy!</div>
        `;
      }

      Storage.save(gameState);
      showScreen('combat-result');
    }, 1000);
  }

  // ---- Shop ----
  function renderShop(tab = 'bundles') {
    updateCoins();
    const content = document.getElementById('shop-content');

    // Update tab buttons
    document.querySelectorAll('.shop-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });

    switch (tab) {
      case 'bundles': renderBundles(content); break;
      case 'animals': renderAnimalShop(content); break;
      case 'cosmetics': renderCosmeticShop(content); break;
      case 'breeding': renderBreedingShop(content); break;
      case 'premium': renderPremiumShop(content); break;
    }
  }

  function renderBundles(el) {
    el.innerHTML = Shop.getCoinBundles().map(b => `
      <div class="bundle-card ${b.popular ? 'popular' : ''}">
        <div style="font-size:2rem">${b.icon}</div>
        <div class="bundle-coins">${b.coins.toLocaleString()}</div>
        <div class="bundle-label">${b.name}</div>
        <div class="bundle-price" data-bundle="${b.id}">${b.price}</div>
        ${b.bonus ? `<div class="bundle-bonus">${b.bonus}</div>` : ''}
      </div>
    `).join('');

    el.querySelectorAll('.bundle-price').forEach(btn => {
      btn.onclick = () => {
        const result = Shop.purchaseCoinBundle(gameState, btn.dataset.bundle);
        if (result.success) {
          toast(`+${result.coins} coins added!`, 'toast-coins');
          updateCoins();
          Storage.save(gameState);
        }
      };
    });
  }

  function renderAnimalShop(el) {
    const animals = Shop.getUnlockableAnimals(gameState);
    if (animals.length === 0) {
      el.innerHTML = '<p style="text-align:center;color:#aaa;padding:40px">All animals unlocked!</p>';
      return;
    }
    el.innerHTML = animals.map(a => `
      <div class="shop-item" data-animal="${a.id}">
        <div class="item-icon">${Animals.getSVG(a.id)}</div>
        <div class="item-info">
          <div class="item-name">${a.name}</div>
          <div class="item-desc">${a.type} - ${a.rarity}</div>
        </div>
        <div class="item-price price-coins">${a.unlockCost} coins</div>
      </div>
    `).join('');

    el.querySelectorAll('.shop-item').forEach(item => {
      item.onclick = () => {
        const result = Shop.buyAnimal(gameState, item.dataset.animal);
        if (result.success) {
          toast('Animal unlocked!', 'toast-coins');
          renderShop('animals');
          Storage.save(gameState);
        } else {
          toast(result.reason === 'not enough coins' ? 'Not enough coins!' : 'Already owned!', 'toast-error');
        }
      };
    });
  }

  function renderCosmeticShop(el) {
    el.innerHTML = Shop.getCosmetics().map(c => {
      const owned = gameState.ownedCosmetics.includes(c.id);
      return `
        <div class="shop-item ${owned ? '' : ''}" data-cosmetic="${c.id}">
          <div class="item-icon" style="font-size:1.8rem">${c.icon}</div>
          <div class="item-info">
            <div class="item-name">${c.name}</div>
            <div class="item-desc">${c.desc}</div>
          </div>
          ${owned ? '<div class="item-owned">OWNED</div>' : `<div class="item-price price-coins">${c.price} coins</div>`}
        </div>
      `;
    }).join('');

    el.querySelectorAll('.shop-item').forEach(item => {
      item.onclick = () => {
        const id = item.dataset.cosmetic;
        if (gameState.ownedCosmetics.includes(id)) {
          // Toggle equip
          if (gameState.selectedAnimal) {
            Shop.equipCosmetic(gameState, gameState.selectedAnimal, id);
            toast('Cosmetic toggled!');
            Storage.save(gameState);
          }
          return;
        }
        const result = Shop.buyCosmetic(gameState, id);
        if (result.success) {
          toast('Cosmetic purchased!', 'toast-coins');
          renderShop('cosmetics');
          Storage.save(gameState);
        } else {
          toast('Not enough coins!', 'toast-error');
        }
      };
    });
  }

  function renderBreedingShop(el) {
    el.innerHTML = Shop.getBreedingBoosts().map(b => {
      const owned = gameState.ownedBreedingBoosts.includes(b.id);
      return `
        <div class="shop-item" data-boost="${b.id}">
          <div class="item-icon" style="font-size:1.8rem">${b.icon}</div>
          <div class="item-info">
            <div class="item-name">${b.name}</div>
            <div class="item-desc">${b.desc}</div>
          </div>
          ${owned ? '<div class="item-owned">OWNED</div>' : `<div class="item-price price-coins">${b.price} coins</div>`}
        </div>
      `;
    }).join('');

    el.querySelectorAll('.shop-item').forEach(item => {
      item.onclick = () => {
        const result = Shop.buyBreedingBoost(gameState, item.dataset.boost);
        if (result.success) {
          toast('Breeding boost purchased!', 'toast-coins');
          renderShop('breeding');
          Storage.save(gameState);
        } else {
          toast(result.reason === 'not enough coins' ? 'Not enough coins!' : 'Already owned!', 'toast-error');
        }
      };
    });
  }

  function renderPremiumShop(el) {
    el.innerHTML = Shop.getPremiumItems().map(p => {
      const owned = (p.id === 'luminous-lagoon' && gameState.purchasedPremiumWorld);
      return `
        <div class="shop-item featured" data-premium="${p.id}">
          <div class="item-icon" style="font-size:1.8rem">${p.icon}</div>
          <div class="item-info">
            <div class="item-name">${p.name}</div>
            <div class="item-desc">${p.desc}</div>
          </div>
          ${owned ? '<div class="item-owned">OWNED</div>' : `<div class="item-price price-coins">${p.price} coins</div>`}
        </div>
      `;
    }).join('');

    el.querySelectorAll('.shop-item').forEach(item => {
      item.onclick = () => {
        const result = Shop.buyPremium(gameState, item.dataset.premium);
        if (result.success) {
          toast('Premium item purchased!', 'toast-coins');
          renderShop('premium');
          Storage.save(gameState);
        } else {
          toast(result.reason === 'not enough coins' ? 'Not enough coins!' : result.reason, 'toast-error');
        }
      };
    });
  }

  // ---- Breeding ----
  function renderBreeding() {
    breedAnimals = [null, null];
    breedSlot = 0;

    const slot1 = document.getElementById('breed-slot-1');
    const slot2 = document.getElementById('breed-slot-2');
    slot1.innerHTML = '<p>Select Animal</p>';
    slot1.classList.remove('filled');
    slot2.innerHTML = '<p>Select Animal</p>';
    slot2.classList.remove('filled');

    document.getElementById('breed-attraction').style.width = '0%';
    document.getElementById('btn-breed').disabled = true;
    document.getElementById('breed-result').classList.add('hidden');

    // Cooldown check
    const check = Progression.canBreed(gameState);
    const cooldownEl = document.getElementById('breed-cooldown');
    if (!check.can) {
      cooldownEl.classList.remove('hidden');
      updateCooldownTimer(check.remaining);
    } else {
      cooldownEl.classList.add('hidden');
    }

    // Owned animals list
    renderBreedOwnedList();
  }

  function renderBreedOwnedList() {
    const container = document.getElementById('breed-owned-list');
    container.innerHTML = '<h3>Your Animals</h3><div class="owned-grid" id="breed-grid"></div>';
    const grid = document.getElementById('breed-grid');

    gameState.unlockedAnimals.forEach(id => {
      const el = document.createElement('div');
      el.className = 'owned-mini';
      el.innerHTML = Animals.getSVG(id);
      el.onclick = () => selectForBreeding(id, el);
      grid.appendChild(el);
    });
  }

  function selectForBreeding(animalId, el) {
    if (breedSlot >= 2) breedSlot = 0;

    breedAnimals[breedSlot] = animalId;
    const slotEl = document.getElementById('breed-slot-' + (breedSlot + 1));
    slotEl.innerHTML = Animals.getSVG(animalId);
    slotEl.classList.add('filled');
    breedSlot++;

    // Update attraction meter
    if (breedAnimals[0] && breedAnimals[1]) {
      const attraction = Progression.getAttraction(breedAnimals[0], breedAnimals[1]);
      document.getElementById('breed-attraction').style.width = attraction + '%';
      document.getElementById('btn-breed').disabled = false;
    }
  }

  function doBreed() {
    if (!breedAnimals[0] || !breedAnimals[1]) return;

    const result = Progression.breed(gameState, breedAnimals[0], breedAnimals[1]);
    if (result.success) {
      const resultEl = document.getElementById('breed-result');
      resultEl.classList.remove('hidden');
      document.getElementById('offspring-display').innerHTML = result.offspring.map(o => {
        const animal = Animals.getAnimal(o.id);
        return `<div style="display:inline-block;width:50px;height:50px;margin:4px">${Animals.getSVG(o.id)}</div>
                <span style="font-size:.8rem">${animal.name}</span>`;
      }).join('');
      toast(`${result.offspring.length} offspring born!`, 'toast-level');
      Storage.save(gameState);
    } else {
      if (result.reason === 'cooldown') {
        toast('Breeding on cooldown!', 'toast-error');
      } else {
        toast('Breeding failed - low attraction!', 'toast-error');
      }
    }
  }

  function updateCooldownTimer(remaining) {
    const timerEl = document.getElementById('cooldown-timer');
    const update = () => {
      remaining -= 1000;
      if (remaining <= 0) {
        document.getElementById('breed-cooldown').classList.add('hidden');
        document.getElementById('btn-breed').disabled = false;
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      setTimeout(update, 1000);
    };
    update();
  }

  // ---- Profile ----
  function renderProfile() {
    if (gameState.selectedAnimal) {
      document.getElementById('profile-animal-art').innerHTML = Animals.getSVG(gameState.selectedAnimal);
      const selAnimal = Animals.getAnimal(gameState.selectedAnimal);
      const selLvl = Progression.getAnimalLevel(gameState, gameState.selectedAnimal);
      document.getElementById('profile-animal-name').textContent =
        `${selAnimal.name} (Lv ${selLvl}/${selAnimal.maxLevel} - Tier ${Animals.tierLabel(selAnimal.maxLevel)})`;
    }
    document.getElementById('profile-level').textContent = gameState.level;
    document.getElementById('profile-xp').textContent = gameState.xp + '/' + Progression.xpToLevel(gameState.level);
    document.getElementById('profile-status').textContent = gameState.statusPoints;
    document.getElementById('profile-fitness').textContent = gameState.fitness;
    document.getElementById('profile-coins').textContent = gameState.coins;
    document.getElementById('profile-wins').textContent = gameState.wins;
    document.getElementById('profile-offspring').textContent = gameState.offspring.length;

    // Cosmetics
    const cosEl = document.getElementById('profile-cosmetics');
    if (gameState.ownedCosmetics.length === 0) {
      cosEl.innerHTML = '<span style="color:#666;font-size:.8rem">None yet - visit the shop!</span>';
    } else {
      cosEl.innerHTML = gameState.ownedCosmetics.map(id => {
        const item = Shop.getCosmetics().find(c => c.id === id);
        return item ? `<span class="cosmetic-tag">${item.icon} ${item.name}</span>` : '';
      }).join('');
    }

    // Collection
    const collEl = document.getElementById('profile-collection');
    collEl.innerHTML = Animals.getAll().map(a => {
      const owned = gameState.unlockedAnimals.includes(a.id);
      const aLv = Progression.getAnimalLevel(gameState, a.id);
      return `<div class="collection-item ${owned ? 'owned' : 'not-owned'}" title="${a.name} Lv${aLv}/${a.maxLevel}">
        ${Animals.getSVG(a.id)}
        ${owned ? `<span class="collection-level">Lv${aLv}</span>` : ''}
      </div>`;
    }).join('');
  }

  // ---- Multiplayer ----
  function renderMultiplayer() {
    Multiplayer.init();
    const mState = Multiplayer.getState();

    document.getElementById('multi-slot-1').innerHTML = 'Choose Animal';
    document.getElementById('multi-slot-1').classList.remove('filled');
    document.getElementById('multi-slot-2').innerHTML = 'Choose Animal';
    document.getElementById('multi-slot-2').classList.remove('filled');
    document.getElementById('btn-start-multi').disabled = true;

    document.getElementById('multi-picking-for').textContent = 'Player 1';
    document.getElementById('multi-picker').classList.remove('hidden');

    renderMultiAnimalGrid();
  }

  function renderMultiAnimalGrid() {
    const grid = document.getElementById('multi-animal-grid');
    grid.innerHTML = '';
    // In multiplayer, all animals available
    Animals.getAll().forEach(a => {
      const card = document.createElement('div');
      card.className = 'animal-card';
      card.innerHTML = `
        <div class="card-art">${Animals.getSVG(a.id)}</div>
        <div class="card-name">${a.name}</div>
      `;
      card.onclick = () => {
        const mState = Multiplayer.getState();
        Multiplayer.selectAnimal(mState.currentPicker, a.id);

        const slot = document.getElementById('multi-slot-' + (mState.currentPicker === 2 ? 1 : mState.currentPicker));
        if (mState.currentPicker === 2) {
          document.getElementById('multi-slot-1').innerHTML = Animals.getSVG(mState.player1.animalId);
          document.getElementById('multi-slot-1').classList.add('filled');
          document.getElementById('multi-picking-for').textContent = 'Player 2';
        }
        if (Multiplayer.bothSelected()) {
          document.getElementById('multi-slot-2').innerHTML = Animals.getSVG(mState.player2.animalId);
          document.getElementById('multi-slot-2').classList.add('filled');
          document.getElementById('multi-picker').classList.add('hidden');
          document.getElementById('btn-start-multi').disabled = false;
        }
      };
      grid.appendChild(card);
    });
  }

  function startMultiCombat() {
    multiMode = true;
    const combatState = Multiplayer.startCombat();
    showScreen('combat');
    renderCombat(combatState);

    // In multiplayer, both sides are human-controlled
    // Player 1 = "player" turn, Player 2 = "enemy" turn
    multiTurn = 'player';
    updateMultiTurnLabel();
  }

  function updateMultiTurnLabel() {
    const combatState = Combat.getState();
    if (!combatState) return;
    const label = combatState.turn === 'player' ? 'Player 1\'s Turn' : 'Player 2\'s Turn';
    showCombatLog(label);
  }

  function doMultiAction(action) {
    const combatState = Combat.getState();
    if (!combatState || combatState.finished) return;

    if (combatState.turn === 'player') {
      const result = Combat.playerAction(action);
      if (!result) return;
      animateCombat(result, 'player');
      showCombatLog(result.log);
      if (result.finished) {
        handleMultiCombatEnd(result);
        return;
      }
      updateCombatUI(Combat.getState());
      setTimeout(updateMultiTurnLabel, 800);
    } else {
      const result = Combat.enemyAction(action);
      if (!result) return;
      animateCombat(result, 'enemy');
      showCombatLog(result.log);
      if (result.finished) {
        handleMultiCombatEnd(result);
        return;
      }
      updateCombatUI(Combat.getState());
      setTimeout(updateMultiTurnLabel, 800);
    }
  }

  function handleMultiCombatEnd(result) {
    Multiplayer.recordResult(result.winner);
    const mState = Multiplayer.getState();

    setTimeout(() => {
      if (Multiplayer.isMatchOver()) {
        const winner = Multiplayer.getWinner();
        document.getElementById('multi-result-title').textContent = winner === 'Tie' ? 'It\'s a Tie!' : winner + ' Wins!';
        document.getElementById('multi-scores').innerHTML = `
          <div class="multi-score">
            <div>Player 1</div>
            <div class="score-value">${mState.player1.score}</div>
          </div>
          <div class="multi-score">
            <div>Player 2</div>
            <div class="score-value">${mState.player2.score}</div>
          </div>
        `;
        showScreen('multi-result');
        multiMode = false;
      } else {
        toast(`Round ${mState.round} complete! ${result.winner === 'player' ? 'P1' : 'P2'} wins!`);
        Multiplayer.nextRound();
        renderMultiplayer();
        showScreen('multiplayer');
      }
    }, 1000);
  }

  // ---- Cosmetic application ----
  function applyCosmetics(el, animalId) {
    const equipped = gameState.equippedCosmetics[animalId] || [];
    el.classList.remove('cosmetic-jellyfish-aura', 'cosmetic-red-patches',
      'cosmetic-golden-scales', 'cosmetic-neon-tentacles', 'cosmetic-coral-crown');
    el.style.position = 'relative';

    for (const cosId of equipped) {
      const cosmetic = Shop.getCosmetics().find(c => c.id === cosId);
      if (cosmetic) el.classList.add(cosmetic.cssClass);
    }
  }

  // ---- Auto save ----
  function startAutoSave() {
    setInterval(() => {
      if (gameState) {
        gameState.totalPlayTime += 30;
        Storage.save(gameState);
      }
    }, 30000);
  }

  // ---- Event bindings ----
  function bindEvents() {
    // Title
    document.getElementById('btn-play').onclick = () => showScreen('select');
    document.getElementById('btn-multiplayer').onclick = () => showScreen('multiplayer');
    document.getElementById('btn-shop-title').onclick = () => { shopReturnScreen = 'title'; showScreen('shop'); };
    document.getElementById('btn-profile-title').onclick = () => showScreen('profile');

    // Animal select
    document.getElementById('btn-back-select').onclick = () => {
      document.getElementById('animal-preview').classList.add('hidden');
      showScreen('title');
    };
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.onclick = () => renderAnimalSelect(btn.dataset.filter);
    });

    // World
    document.getElementById('btn-back-world').onclick = () => {
      if (worldAnimFrame) cancelAnimationFrame(worldAnimFrame);
      showScreen('title');
    };
    document.getElementById('btn-world-shop').onclick = () => { shopReturnScreen = 'world'; showScreen('shop'); };
    document.getElementById('btn-world-breed').onclick = () => showScreen('breeding');
    document.getElementById('btn-world-profile').onclick = () => showScreen('profile');

    // Combat actions
    document.getElementById('btn-attack').onclick = () => {
      multiMode ? doMultiAction('attack') : doCombatAction('attack');
    };
    document.getElementById('btn-defend').onclick = () => {
      multiMode ? doMultiAction('defend') : doCombatAction('defend');
    };
    document.getElementById('btn-special').onclick = () => {
      multiMode ? doMultiAction('special') : doCombatAction('special');
    };

    // Combat result
    document.getElementById('btn-result-continue').onclick = () => showScreen('world');

    // Shop
    document.getElementById('btn-back-shop').onclick = () => showScreen(shopReturnScreen);
    document.querySelectorAll('.shop-tab').forEach(tab => {
      tab.onclick = () => renderShop(tab.dataset.tab);
    });

    // Breeding
    document.getElementById('btn-back-breed').onclick = () => showScreen('world');
    document.getElementById('btn-breed').onclick = doBreed;

    // Profile
    document.getElementById('btn-back-profile').onclick = () => showScreen('title');

    // Multiplayer
    document.getElementById('btn-back-multi').onclick = () => { Multiplayer.reset(); multiMode = false; showScreen('title'); };
    document.getElementById('btn-start-multi').onclick = startMultiCombat;
    document.getElementById('btn-multi-rematch').onclick = () => { renderMultiplayer(); showScreen('multiplayer'); };
    document.getElementById('btn-multi-menu').onclick = () => { Multiplayer.reset(); multiMode = false; showScreen('title'); };

    // Keyboard for world movement
    document.addEventListener('keydown', (e) => {
      if (currentScreen !== 'world') return;
      const speed = 4;
      switch (e.key) {
        case 'ArrowUp': case 'w': World.movePlayer(0, -speed); break;
        case 'ArrowDown': case 's': World.movePlayer(0, speed); break;
        case 'ArrowLeft': case 'a': World.movePlayer(-speed, 0); break;
        case 'ArrowRight': case 'd': World.movePlayer(speed, 0); break;
      }
      updatePlayerWorldPos();
    });
  }

  return { init };
})();

// Boot
document.addEventListener('DOMContentLoaded', Game.init);
