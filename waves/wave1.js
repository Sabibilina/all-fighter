const WAVE_1 = {
  healthyCount:  5,
  leukemicCount: 3,
  speed:         52,

  splitting:  false,   // escaped cells do NOT split
  mutation:   false,   // no disguised cells
  avoidance:  false,   // cells do not flee the cursor
  powerups:   false,   // no power-up drops

  theme:       0x2266dd,
  newTag:      null,   // nothing new to announce
  title:       'THE BASICS',
  icon:        '🩸',
  description: 'Leukemic cells have invaded the bloodstream.\n' +
               'Click the jagged PURPLE cells to destroy them before they escape.\n' +
               'Do NOT click the round BLUE healthy cells — they protect the patient.',
  detail:      null,
};
