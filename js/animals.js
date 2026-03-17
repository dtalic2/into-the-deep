/* ============================================
   INTO THE DEEP - Animals Module
   All animal definitions, stats, and SVG art
   ============================================ */

const Animals = (() => {

  // ---- SVG art generators ----
  // Each returns an SVG string for the animal (cartoon style)

  const svgArt = {
    'dolphin': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="52" rx="32" ry="16" fill="#5b9bd5" />
      <ellipse cx="50" cy="52" rx="28" ry="13" fill="#7ec8e3" />
      <path d="M78 48 Q92 40 85 55 Q82 52 78 52Z" fill="#5b9bd5"/>
      <path d="M22 52 Q10 42 16 36 Q20 42 22 48Z" fill="#5b9bd5"/>
      <path d="M50 38 Q55 28 48 26 Q44 30 50 38Z" fill="#5b9bd5"/>
      <circle cx="30" cy="49" r="3" fill="#1a1a2e"/>
      <circle cx="31" cy="48" r="1" fill="white"/>
      <path d="M20 52 Q16 54 20 56" fill="none" stroke="#5b9bd5" stroke-width="1.5"/>
      <ellipse cx="50" cy="55" rx="26" ry="10" fill="#b8dff0" opacity=".3"/>
    </svg>`,

    'crab': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="58" rx="24" ry="18" fill="#e63946"/>
      <ellipse cx="50" cy="58" rx="20" ry="14" fill="#ff6b6b"/>
      <circle cx="38" cy="40" r="8" fill="#e63946"/>
      <circle cx="62" cy="40" r="8" fill="#e63946"/>
      <circle cx="38" cy="38" r="4" fill="#1a1a2e"/>
      <circle cx="62" cy="38" r="4" fill="#1a1a2e"/>
      <circle cx="39" cy="37" r="1.5" fill="white"/>
      <circle cx="63" cy="37" r="1.5" fill="white"/>
      <path d="M26 54 Q10 44 14 38 Q18 42 22 48" fill="#e63946" stroke="#c1121f" stroke-width="1"/>
      <path d="M14 38 Q8 34 12 30" fill="#e63946"/>
      <path d="M74 54 Q90 44 86 38 Q82 42 78 48" fill="#e63946" stroke="#c1121f" stroke-width="1"/>
      <path d="M86 38 Q92 34 88 30" fill="#e63946"/>
      <path d="M36 74 Q34 82 30 80" fill="none" stroke="#e63946" stroke-width="3" stroke-linecap="round"/>
      <path d="M44 76 Q43 84 40 82" fill="none" stroke="#e63946" stroke-width="3" stroke-linecap="round"/>
      <path d="M56 76 Q57 84 60 82" fill="none" stroke="#e63946" stroke-width="3" stroke-linecap="round"/>
      <path d="M64 74 Q66 82 70 80" fill="none" stroke="#e63946" stroke-width="3" stroke-linecap="round"/>
    </svg>`,

    'sea-turtle': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="55" rx="28" ry="22" fill="#2d6a4f"/>
      <ellipse cx="50" cy="55" rx="24" ry="18" fill="#40916c"/>
      <path d="M35 45 L50 40 L65 45 L62 58 L50 62 L38 58Z" fill="#2d6a4f" opacity=".6"/>
      <ellipse cx="32" cy="42" rx="10" ry="6" fill="#52b788" transform="rotate(-20 32 42)"/>
      <circle cx="28" cy="40" r="3" fill="#1a1a2e"/>
      <circle cx="29" cy="39" r="1" fill="white"/>
      <path d="M24 68 Q14 78 18 82" fill="#52b788" stroke="none"/>
      <path d="M76 68 Q86 78 82 82" fill="#52b788" stroke="none"/>
      <path d="M30 70 Q22 80 26 82" fill="#52b788"/>
      <path d="M70 70 Q78 80 74 82" fill="#52b788"/>
      <path d="M50 76 Q50 86 46 84 Q50 88 54 84 Q50 86 50 76Z" fill="#52b788"/>
    </svg>`,

    'great-white-shark': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="52" rx="34" ry="18" fill="#6c757d"/>
      <ellipse cx="50" cy="56" rx="30" ry="12" fill="#dee2e6"/>
      <path d="M80 46 Q96 38 90 54 Q86 50 82 50Z" fill="#6c757d"/>
      <path d="M20 52 Q8 40 14 34 Q18 40 20 48Z" fill="#6c757d"/>
      <path d="M50 34 Q56 18 50 16 Q44 18 50 34Z" fill="#6c757d"/>
      <circle cx="28" cy="48" r="4" fill="#1a1a2e"/>
      <circle cx="29" cy="47" r="1.5" fill="#495057"/>
      <path d="M18 56 L22 52 L26 56 L30 52 L34 56" fill="white" stroke="none"/>
      <line x1="72" y1="44" x2="82" y2="40" stroke="#495057" stroke-width="1"/>
      <line x1="72" y1="48" x2="82" y2="48" stroke="#495057" stroke-width="1"/>
      <line x1="72" y1="52" x2="82" y2="56" stroke="#495057" stroke-width="1"/>
    </svg>`,

    'octopus': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="38" rx="22" ry="20" fill="#9b5de5"/>
      <ellipse cx="50" cy="38" rx="18" ry="16" fill="#b185db"/>
      <circle cx="42" cy="34" r="6" fill="white"/>
      <circle cx="58" cy="34" r="6" fill="white"/>
      <circle cx="43" cy="35" r="3" fill="#1a1a2e"/>
      <circle cx="59" cy="35" r="3" fill="#1a1a2e"/>
      <path d="M46 44 Q50 48 54 44" fill="none" stroke="#7b2ff7" stroke-width="1.5"/>
      <path d="M30 55 Q20 70 24 80 Q26 78 28 72 Q30 68 32 58" fill="#9b5de5"/>
      <path d="M36 58 Q30 75 34 85 Q36 82 37 76 Q38 70 38 60" fill="#9b5de5"/>
      <path d="M44 60 Q42 78 46 86 Q48 82 47 76 Q46 70 45 62" fill="#9b5de5"/>
      <path d="M56 60 Q58 78 54 86 Q52 82 53 76 Q54 70 55 62" fill="#9b5de5"/>
      <path d="M64 58 Q70 75 66 85 Q64 82 63 76 Q62 70 62 60" fill="#9b5de5"/>
      <path d="M70 55 Q80 70 76 80 Q74 78 72 72 Q70 68 68 58" fill="#9b5de5"/>
      <circle cx="34" cy="76" r="2" fill="#b185db"/>
      <circle cx="46" cy="82" r="2" fill="#b185db"/>
      <circle cx="66" cy="76" r="2" fill="#b185db"/>
    </svg>`,

    'orca': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="52" rx="34" ry="18" fill="#1a1a2e"/>
      <ellipse cx="50" cy="58" rx="28" ry="10" fill="white"/>
      <path d="M80 46 Q96 38 90 55 Q86 50 82 50Z" fill="#1a1a2e"/>
      <path d="M20 52 Q8 40 14 34 Q18 40 20 48Z" fill="#1a1a2e"/>
      <path d="M50 34 Q56 18 50 14 Q44 18 50 34Z" fill="#1a1a2e"/>
      <ellipse cx="32" cy="50" r="6" fill="white"/>
      <circle cx="26" cy="48" r="3.5" fill="#1a1a2e"/>
      <circle cx="27" cy="47" r="1" fill="#333"/>
    </svg>`,

    'manta-ray': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 40 Q20 30 5 50 Q20 55 50 52 Q80 55 95 50 Q80 30 50 40Z" fill="#4a4e69"/>
      <path d="M50 44 Q25 38 12 50 Q25 52 50 50 Q75 52 88 50 Q75 38 50 44Z" fill="#9a8c98"/>
      <ellipse cx="50" cy="50" rx="12" ry="8" fill="#c9ada7" opacity=".3"/>
      <circle cx="36" cy="44" r="3" fill="#1a1a2e"/>
      <circle cx="64" cy="44" r="3" fill="#1a1a2e"/>
      <path d="M44 56 Q42 68 38 72" fill="none" stroke="#4a4e69" stroke-width="3" stroke-linecap="round"/>
      <path d="M56 56 Q58 68 62 72" fill="none" stroke="#4a4e69" stroke-width="3" stroke-linecap="round"/>
    </svg>`,

    'anglerfish': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="55" rx="26" ry="22" fill="#2d2d2d"/>
      <ellipse cx="50" cy="55" rx="22" ry="18" fill="#3d3d3d"/>
      <path d="M40 24 Q42 10 46 8 Q44 14 44 22" fill="none" stroke="#555" stroke-width="2"/>
      <circle cx="46" cy="8" r="5" fill="#00f5d4" opacity=".9">
        <animate attributeName="opacity" values=".9;.4;.9" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="46" cy="8" r="3" fill="white" opacity=".6"/>
      <circle cx="38" cy="48" r="8" fill="#f4d35e"/>
      <circle cx="39" cy="47" r="5" fill="#1a1a2e"/>
      <circle cx="40" cy="46" r="2" fill="#f4d35e" opacity=".5"/>
      <path d="M30 64 L34 60 L38 66 L42 60 L46 66 L50 60 L54 66 L58 60 L62 66 L66 60 L70 64" fill="none" stroke="white" stroke-width="2"/>
      <path d="M74 50 Q84 48 80 56 Q78 52 74 52Z" fill="#2d2d2d"/>
    </svg>`,

    'jellyfish': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="35" rx="26" ry="20" fill="rgba(155,93,229,.6)"/>
      <ellipse cx="50" cy="35" rx="22" ry="16" fill="rgba(177,133,219,.4)"/>
      <ellipse cx="50" cy="35" rx="16" ry="10" fill="rgba(255,255,255,.15)"/>
      <path d="M28 50 Q30 58 26 70 Q28 66 32 58 Q34 54 32 50" fill="rgba(155,93,229,.5)"/>
      <path d="M36 52 Q38 64 34 78 Q36 72 40 64 Q42 58 40 52" fill="rgba(155,93,229,.5)"/>
      <path d="M44 54 Q46 68 42 84 Q44 78 48 68 Q50 60 48 54" fill="rgba(155,93,229,.5)"/>
      <path d="M52 54 Q54 68 58 84 Q56 78 52 68 Q50 60 52 54" fill="rgba(155,93,229,.5)"/>
      <path d="M60 52 Q62 64 66 78 Q64 72 60 64 Q58 58 60 52" fill="rgba(155,93,229,.5)"/>
      <path d="M68 50 Q70 58 74 70 Q72 66 68 58 Q66 54 68 50" fill="rgba(155,93,229,.5)"/>
      <circle cx="42" cy="32" r="3" fill="rgba(255,255,255,.4)"/>
      <circle cx="58" cy="32" r="3" fill="rgba(255,255,255,.4)"/>
    </svg>`,

    'swordfish': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="55" cy="50" rx="28" ry="14" fill="#1565c0"/>
      <ellipse cx="55" cy="54" rx="24" ry="8" fill="#90caf9"/>
      <path d="M12 50 L28 48 L28 52Z" fill="#0d47a1"/>
      <path d="M80 44 Q94 36 88 52 Q84 48 80 48Z" fill="#1565c0"/>
      <path d="M58 36 Q64 22 58 20 Q52 22 58 36Z" fill="#1565c0"/>
      <circle cx="36" cy="47" r="3.5" fill="#1a1a2e"/>
      <circle cx="37" cy="46" r="1.2" fill="#42a5f5"/>
    </svg>`,

    'blue-whale': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="48" cy="52" rx="38" ry="20" fill="#3f51b5"/>
      <ellipse cx="48" cy="58" rx="34" ry="12" fill="#7986cb"/>
      <path d="M84 46 Q98 34 96 52 Q92 48 86 48Z" fill="#3f51b5"/>
      <path d="M94 36 Q100 30 96 28" fill="#3f51b5"/>
      <path d="M94 52 Q100 58 96 60" fill="#3f51b5"/>
      <circle cx="22" cy="48" r="4" fill="#1a1a2e"/>
      <circle cx="23" cy="47" r="1.5" fill="#5c6bc0"/>
      <path d="M14 56 Q10 58 14 60" fill="none" stroke="#7986cb" stroke-width="1.5"/>
      <ellipse cx="48" cy="56" rx="28" ry="8" fill="#9fa8da" opacity=".2"/>
    </svg>`,

    'crocodile': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="55" rx="34" ry="14" fill="#2e7d32"/>
      <ellipse cx="50" cy="58" rx="30" ry="10" fill="#66bb6a"/>
      <path d="M16 50 Q4 46 8 52 Q4 58 16 56Z" fill="#2e7d32"/>
      <path d="M10 50 L14 48 L16 52 L12 50 L14 54 L10 52" fill="white" opacity=".8"/>
      <rect x="20" y="42" width="14" height="8" rx="4" fill="#2e7d32"/>
      <circle cx="24" cy="44" r="3" fill="#f4d35e"/>
      <circle cx="24" cy="44" r="1.5" fill="#1a1a2e"/>
      <rect x="28" y="42" width="10" height="8" rx="4" fill="#2e7d32"/>
      <circle cx="32" cy="44" r="3" fill="#f4d35e"/>
      <circle cx="32" cy="44" r="1.5" fill="#1a1a2e"/>
      <path d="M82 52 Q90 48 88 56 Q86 52 82 54Z" fill="#2e7d32"/>
      <path d="M42 68 Q40 76 36 74" fill="none" stroke="#2e7d32" stroke-width="4" stroke-linecap="round"/>
      <path d="M58 68 Q60 76 64 74" fill="none" stroke="#2e7d32" stroke-width="4" stroke-linecap="round"/>
    </svg>`,

    'sea-otter': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="55" rx="22" ry="20" fill="#795548"/>
      <ellipse cx="50" cy="58" rx="16" ry="12" fill="#a1887f"/>
      <circle cx="50" cy="38" r="16" fill="#795548"/>
      <circle cx="50" cy="40" r="12" fill="#a1887f"/>
      <circle cx="43" cy="37" r="3.5" fill="#1a1a2e"/>
      <circle cx="57" cy="37" r="3.5" fill="#1a1a2e"/>
      <circle cx="44" cy="36" r="1.2" fill="white"/>
      <circle cx="58" cy="36" r="1.2" fill="white"/>
      <ellipse cx="50" cy="42" rx="4" ry="2.5" fill="#1a1a2e"/>
      <circle cx="38" cy="32" r="5" fill="#795548"/>
      <circle cx="62" cy="32" r="5" fill="#795548"/>
      <path d="M30 55 Q26 48 32 50" fill="#795548"/>
      <path d="M70 55 Q74 48 68 50" fill="#795548"/>
    </svg>`,

    'penguin': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="55" rx="20" ry="28" fill="#1a1a2e"/>
      <ellipse cx="50" cy="60" rx="14" ry="20" fill="white"/>
      <circle cx="50" cy="32" r="14" fill="#1a1a2e"/>
      <circle cx="44" cy="30" r="3" fill="white"/>
      <circle cx="56" cy="30" r="3" fill="white"/>
      <circle cx="44" cy="30" r="1.5" fill="#1a1a2e"/>
      <circle cx="56" cy="30" r="1.5" fill="#1a1a2e"/>
      <path d="M48 36 L50 40 L52 36Z" fill="#f4a236"/>
      <path d="M28 50 Q22 60 28 68" fill="#1a1a2e" stroke="none"/>
      <path d="M72 50 Q78 60 72 68" fill="#1a1a2e" stroke="none"/>
      <path d="M40 82 Q38 86 44 86 L48 86 Q50 82 46 80Z" fill="#f4a236"/>
      <path d="M54 80 Q50 82 52 86 L56 86 Q62 86 60 82Z" fill="#f4a236"/>
    </svg>`,

    'polar-bear': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="60" rx="26" ry="22" fill="#f5f5f5"/>
      <circle cx="50" cy="36" r="18" fill="#f5f5f5"/>
      <circle cx="38" cy="24" r="7" fill="#f5f5f5"/>
      <circle cx="62" cy="24" r="7" fill="#f5f5f5"/>
      <circle cx="38" cy="24" r="4" fill="#e0e0e0"/>
      <circle cx="62" cy="24" r="4" fill="#e0e0e0"/>
      <circle cx="44" cy="34" r="3" fill="#1a1a2e"/>
      <circle cx="56" cy="34" r="3" fill="#1a1a2e"/>
      <ellipse cx="50" cy="40" rx="4" ry="3" fill="#1a1a2e"/>
      <path d="M46 44 Q50 47 54 44" fill="none" stroke="#bbb" stroke-width="1"/>
      <path d="M30 62 Q24 74 30 80" fill="#f5f5f5"/>
      <path d="M70 62 Q76 74 70 80" fill="#f5f5f5"/>
    </svg>`,

    'seal': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="58" rx="28" ry="18" fill="#78909c"/>
      <ellipse cx="50" cy="60" rx="24" ry="14" fill="#90a4ae"/>
      <circle cx="50" cy="40" r="16" fill="#78909c"/>
      <circle cx="42" cy="38" r="4" fill="#1a1a2e"/>
      <circle cx="58" cy="38" r="4" fill="#1a1a2e"/>
      <circle cx="43" cy="37" r="1.5" fill="white"/>
      <circle cx="59" cy="37" r="1.5" fill="white"/>
      <ellipse cx="50" cy="44" rx="5" ry="3" fill="#546e7a"/>
      <line x1="36" y1="42" x2="26" y2="38" stroke="#78909c" stroke-width="1.5"/>
      <line x1="36" y1="44" x2="26" y2="44" stroke="#78909c" stroke-width="1.5"/>
      <line x1="64" y1="42" x2="74" y2="38" stroke="#78909c" stroke-width="1.5"/>
      <line x1="64" y1="44" x2="74" y2="44" stroke="#78909c" stroke-width="1.5"/>
      <path d="M26 60 Q16 66 20 72" fill="#78909c"/>
      <path d="M74 60 Q84 66 80 72" fill="#78909c"/>
      <path d="M46 76 Q50 82 54 76" fill="#78909c"/>
    </svg>`,

    'iguana': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="58" rx="24" ry="14" fill="#558b2f"/>
      <ellipse cx="50" cy="60" rx="20" ry="10" fill="#7cb342"/>
      <ellipse cx="30" cy="46" rx="12" ry="10" fill="#558b2f"/>
      <circle cx="26" cy="42" r="4" fill="#f4d35e"/>
      <circle cx="26" cy="42" r="2" fill="#1a1a2e"/>
      <path d="M20 48 Q14 48 18 46" fill="#558b2f"/>
      <path d="M34 36 L36 30 L38 36 L40 30 L42 36" fill="#7cb342"/>
      <path d="M72 56 Q86 54 90 58 Q86 60 72 58Z" fill="#558b2f"/>
      <path d="M36 70 Q32 80 28 78" fill="none" stroke="#558b2f" stroke-width="3" stroke-linecap="round"/>
      <path d="M64 70 Q68 80 72 78" fill="none" stroke="#558b2f" stroke-width="3" stroke-linecap="round"/>
    </svg>`,

    'walrus': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="60" rx="30" ry="22" fill="#8d6e63"/>
      <circle cx="50" cy="38" r="20" fill="#8d6e63"/>
      <ellipse cx="50" cy="46" rx="14" ry="8" fill="#a1887f"/>
      <circle cx="42" cy="34" r="3.5" fill="#1a1a2e"/>
      <circle cx="58" cy="34" r="3.5" fill="#1a1a2e"/>
      <circle cx="43" cy="33" r="1.2" fill="white"/>
      <circle cx="59" cy="33" r="1.2" fill="white"/>
      <ellipse cx="50" cy="42" rx="6" ry="3" fill="#6d4c41"/>
      <line x1="44" y1="50" x2="42" y2="66" stroke="#f5f5f5" stroke-width="3" stroke-linecap="round"/>
      <line x1="56" y1="50" x2="58" y2="66" stroke="#f5f5f5" stroke-width="3" stroke-linecap="round"/>
      <circle cx="46" cy="44" r="1.5" fill="#6d4c41"/>
      <circle cx="48" cy="45" r="1.5" fill="#6d4c41"/>
      <circle cx="52" cy="45" r="1.5" fill="#6d4c41"/>
      <circle cx="54" cy="44" r="1.5" fill="#6d4c41"/>
      <path d="M24 62 Q16 68 20 76" fill="#8d6e63"/>
      <path d="M76 62 Q84 68 80 76" fill="#8d6e63"/>
    </svg>`,
  };

  // ---- Animal data ----
  const roster = [
    // Ocean animals
    // maxLevel tiers: 10, 20, 50, 100 — higher cap = stronger animal = costs more
    // unlockCost scales with maxLevel tier

    // Ocean animals
    { id: 'dolphin', name: 'Dolphin', type: 'ocean', hp: 80, attack: 14, defense: 10, speed: 18,
      special: { name: 'Sonar Blast', damage: 22, desc: 'Stun with echolocation' },
      rarity: 'common', maxLevel: 20, unlockCost: 0 },

    { id: 'crab', name: 'Crab', type: 'amphibious', hp: 70, attack: 16, defense: 18, speed: 8,
      special: { name: 'Claw Crush', damage: 26, desc: 'Devastating pincer attack' },
      rarity: 'common', maxLevel: 10, unlockCost: 0 },

    { id: 'sea-turtle', name: 'Sea Turtle', type: 'ocean', hp: 100, attack: 8, defense: 22, speed: 6,
      special: { name: 'Shell Shield', damage: 0, desc: 'Block all damage this turn', isDefense: true },
      rarity: 'common', maxLevel: 20, unlockCost: 0 },

    { id: 'great-white-shark', name: 'Great White', type: 'ocean', hp: 90, attack: 22, defense: 8, speed: 16,
      special: { name: 'Frenzy Bite', damage: 35, desc: 'Savage multi-bite frenzy' },
      rarity: 'rare', maxLevel: 50, unlockCost: 450 },

    { id: 'octopus', name: 'Octopus', type: 'ocean', hp: 65, attack: 16, defense: 12, speed: 14,
      special: { name: 'Ink Cloud', damage: 10, desc: 'Blind enemy, reduce their accuracy', debuff: 'blind' },
      rarity: 'rare', maxLevel: 50, unlockCost: 400 },

    { id: 'orca', name: 'Orca', type: 'ocean', hp: 110, attack: 20, defense: 14, speed: 15,
      special: { name: 'Breach Slam', damage: 30, desc: 'Leap and crush from above' },
      rarity: 'legendary', maxLevel: 100, unlockCost: 1200 },

    { id: 'manta-ray', name: 'Manta Ray', type: 'ocean', hp: 75, attack: 12, defense: 14, speed: 16,
      special: { name: 'Wing Sweep', damage: 18, desc: 'Wide sweeping wing attack' },
      rarity: 'rare', maxLevel: 20, unlockCost: 250 },

    { id: 'anglerfish', name: 'Anglerfish', type: 'ocean', hp: 60, attack: 20, defense: 6, speed: 10,
      special: { name: 'Lure Strike', damage: 28, desc: 'Mesmerize and devour', debuff: 'stun' },
      rarity: 'rare', maxLevel: 50, unlockCost: 450 },

    { id: 'jellyfish', name: 'Jellyfish', type: 'ocean', hp: 50, attack: 10, defense: 4, speed: 12,
      special: { name: 'Venom Sting', damage: 15, desc: 'Poison that deals damage over time', debuff: 'poison' },
      rarity: 'common', maxLevel: 10, unlockCost: 100 },

    { id: 'swordfish', name: 'Swordfish', type: 'ocean', hp: 70, attack: 24, defense: 6, speed: 22,
      special: { name: 'Piercing Charge', damage: 32, desc: 'Full-speed lance charge' },
      rarity: 'rare', maxLevel: 50, unlockCost: 400 },

    { id: 'blue-whale', name: 'Blue Whale', type: 'ocean', hp: 150, attack: 12, defense: 20, speed: 4,
      special: { name: 'Tidal Wave', damage: 25, desc: 'Massive wave that hits everything' },
      rarity: 'legendary', maxLevel: 100, unlockCost: 1200 },

    // Amphibious animals
    { id: 'crocodile', name: 'Crocodile', type: 'amphibious', hp: 95, attack: 22, defense: 16, speed: 10,
      special: { name: 'Death Roll', damage: 34, desc: 'Grab and spin violently' },
      rarity: 'rare', maxLevel: 50, unlockCost: 450 },

    { id: 'sea-otter', name: 'Sea Otter', type: 'amphibious', hp: 55, attack: 10, defense: 8, speed: 16,
      special: { name: 'Rock Smash', damage: 20, desc: 'Smash with a rock tool' },
      rarity: 'common', maxLevel: 10, unlockCost: 100 },

    { id: 'penguin', name: 'Penguin', type: 'amphibious', hp: 60, attack: 12, defense: 12, speed: 14,
      special: { name: 'Belly Slide', damage: 16, desc: 'Slide tackle at high speed' },
      rarity: 'common', maxLevel: 20, unlockCost: 200 },

    { id: 'polar-bear', name: 'Polar Bear', type: 'amphibious', hp: 120, attack: 24, defense: 16, speed: 8,
      special: { name: 'Arctic Maul', damage: 36, desc: 'Devastating swipe attack' },
      rarity: 'legendary', maxLevel: 100, unlockCost: 1200 },

    { id: 'seal', name: 'Seal', type: 'amphibious', hp: 70, attack: 10, defense: 12, speed: 14,
      special: { name: 'Headbutt', damage: 18, desc: 'Surprise headbutt attack' },
      rarity: 'common', maxLevel: 10, unlockCost: 100 },

    { id: 'iguana', name: 'Marine Iguana', type: 'amphibious', hp: 65, attack: 14, defense: 14, speed: 12,
      special: { name: 'Tail Whip', damage: 20, desc: 'Powerful tail lash' },
      rarity: 'rare', maxLevel: 20, unlockCost: 250 },

    { id: 'walrus', name: 'Walrus', type: 'amphibious', hp: 110, attack: 18, defense: 18, speed: 5,
      special: { name: 'Tusk Gore', damage: 28, desc: 'Impale with massive tusks' },
      rarity: 'rare', maxLevel: 50, unlockCost: 400 },
  ];

  function getAnimal(id) {
    return roster.find(a => a.id === id);
  }

  function getSVG(id) {
    return svgArt[id] || '';
  }

  function getAll() {
    return roster;
  }

  function getByType(type) {
    if (type === 'all') return roster;
    return roster.filter(a => a.type === type);
  }

  function getMaxStat() {
    return 150; // for stat bar scaling
  }

  // Scale base stats by individual animal level
  // Each level adds ~3% to stats, so a Lv50 animal is ~2.5x base, Lv100 is ~4x base
  function getScaledStats(animalId, animalLevel) {
    const base = getAnimal(animalId);
    if (!base) return null;
    const lvl = Math.max(1, Math.min(animalLevel, base.maxLevel));
    const scale = 1 + (lvl - 1) * 0.03;
    return {
      hp: Math.round(base.hp * scale),
      attack: Math.round(base.attack * scale),
      defense: Math.round(base.defense * scale),
      speed: Math.round(base.speed * scale),
      specialDamage: Math.round((base.special.damage || 0) * scale),
    };
  }

  // XP needed for an animal to reach the next level
  function animalXpToNext(currentLevel) {
    return Math.round(30 * Math.pow(currentLevel, 1.4));
  }

  // Label for max level tier
  function tierLabel(maxLevel) {
    if (maxLevel >= 100) return 'S';
    if (maxLevel >= 50) return 'A';
    if (maxLevel >= 20) return 'B';
    return 'C';
  }

  return { getAnimal, getSVG, getAll, getByType, getMaxStat, getScaledStats, animalXpToNext, tierLabel };
})();
