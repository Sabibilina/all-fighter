// ─── EndScene ─────────────────────────────────────────────────────────────────
// Displays victory or game-over result, a random ALL educational fact,
// and buttons to play again or return to the menu.
// After 8 s a leaderboard popup lets the player save their initials.

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

    // Countdown hint — updates each second
    this._countdown = 8;
    this.countdownText = this.add.text(W / 2, 444, 'Leaderboard entry in 8s…', {
      fontSize: '13px', fontFamily: 'Segoe UI', color: '#556677',
    }).setOrigin(0.5);

    // Buttons
    const mkBtn = (x, label, bg) =>
      this.add.text(x, 478, label, {
        fontSize: '20px', fontFamily: 'Segoe UI', color: '#ffffff',
        backgroundColor: bg, padding: { x: 22, y: 12 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const again = mkBtn(W / 2 - 115, '▶ Play Again', '#1a5c2e');
    again.on('pointerover',  () => again.setStyle({ backgroundColor: '#27a349' }));
    again.on('pointerout',   () => again.setStyle({ backgroundColor: '#1a5c2e' }));
    again.on('pointerdown',  () => {
      this._cancelCountdown();
      this.scene.start('Game');
    });

    const menu = mkBtn(W / 2 + 115, '⌂ Main Menu', '#1a2c5c');
    menu.on('pointerover',  () => menu.setStyle({ backgroundColor: '#2745aa' }));
    menu.on('pointerout',   () => menu.setStyle({ backgroundColor: '#1a2c5c' }));
    menu.on('pointerdown',  () => {
      this._cancelCountdown();
      this.scene.start('Menu');
    });

    this.add.text(W / 2, H - 18, 'Educational game – not medical advice', {
      fontSize: '11px', fontFamily: 'Segoe UI', color: '#446688',
    }).setOrigin(0.5);

    // Tick down each second, then show the popup
    this._lbTimer = this.time.addEvent({
      delay: 1000,
      repeat: 7,
      callback: () => {
        this._countdown--;
        if (this._countdown > 0) {
          this.countdownText.setText(`Leaderboard entry in ${this._countdown}s…`);
        } else {
          this.countdownText.destroy();
          this.countdownText = null;
          this._showLeaderboardPopup();
        }
      },
    });
  }

  // ── Leaderboard popup ───────────────────────────────────────────────────────

  _showLeaderboardPopup() {
    this._initials   = '';
    this._popupItems = [];

    const pw = 460, ph = 300;
    const px = W / 2 - pw / 2;
    const py = H / 2 - ph / 2 - 10;

    const track = (obj) => { this._popupItems.push(obj); return obj; };

    // Dark overlay — blocks clicks to items behind it
    const overlay = track(this.add.graphics()
      .fillStyle(0x000000, 0.82)
      .fillRect(0, 0, W, H));
    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, W, H),
      Phaser.Geom.Rectangle.Contains
    );

    // Panel
    const panel = track(this.add.graphics());
    panel.fillStyle(0x06111f, 1);
    panel.fillRoundedRect(px, py, pw, ph, 16);
    panel.lineStyle(2, 0x3366aa, 1);
    panel.strokeRoundedRect(px, py, pw, ph, 16);

    track(this.add.text(W / 2, py + 26, '🏆  ENTER YOUR INITIALS', {
      fontSize: '20px', fontFamily: 'Segoe UI', color: '#ffdd88',
    }).setOrigin(0.5));

    track(this.add.text(W / 2, py + 55, `Your score: ${this.score}`, {
      fontSize: '15px', fontFamily: 'Segoe UI', color: '#aaddff',
    }).setOrigin(0.5));

    // Three letter boxes
    const bw = 62, bh = 72, gap = 16;
    const totalW = 3 * bw + 2 * gap;
    const bx0 = W / 2 - totalW / 2;
    const by  = py + 88;

    this._boxPos     = [];
    this._letterText = [];

    for (let i = 0; i < 3; i++) {
      const lx = bx0 + i * (bw + gap);
      this._boxPos.push({ x: lx, y: by, w: bw, h: bh });

      track(this.add.graphics()
        .fillStyle(0x0d1e30, 1)
        .fillRoundedRect(lx, by, bw, bh, 8));

      const lt = track(this.add.text(lx + bw / 2, by + bh / 2, '_', {
        fontSize: '40px', fontFamily: 'Segoe UI', color: '#556677',
      }).setOrigin(0.5));
      this._letterText.push(lt);
    }

    // Sliding cursor highlight (active box)
    this._cursor = track(this.add.graphics());
    this._drawCursor(0);

    track(this.add.text(W / 2, by + bh + 14, 'Type letters  ·  BACKSPACE to delete  ·  ENTER to save', {
      fontSize: '11px', fontFamily: 'Segoe UI', color: '#445566',
    }).setOrigin(0.5));

    // Save button (enabled once 3 chars entered)
    this._submitBtn = track(this.add.text(W / 2 - 82, py + ph - 38, 'SAVE SCORE', {
      fontSize: '16px', fontFamily: 'Segoe UI', color: '#445566',
      backgroundColor: '#0a1622', padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }));

    // Skip button
    const skipBtn = track(this.add.text(W / 2 + 82, py + ph - 38, 'SKIP', {
      fontSize: '16px', fontFamily: 'Segoe UI', color: '#667788',
      backgroundColor: '#0a1622', padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }));
    skipBtn.on('pointerover', () => skipBtn.setStyle({ color: '#99aacc' }));
    skipBtn.on('pointerout',  () => skipBtn.setStyle({ color: '#667788' }));
    skipBtn.on('pointerdown', () => this._closePopup());

    // Keyboard listener (native DOM — reliable for text input)
    this._kbHandler = (event) => {
      const k = event.key;
      if (k === 'Backspace') {
        event.preventDefault();
        if (this._initials.length > 0) {
          this._initials = this._initials.slice(0, -1);
          this._updateLetters();
        }
      } else if (k === 'Enter' && this._initials.length === 3) {
        this._submitScore();
      } else if (/^[a-zA-Z]$/.test(k) && this._initials.length < 3) {
        this._initials += k.toUpperCase();
        this._updateLetters();
      }
    };
    window.addEventListener('keydown', this._kbHandler);
  }

  _drawCursor(index) {
    if (!this._cursor || !this._boxPos || index >= this._boxPos.length) return;
    const { x, y, w, h } = this._boxPos[index];
    this._cursor.clear();
    this._cursor.lineStyle(3, 0x44bbff, 1);
    this._cursor.strokeRoundedRect(x - 2, y - 2, w + 4, h + 4, 10);
  }

  _updateLetters() {
    for (let i = 0; i < 3; i++) {
      const ch = this._initials[i];
      this._letterText[i].setText(ch || '_');
      this._letterText[i].setStyle({ color: ch ? '#ffffff' : '#556677' });
    }

    if (this._initials.length < 3) {
      this._drawCursor(this._initials.length);
    } else {
      // All three filled — enable submit
      this._cursor.clear();
      this._submitBtn.setStyle({ color: '#ffffff', backgroundColor: '#1a5c2e' });
      this._submitBtn.removeAllListeners('pointerover');
      this._submitBtn.removeAllListeners('pointerout');
      this._submitBtn.removeAllListeners('pointerdown');
      this._submitBtn.on('pointerover', () => this._submitBtn.setStyle({ backgroundColor: '#27a349' }));
      this._submitBtn.on('pointerout',  () => this._submitBtn.setStyle({ backgroundColor: '#1a5c2e' }));
      this._submitBtn.on('pointerdown', () => this._submitScore());
    }
  }

  _submitScore() {
    addLeaderboardEntry(this._initials, this.score);
    this._closePopup();
    this.add.text(W / 2, 444, '✓ Score saved to leaderboard!', {
      fontSize: '16px', fontFamily: 'Segoe UI', color: '#88ffaa',
      stroke: '#003311', strokeThickness: 4,
    }).setOrigin(0.5);
  }

  _closePopup() {
    if (this._kbHandler) {
      window.removeEventListener('keydown', this._kbHandler);
      this._kbHandler = null;
    }
    if (this._popupItems) {
      this._popupItems.forEach(item => { if (item && item.destroy) item.destroy(); });
      this._popupItems = null;
    }
  }

  _cancelCountdown() {
    if (this._lbTimer) { this._lbTimer.remove(false); this._lbTimer = null; }
    if (this._kbHandler) {
      window.removeEventListener('keydown', this._kbHandler);
      this._kbHandler = null;
    }
  }
}
