// ─── EndScene ─────────────────────────────────────────────────────────────────
// Displays victory or game-over result, a random ALL educational fact,
// and buttons to play again or return to the menu.

class EndScene extends Phaser.Scene {
  constructor() { super('End'); }

  init(data) {
    this.won   = data.won;
    this.score = data.score;
  }

  create() {
    this.game.canvas.style.cursor = 'default';
    this.add.image(W / 2, H / 2, 'bg');

    if (this.won) {
      this.add.text(W / 2, 80, '🏆 PATIENT CURED! 🏆', {
        fontSize: '42px', fontFamily: 'Segoe UI', color: '#88ffaa',
        stroke: '#004422', strokeThickness: 8,
      }).setOrigin(0.5);
      this.add.text(W / 2, 148, 'You defeated ALL!', {
        fontSize: '22px', fontFamily: 'Segoe UI', color: '#ccffdd',
      }).setOrigin(0.5);
      this.add.text(W / 2, 184, 'Final Score: ' + this.score, {
        fontSize: '20px', fontFamily: 'Segoe UI', color: '#ffee88',
      }).setOrigin(0.5);
    } else {
      this.add.text(W / 2, 80, 'PATIENT LOST', {
        fontSize: '46px', fontFamily: 'Segoe UI', color: '#ff4455',
        stroke: '#220000', strokeThickness: 8,
      }).setOrigin(0.5);
      this.add.text(W / 2, 148, 'The leukemia spread too far…', {
        fontSize: '21px', fontFamily: 'Segoe UI', color: '#ffaaaa',
      }).setOrigin(0.5);
      this.add.text(W / 2, 182, 'Score: ' + this.score, {
        fontSize: '18px', fontFamily: 'Segoe UI', color: '#ffdd88',
      }).setOrigin(0.5);
    }

    // Educational fact panel
    const fact = randomFact();
    this.add.graphics()
      .fillStyle(0x000000, 0.60)
      .fillRoundedRect(W / 2 - 330, 225, 660, 200, 12);
    this.add.text(W / 2, 240, 'DID YOU KNOW?', {
      fontSize: '14px', fontFamily: 'Segoe UI', color: '#ffdd88', letterSpacing: 2,
    }).setOrigin(0.5);
    wrapText(this, fact, W / 2, 268, 610, 27, {
      fontSize: '15px', fontFamily: 'Segoe UI', color: '#ddeeff',
    });

    // Buttons
    const mkBtn = (x, label, bg) =>
      this.add.text(x, 462, label, {
        fontSize: '20px', fontFamily: 'Segoe UI', color: '#ffffff',
        backgroundColor: bg, padding: { x: 22, y: 12 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const again = mkBtn(W / 2 - 115, '▶ Play Again', '#1a5c2e');
    again.on('pointerover',  () => again.setStyle({ backgroundColor: '#27a349' }));
    again.on('pointerout',   () => again.setStyle({ backgroundColor: '#1a5c2e' }));
    again.on('pointerdown',  () => this.scene.start('Game'));

    const menu = mkBtn(W / 2 + 115, '⌂ Main Menu', '#1a2c5c');
    menu.on('pointerover',  () => menu.setStyle({ backgroundColor: '#2745aa' }));
    menu.on('pointerout',   () => menu.setStyle({ backgroundColor: '#1a2c5c' }));
    menu.on('pointerdown',  () => this.scene.start('Menu'));

    this.add.text(W / 2, H - 18, 'Educational game – not medical advice', {
      fontSize: '11px', fontFamily: 'Segoe UI', color: '#446688',
    }).setOrigin(0.5);
  }
}
