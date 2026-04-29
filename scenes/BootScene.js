// ─── BootScene ────────────────────────────────────────────────────────────────
// Procedurally generates all game textures via Phaser Graphics,
// then hands off to the Menu scene.

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    this._makeBloodstream();
    this._makeHealthyCell();
    this._makeLeukemicCell();
    this._makeParticle();
    this._makeCrosshair();
    this._makePowerupBurst();
    this._makePowerupHealth();
    this._makePowerupFreeze();
    this.scene.start('Menu');
  }

  _makeBloodstream() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x08111f, 1);
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) {
      g.fillStyle(0xcc3355, 0.03 + i * 0.015);
      g.fillRect(0, i * 8, W, 4);
      g.fillRect(0, H - i * 8 - 4, W, 4);
    }
    g.fillStyle(0xffd0a0, 0.18);
    for (let i = 0; i < 120; i++) {
      g.fillCircle(Math.random() * W, Math.random() * H, 1 + Math.random() * 2);
    }
    g.generateTexture('bg', W, H);
    g.destroy();
  }

  _makeHealthyCell() {
    const r = 22, size = r * 2 + 4;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x4488ff, 0.18);
    g.fillCircle(size / 2, size / 2, r + 6);
    g.fillStyle(0x2255cc, 1);
    g.fillCircle(size / 2, size / 2, r);
    g.lineStyle(2, 0x88aaff, 0.7);
    g.strokeCircle(size / 2, size / 2, r);
    g.fillStyle(0x0033aa, 1);
    g.fillCircle(size / 2, size / 2, r * 0.42);
    g.generateTexture('healthyCell', size, size);
    g.destroy();
  }

  _makeLeukemicCell() {
    const r = 26, size = r * 2 + 12, cx = size / 2, cy = size / 2;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x660022, 0.22);
    g.fillCircle(cx, cy, r + 10);
    const pts = [], spikes = 12;
    for (let i = 0; i < spikes; i++) {
      const a = (i / spikes) * Math.PI * 2 - Math.PI / 2;
      const vary = i % 3 === 0 ? 0.62 : (i % 3 === 1 ? 0.88 : 0.75);
      pts.push({ x: cx + Math.cos(a) * r * vary, y: cy + Math.sin(a) * r * vary });
    }
    g.fillStyle(0x8b0046, 1);
    g.fillPoints(pts, true);
    const pts2 = [];
    for (let i = 0; i < spikes; i++) {
      const a = (i / spikes) * Math.PI * 2 - Math.PI / 2 + 0.15;
      const vary = i % 2 === 0 ? 0.50 : 0.70;
      pts2.push({ x: cx + Math.cos(a) * r * vary, y: cy + Math.sin(a) * r * vary });
    }
    g.fillStyle(0x550033, 1);
    g.fillPoints(pts2, true);
    g.fillStyle(0x220011, 1);
    g.fillEllipse(cx - 3, cy + 3, r * 0.7, r * 0.5);
    g.lineStyle(1.5, 0xff4488, 0.55);
    g.strokePoints(pts, true);
    g.generateTexture('leukemicCell', size, size);
    g.destroy();
  }

  _makeParticle() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xff66aa, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();
  }

  _makeCrosshair() {
    const size = 34, cx = 17, cy = 17;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.lineStyle(1.5, 0xffffff, 0.9);
    g.strokeCircle(cx, cy, 11);
    g.lineBetween(cx - 5, cy, cx - 15, cy);
    g.lineBetween(cx + 5, cy, cx + 15, cy);
    g.lineBetween(cx, cy - 5, cx, cy - 15);
    g.lineBetween(cx, cy + 5, cx, cy + 15);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx, cy, 1.5);
    g.generateTexture('crosshair', size, size);
    g.destroy();
  }

  _makePowerupBurst() {
    const size = 40, cx = 20, cy = 20;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xff8800, 0.25);
    g.fillCircle(cx, cy, 18);
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? 15 : 8;
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
    g.fillStyle(0xffcc00, 1);
    g.fillPoints(pts, true);
    g.fillStyle(0xff6600, 1);
    g.fillCircle(cx, cy, 6);
    g.generateTexture('powerupBurst', size, size);
    g.destroy();
  }

  _makePowerupHealth() {
    const size = 40, cx = 20, cy = 20;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x00ff66, 0.25);
    g.fillCircle(cx, cy, 18);
    g.fillStyle(0x00aa44, 1);
    g.fillCircle(cx, cy, 14);
    g.fillStyle(0xffffff, 1);
    g.fillRect(cx - 2, cy - 8, 4, 16);
    g.fillRect(cx - 8, cy - 2, 16, 4);
    g.generateTexture('powerupHealth', size, size);
    g.destroy();
  }

  _makePowerupFreeze() {
    const size = 40, cx = 20, cy = 20;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x44ccff, 0.25);
    g.fillCircle(cx, cy, 18);
    const hex = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
      hex.push({ x: cx + Math.cos(a) * 14, y: cy + Math.sin(a) * 14 });
    }
    g.fillStyle(0x0099cc, 1);
    g.fillPoints(hex, true);
    g.lineStyle(2, 0xaaeeff, 0.9);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI;
      g.lineBetween(cx + Math.cos(a) * 10, cy + Math.sin(a) * 10,
                    cx - Math.cos(a) * 10, cy - Math.sin(a) * 10);
    }
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx, cy, 3);
    g.generateTexture('powerupFreeze', size, size);
    g.destroy();
  }
}
