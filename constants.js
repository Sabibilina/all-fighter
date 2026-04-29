const W = 800;
const H = 600;

const ALL_FACTS = [
  "ALL (Acute Lymphocytic Leukemia) is the most common cancer in children, accounting for ~25% of childhood cancers.",
  "ALL starts in the bone marrow where immature lymphocytes multiply uncontrollably and crowd out healthy blood cells.",
  "The overall 5-year survival rate for childhood ALL is now above 90% thanks to modern chemotherapy.",
  "ALL can also affect adults; adult ALL has a cure rate of around 40%.",
  "Treatment typically involves 2–3 years of chemotherapy divided into induction, consolidation, and maintenance phases.",
  "The Philadelphia chromosome (BCR-ABL1) is found in ~25% of adult ALL cases and was historically a poor prognostic factor.",
  "Targeted therapies like imatinib have dramatically improved outcomes for Ph+ ALL patients.",
  "CAR-T cell therapy (e.g. tisagenlecleucel) offers new hope for relapsed/refractory pediatric ALL.",
  "Early signs of ALL include fatigue, pale skin, frequent infections, easy bruising, and bone pain.",
  "Lumbar puncture (spinal tap) is used to check whether leukemia cells have spread to the central nervous system.",
];

function randomFact() {
  return ALL_FACTS[Math.floor(Math.random() * ALL_FACTS.length)];
}

function wrapText(scene, text, x, y, maxWidth, lineHeight, style) {
  const words = text.split(' ');
  let line = '';
  const lines = [];
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    const probe = scene.add.text(0, -9999, test, style);
    const tw = probe.width;
    probe.destroy();
    if (tw > maxWidth && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  lines.forEach((l, i) => {
    scene.add.text(x, y + i * lineHeight, l, style).setOrigin(0.5, 0);
  });
}
