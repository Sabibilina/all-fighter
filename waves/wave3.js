const WAVE_3 = {
  healthyCount:  12,
  leukemicCount: 6,
  speed:         76,

  splitting:  true,    // escaped cells still split
  mutation:   true,    // ~38% of leukemic cells start disguised as blue
  avoidance:  false,   // cells do not flee the cursor yet
  powerups:   true,    // power-ups still drop

  theme:       0xaa00cc,
  newTag:      '🧬  NEW: MUTATING CELLS',
  title:       'DISGUISED INVADERS',
  icon:        '🧬',
  description: 'Some leukemic cells start DISGUISED as healthy blue cells and slowly shift\n' +
               'purple over 3–4 seconds. Wait for the colour change before clicking.',
  detail:      'Clicking a cell still mid-mutation costs −8 HP.',
};
