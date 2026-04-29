// ─── MenuScene ────────────────────────────────────────────────────────────────
// Title screen with brief instructions and decorative floating cells.
// Full mechanic details are revealed per-wave via the announcement overlay.

class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    this.game.canvas.style.cursor = 'default';

    this.add.image(W / 2, H / 2, 'bg');

    this.add.text(W / 2, 95, 'ALL FIGHTER', {
      fontSize: '58px', fontFamily: 'Segoe UI', color: '#ff88bb',
      stroke: '#220011', strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(W / 2, 160, 'Defeat Acute Lymphocytic Leukemia', {
      fontSize: '18px', fontFamily: 'Segoe UI', color: '#aaccff',
    }).setOrigin(0.5);

    // Instructions panel
    const panelH = 218;
    const panelY = 210;
    this.add.graphics()
      .fillStyle(0x000000, 0.55)
      .fillRoundedRect(W / 2 - 300, panelY, 600, panelH, 14);

    const lines = [
      '🔬  Click jagged PURPLE cells to destroy them.',
      '🩸  Avoid clicking round BLUE healthy cells.',
      '📋  Each wave introduces a NEW mechanic — read the briefing!',
      '⚠️   Missing a leukemic cell damages the patient.',
      '🏆  Clear all 5 waves to WIN and cure the patient!',
    ];
    lines.forEach((line, i) => {
      this.add.text(W / 2, panelY + 16 + i * 37, line, {
        fontSize: '14px', fontFamily: 'Segoe UI', color: '#e8e8e8',
      }).setOrigin(0.5, 0);
    });

    const btn = this.add.text(W / 2, 460, '▶  START GAME', {
      fontSize: '26px', fontFamily: 'Segoe UI', color: '#ffffff',
      backgroundColor: '#881133', padding: { x: 28, y: 14 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#cc1144' }));
    btn.on('pointerout',  () => btn.setStyle({ backgroundColor: '#881133' }));
    btn.on('pointerdown', () => this.scene.start('Game'));

    this._decoCell(120, 320, 'healthyCell');
    this._decoCell(680, 300, 'leukemicCell');
    this._decoCell(W / 2, 555, 'healthyCell', 0.6);

    this.add.text(W / 2, H - 18, 'Educational game – not medical advice', {
      fontSize: '11px', fontFamily: 'Segoe UI', color: '#446688',
    }).setOrigin(0.5);
  }

  _decoCell(x, y, key, scale = 1) {
    const img = this.add.image(x, y, key).setScale(scale).setAlpha(0.75);
    this.tweens.add({
      targets: img, y: y - 18, duration: 2000 + Math.random() * 1000,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }
}
