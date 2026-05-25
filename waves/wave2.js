const WAVE_2 = {
  healthyCount:  11,
  leukemicCount: 5,
  speed:         64,

  splitting:  true,    // escaped cells split into two children
  mutation:   false,   // no disguised cells yet
  avoidance:  false,   // cells still move in straight lines
  powerups:   true,    // one power-up drops per wave

  theme:       0xff7700,
  newTag:      '⚡  NEW: CELL SPLITTING + POWER-UPS',
  title:       'CELL DIVISION',
  icon:        '✂',
  description: 'Leukemic cells that ESCAPE will now SPLIT into two smaller, slower children.\n' +
               'Coloured pick-ups also begin appearing — grab them for Chemo Burst, Bone Marrow, or Freeze.',
  detail:      'Each split child still needs to be destroyed.',
};
