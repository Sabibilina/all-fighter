const WAVE_4 = {
  // ── Spawn config ───────────────────────────────────────────────────────────
  healthyCount:  13,
  leukemicCount: 7,
  speed:         88,

  splitting:  true,    // cells still split on escape
  mutation:   true,    // disguised cells still appear
  avoidance:  true,    // leukemic cells flee the cursor (radius: 140 px)
  powerups:   true,    // power-ups still drop

  theme:       0x88cc00,
  newTag:      '👁  NEW: CURSOR AVOIDANCE',
  title:       'EVASIVE MANEUVERS',
  icon:        '👁',
  description: 'Leukemic cells have learned to FLEE from your cursor.\n' +
               'Move close and they dodge away. Corner them against the walls\n' +
               'or cut off their escape route!',
  detail:      'Speed and positioning matter now.',
};
