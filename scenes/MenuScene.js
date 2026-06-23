// ─── MenuScene ────────────────────────────────────────────────────────────────
// Title screen with instructions (left) and live leaderboard (right).

class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    this.game.canvas.style.cursor = 'default';

    this.add.image(W / 2, H / 2, 'bg');

    // Title
    this.add.text(W / 2, 52, 'ALL FIGHTER', {
      fontSize: '52px', fontFamily: 'Segoe UI', color: '#ff88bb',
      stroke: '#220011', strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(W / 2, 106, 'Defeat Acute Lymphocytic Leukemia', {
      fontSize: '17px', fontFamily: 'Segoe UI', color: '#aaccff',
    }).setOrigin(0.5);

    // ── Layout: instructions take ~2/3, leaderboard takes ~1/3 ──────────────
    const margin = 12, gap = 10, py = 130, ph = 308;
    const lb_pw  = Math.round(W / 3);          // ≈ 267 px
    const lx     = margin;
    const pw     = W - margin * 2 - gap - lb_pw; // ≈ 499 px
    const rx     = lx + pw + gap;

    // ── Left panel: Instructions ──────────────────────────────────────────────
    this.add.graphics()
      .fillStyle(0x000000, 0.55)
      .fillRoundedRect(lx, py, pw, ph, 14);
    this.add.graphics()
      .lineStyle(1, 0x334466, 0.5)
      .strokeRoundedRect(lx, py, pw, ph, 14);

    const lcx = lx + pw / 2;
    this.add.text(lcx, py + 16, 'HOW TO PLAY', {
      fontSize: '13px', fontFamily: 'Segoe UI', color: '#ffdd88', letterSpacing: 2,
    }).setOrigin(0.5, 0);
    this.add.graphics()
      .lineStyle(1, 0x334466, 0.7)
      .lineBetween(lx + 10, py + 38, lx + pw - 10, py + 38);

    const lines = [
      '🔬  Click jagged PURPLE cells to destroy them.',
      '🩸  Avoid clicking round BLUE healthy cells.',
      '📋  Each wave introduces a NEW mechanic — read the briefing!',
      '⚠️   Missing a leukemic cell damages the patient.',
      '🏆  Clear all 5 waves to WIN and cure the patient!',
    ];
    lines.forEach((line, i) => {
      this.add.text(lcx, py + 48 + i * 38, line, {
        fontSize: '13px', fontFamily: 'Segoe UI', color: '#e0e0e0',
        wordWrap: { width: pw - 20 },
      }).setOrigin(0.5, 0);
    });

    // ── Right panel: Leaderboard (1/3 width) ─────────────────────────────────
    this._renderLeaderboard(rx, py, lb_pw, ph);

    // ── Start button ──────────────────────────────────────────────────────────
    const btn = this.add.text(W / 2, 472, '▶  START GAME', {
      fontSize: '26px', fontFamily: 'Segoe UI', color: '#ffffff',
      backgroundColor: '#881133', padding: { x: 28, y: 14 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#cc1144' }));
    btn.on('pointerout',  () => btn.setStyle({ backgroundColor: '#881133' }));
    btn.on('pointerdown', () => this.scene.start('Game'));

    this.add.text(W / 2, H - 18, 'Educational game – not medical advice', {
      fontSize: '11px', fontFamily: 'Segoe UI', color: '#446688',
    }).setOrigin(0.5);
  }

  _renderLeaderboard(px, py, pw, ph) {
    this.add.graphics()
      .fillStyle(0x000000, 0.55)
      .fillRoundedRect(px, py, pw, ph, 14);
    this.add.graphics()
      .lineStyle(1, 0x334466, 0.5)
      .strokeRoundedRect(px, py, pw, ph, 14);

    const cx = px + pw / 2;

    this.add.text(cx, py + 16, '🏆  LEADERBOARD', {
      fontSize: '13px', fontFamily: 'Segoe UI', color: '#ffdd88', letterSpacing: 2,
    }).setOrigin(0.5, 0);

    this.add.graphics()
      .lineStyle(1, 0x334466, 0.7)
      .lineBetween(px + 10, py + 38, px + pw - 10, py + 38);

    const entries = getLeaderboard();

    if (entries.length === 0) {
      this.add.text(cx, py + ph / 2, 'No scores yet!\nBe the first to play.', {
        fontSize: '14px', fontFamily: 'Segoe UI', color: '#445566',
        align: 'center',
      }).setOrigin(0.5);
      return;
    }

    // Column headers
    const hdrY = py + 44;
    this.add.text(px + 18, hdrY, '#',      { fontSize: '10px', fontFamily: 'Segoe UI', color: '#445566' });
    this.add.text(px + 46, hdrY, 'NAME',   { fontSize: '10px', fontFamily: 'Segoe UI', color: '#445566' });
    this.add.text(px + pw - 18, hdrY, 'SCORE', {
      fontSize: '10px', fontFamily: 'Segoe UI', color: '#445566',
    }).setOrigin(1, 0);

    const rowH   = 22;
    const startY = py + 62;
    const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32'];

    entries.forEach((entry, i) => {
      const ry    = startY + i * rowH;
      const color = rankColors[i] || '#aabbcc';

      // Alternating row tint
      if (i % 2 === 0) {
        this.add.graphics()
          .fillStyle(0xffffff, 0.04)
          .fillRect(px + 4, ry, pw - 8, rowH);
      }

      this.add.text(px + 18, ry + rowH / 2, `${i + 1}`, {
        fontSize: '12px', fontFamily: 'Segoe UI', color,
      }).setOrigin(0, 0.5);

      this.add.text(px + 46, ry + rowH / 2, entry.initials || '???', {
        fontSize: '13px', fontFamily: 'Segoe UI', color, fontStyle: 'bold',
      }).setOrigin(0, 0.5);

      this.add.text(px + pw - 18, ry + rowH / 2, `${entry.score ?? 0}`, {
        fontSize: '12px', fontFamily: 'Segoe UI', color: '#bbccdd',
      }).setOrigin(1, 0.5);
    });
  }
}
