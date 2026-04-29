// ─── GameScene ────────────────────────────────────────────────────────────────
// Core gameplay loop. Uses WAVES[this.wave - 1] for all wave-specific config
// so per-wave mechanics are entirely driven by the wave files.

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create() {
    this.add.image(W / 2, H / 2, 'bg');

    // ── Game state ────────────────────────────────────────────────────────────
    this.health     = 100;
    this.score      = 0;
    this.wave       = 0;
    this.totalWaves = WAVES.length;
    this.waveConfig = null;   // set to WAVES[wave-1] at the start of each wave
    this.cells      = [];
    this.waveInProgress = false;
    this.gameOver       = false;
    this.frozen         = false;
    this.freezeTimer    = null;
    this.powerupItem    = null;
    this.powerupSpawned = false;
    this._floatUpdateRegistered = false;

    this._buildHUD();

    // Particle emitter for cell bursts
    this.particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 60, max: 220 },
      scale: { start: 1, end: 0 },
      lifespan: 550,
      gravityY: 80,
      blendMode: 'ADD',
      emitting: false,
    });

    // ── Custom crosshair cursor ───────────────────────────────────────────────
    this.game.canvas.style.cursor = 'none';
    this.crosshair = this.add.image(W / 2, H / 2, 'crosshair')
      .setDepth(100)
      .setAlpha(0.92);
    this.input.on('pointermove', (p) => this.crosshair.setPosition(p.x, p.y));
    this.events.once('shutdown', () => {
      this.game.canvas.style.cursor = 'default';
      this.input.off('pointermove');
    });

    // Show wave 1 announcement, then start the wave
    this.time.delayedCall(400, () => this._showWaveAnnouncement(1, () => this._startNextWave()));
  }

  // ── HUD ────────────────────────────────────────────────────────────────────
  _buildHUD() {
    this.add.graphics()
      .fillStyle(0x111111, 0.7)
      .fillRoundedRect(10, 10, 204, 24, 6);
    this.healthBar = this.add.graphics();
    this._drawHealthBar();
    this.add.text(14, 13, '❤ Patient Health', {
      fontSize: '12px', color: '#ffcccc', fontFamily: 'Segoe UI',
    });

    this.scoreTxt = this.add.text(W - 14, 14, 'Score: 0', {
      fontSize: '16px', color: '#aaddff', fontFamily: 'Segoe UI',
    }).setOrigin(1, 0);

    this.waveTxt = this.add.text(W / 2, 14, 'Wave 0 / ' + WAVES.length, {
      fontSize: '16px', color: '#ffddaa', fontFamily: 'Segoe UI',
    }).setOrigin(0.5, 0);
  }

  _drawHealthBar() {
    this.healthBar.clear();
    const pct = Math.max(0, this.health) / 100;
    const color = pct > 0.5 ? 0x33cc66 : pct > 0.25 ? 0xffaa00 : 0xff2244;
    this.healthBar.fillStyle(color, 1).fillRoundedRect(12, 12, 200 * pct, 20, 5);
  }

  // ── Wave flow ──────────────────────────────────────────────────────────────
  _startNextWave() {
    if (this.gameOver) return;
    this.wave++;
    this.waveConfig     = WAVES[this.wave - 1];
    this.waveInProgress = true;
    this.powerupSpawned = false;

    this.waveTxt.setText('Wave ' + this.wave + ' / ' + this.totalWaves);

    // Clean up any leftover power-up from previous wave
    if (this.powerupItem && this.powerupItem.active) {
      this.tweens.killTweensOf(this.powerupItem);
      this.powerupItem.destroy();
      this.powerupItem = null;
    }

    this._showWaveBanner(this.wave);
    this.time.delayedCall(1200, () => { if (!this.gameOver) this._spawnWave(); });
  }

  _showWaveBanner(wave) {
    const txt = this.add.text(W / 2, H / 2 - 30, 'WAVE ' + wave, {
      fontSize: '52px', fontFamily: 'Segoe UI', color: '#ffee88',
      stroke: '#442200', strokeThickness: 7,
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: txt, alpha: 1, duration: 300, yoyo: true, hold: 600,
      onComplete: () => txt.destroy(),
    });
  }

  // ── Between-wave announcement overlay ─────────────────────────────────────
  // `wave`  — the wave number about to start (1-based, used to look up WAVES[wave-1])
  // `onDone`— called when the player skips or the countdown expires
  _showWaveAnnouncement(wave, onDone) {
    const cfg = WAVES[wave - 1];
    if (!cfg) { onDone(); return; }

    const DEPTH = 200;
    const objs  = [];
    const track = o => { objs.push(o); return o; };

    // Lift crosshair above the overlay so it stays visible
    if (this.crosshair) this.crosshair.setDepth(DEPTH + 10);

    // Dim backdrop — setInteractive() blocks clicks reaching cells underneath
    track(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.82)
      .setDepth(DEPTH).setInteractive());

    // Panel dimensions
    const PW = 560;
    const PH = cfg.newTag ? 314 : 278;
    const PX = W / 2 - PW / 2;
    const PY = H / 2 - PH / 2;
    const themeHex = '#' + cfg.theme.toString(16).padStart(6, '0');

    // Panel background + border
    const pg = track(this.add.graphics().setDepth(DEPTH + 1));
    pg.fillStyle(0x060e1c, 0.97);
    pg.fillRoundedRect(PX, PY, PW, PH, 16);
    pg.lineStyle(2, cfg.theme, 0.9);
    pg.strokeRoundedRect(PX, PY, PW, PH, 16);

    // Coloured accent strip along the top of the panel
    const strip = track(this.add.graphics().setDepth(DEPTH + 1));
    strip.fillStyle(cfg.theme, 0.20);
    strip.fillRoundedRect(PX, PY, PW, 46, { tl: 16, tr: 16, bl: 0, br: 0 });

    let y = PY + 10;

    // Wave counter
    track(this.add.text(W / 2, y, `WAVE ${wave} / ${WAVES.length}`, {
      fontSize: '22px', fontFamily: 'Segoe UI', color: themeHex,
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(DEPTH + 2));
    y += 52;

    // "NEW THIS WAVE" badge (pulsing) — omitted for wave 1
    if (cfg.newTag) {
      const badge = track(this.add.text(W / 2, y, cfg.newTag, {
        fontSize: '14px', fontFamily: 'Segoe UI', color: '#ffffff',
        backgroundColor: themeHex, padding: { x: 14, y: 6 },
      }).setOrigin(0.5, 0).setDepth(DEPTH + 2));
      this.tweens.add({
        targets: badge, scaleX: 1.06, scaleY: 1.06,
        duration: 420, yoyo: true, repeat: -1,
      });
      y += 40;
    }

    // Wave title
    track(this.add.text(W / 2, y, cfg.title, {
      fontSize: '24px', fontFamily: 'Segoe UI', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5, 0).setDepth(DEPTH + 2));
    y += 38;

    // Icon
    track(this.add.text(W / 2, y, cfg.icon, {
      fontSize: '30px',
    }).setOrigin(0.5, 0).setDepth(DEPTH + 2));
    y += 44;

    // Description (word-wrapped, centred)
    const desc = track(this.add.text(W / 2, y, cfg.description, {
      fontSize: '14px', fontFamily: 'Segoe UI', color: '#cce0ff',
      align: 'center', wordWrap: { width: 500, useAdvancedWrap: true },
    }).setOrigin(0.5, 0).setDepth(DEPTH + 2));
    y += desc.height + 4;

    // Detail line (smaller, amber)
    if (cfg.detail) {
      track(this.add.text(W / 2, y, cfg.detail, {
        fontSize: '12px', fontFamily: 'Segoe UI', color: '#ffcc88', align: 'center',
      }).setOrigin(0.5, 0).setDepth(DEPTH + 2));
    }

    // Continue / Skip button
    const btnY = PY + PH - 46;
    const btn  = track(this.add.text(W / 2, btnY, '▶  Continue', {
      fontSize: '19px', fontFamily: 'Segoe UI', color: '#ffffff',
      backgroundColor: '#1a5c2e', padding: { x: 22, y: 10 },
    }).setOrigin(0.5, 0.5).setDepth(DEPTH + 2).setInteractive());
    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#27a349' }));
    btn.on('pointerout',  () => btn.setStyle({ backgroundColor: '#1a5c2e' }));

    // Countdown bar (auto-advances after 15 s)
    const barY = PY + PH - 10;
    const barW = PW - 20;
    track(this.add.rectangle(W / 2, barY, barW, 5, 0x1a2a3a)
      .setDepth(DEPTH + 2).setOrigin(0.5, 0.5));
    const barFg = track(
      this.add.rectangle(W / 2 - barW / 2, barY, barW, 5, cfg.theme)
        .setDepth(DEPTH + 3).setOrigin(0, 0.5)
    );

    // Dismiss logic
    let gone = false;
    const dismiss = () => {
      if (gone) return;
      gone = true;
      this.tweens.killTweensOf(barFg);
      objs.forEach(o => {
        if (o && o.active) { this.tweens.killTweensOf(o); o.destroy(); }
      });
      if (this.crosshair) this.crosshair.setDepth(100);
      onDone();
    };

    this.tweens.add({
      targets: barFg, scaleX: 0, duration: 15000,
      ease: 'Linear', onComplete: dismiss,
    });
    btn.on('pointerdown', dismiss);
  }

  // ── Cell spawning ──────────────────────────────────────────────────────────
  _spawnWave() {
    const { healthyCount, leukemicCount, speed, powerups } = this.waveConfig;
    const margin = 50;
    const rnd = () => ({
      x: margin + Math.random() * (W - margin * 2),
      y: margin + 50 + Math.random() * (H - margin * 2 - 60),
    });

    for (let i = 0; i < healthyCount;  i++) { const p = rnd(); this._spawnCell(p.x, p.y, false, speed); }
    for (let i = 0; i < leukemicCount; i++) { const p = rnd(); this._spawnCell(p.x, p.y, true,  speed); }

    // Power-ups: enabled or not is determined by the wave config
    if (powerups) {
      const puDelay = 2500 + Math.random() * 3000;
      this.time.delayedCall(puDelay, () => {
        if (!this.gameOver && !this.powerupSpawned && this.waveInProgress) {
          this._spawnPowerup();
        }
      });
    }
  }

  // canSplit=false marks a split-child: no further splitting, no mutation, smaller scale
  _spawnCell(x, y, isLeukemic, speed, canSplit = true) {
    // Mutation: only if the wave config enables it
    const willMutate = isLeukemic && canSplit && this.waveConfig.mutation && Math.random() < 0.38;
    const key = (isLeukemic && !willMutate) ? 'leukemicCell' : 'healthyCell';

    const img = this.add.image(x, y, key)
      .setInteractive()
      .setAlpha(0)
      .setData('leukemic',  isLeukemic)
      .setData('alive',     true)
      .setData('canSplit',  canSplit)
      .setData('mutating',  willMutate);

    if (!canSplit) img.setScale(0.72);

    this.tweens.add({ targets: img, alpha: 1, duration: 400 });

    if (isLeukemic && !willMutate) this._addPulseTween(img);
    if (willMutate)                this._startMutation(img);

    this._startFloating(img, speed);

    img.on('pointerdown', () => this._onCellClick(img));
    img.on('pointerover',  () => {
      if (img.getData('leukemic') && !img.getData('mutating'))
        this.crosshair.setTint(0xff3344);
    });
    img.on('pointerout', () => this.crosshair.clearTint());

    this.cells.push(img);

    if (isLeukemic) {
      const delay = Math.max(2500, 5000 + Math.random() * 3000 - this.wave * 400);
      img.setData('escapeTimer',
        this.time.delayedCall(delay, () => {
          if (img.getData('alive')) this._cellEscaped(img);
        })
      );
    }
  }

  _addPulseTween(img) {
    const base = img.scaleX;
    this.tweens.add({
      targets: img,
      scaleX: base * 1.12, scaleY: base * 1.12,
      duration: 600 + Math.random() * 200,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  // Mutation: cell starts blue, slowly shifts tint to purple, then reveals true form
  _startMutation(img) {
    const duration = 3200 + Math.random() * 1200;
    const tween = this.tweens.addCounter({
      from: 0, to: 255,
      duration,
      onUpdate: (t) => {
        if (!img.active || !img.getData('mutating')) return;
        const v = t.getValue();
        // 0xffffff → 0xff0088: green channel drops to 0, blue drops to 136
        const gCh = Math.round(255 - v);
        const bCh = Math.round(255 - v * (119 / 255));
        img.setTint((0xff << 16) | (gCh << 8) | bCh);
      },
      onComplete: () => {
        if (!img.active) return;
        img.setData('mutating', false);
        img.clearTint();
        img.setTexture('leukemicCell');
        this._addPulseTween(img);
      },
    });
    img.setData('mutateTween', tween);
  }

  // ── Physics update ─────────────────────────────────────────────────────────
  _startFloating(img, speed) {
    const a = Math.random() * Math.PI * 2;
    img.setData('vx', Math.cos(a) * speed);
    img.setData('vy', Math.sin(a) * speed);
    img.setData('speed', speed);

    if (!this._floatUpdateRegistered) {
      this._floatUpdateRegistered = true;
      this.events.on('update', this._updateCells, this);
    }
  }

  _updateCells() {
    if (this.gameOver) return;
    const dt        = this.game.loop.delta / 1000;
    const speedMult = this.frozen ? 0.18 : 1;
    const pointer   = this.input.activePointer;
    const FLEE_R    = 140;
    // Avoidance: enabled by this wave's config
    const avoidance = this.waveConfig?.avoidance ?? false;

    for (const cell of this.cells) {
      if (!cell.active || !cell.getData('alive')) continue;

      let vx = cell.getData('vx');
      let vy = cell.getData('vy');

      let nx = cell.x + vx * dt * speedMult;
      let ny = cell.y + vy * dt * speedMult;

      // Cursor avoidance — only for fully-revealed leukemic cells
      if (avoidance && cell.getData('leukemic') && !cell.getData('mutating')) {
        const fdx   = cell.x - pointer.x;
        const fdy   = cell.y - pointer.y;
        const fdist = Math.sqrt(fdx * fdx + fdy * fdy);
        if (fdist < FLEE_R && fdist > 1) {
          const strength = (1 - fdist / FLEE_R) * 100 * dt * speedMult;
          nx += (fdx / fdist) * strength;
          ny += (fdy / fdist) * strength;
        }
      }

      // Wall bounce
      const r = 30;
      if (nx < r || nx > W - r)      { vx = -vx; nx = Phaser.Math.Clamp(nx, r, W - r); }
      if (ny < 60 + r || ny > H - r) { vy = -vy; ny = Phaser.Math.Clamp(ny, 60 + r, H - r); }

      cell.setData('vx', vx);
      cell.setData('vy', vy);
      cell.x = nx;
      cell.y = ny;
    }
  }

  // ── Click handling ─────────────────────────────────────────────────────────
  _onCellClick(img) {
    if (!img.getData('alive') || this.gameOver) return;

    const isLeukemic = img.getData('leukemic');
    const isMutating = img.getData('mutating');

    if (isLeukemic && !isMutating) {
      img.setData('alive', false);
      const t  = img.getData('escapeTimer');  if (t)  t.remove();
      const mt = img.getData('mutateTween');  if (mt) mt.stop();
      this._destroyLeukemicCell(img);

    } else if (isLeukemic && isMutating) {
      // Clicked a disguised cell — penalty
      this._floatingText(img.x, img.y - 30, 'STILL MUTATING!', '#ffaa33');
      const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xff8800, 0.14);
      this.tweens.add({ targets: flash, alpha: 0, duration: 380, onComplete: () => flash.destroy() });
      this.cameras.main.shake(150, 0.006);
      this._damageHealth(8);

    } else {
      this._hitHealthyCell(img);
    }
  }

  _destroyLeukemicCell(img) {
    this.particles.setPosition(img.x, img.y);
    this.particles.explode(22);

    const ring = this.add.graphics();
    ring.lineStyle(3, 0xff4499, 1);
    ring.strokeCircle(img.x, img.y, 20);
    this.tweens.add({
      targets: ring, alpha: 0, scaleX: 2.5, scaleY: 2.5, duration: 400,
      onComplete: () => ring.destroy(),
    });

    this.tweens.killTweensOf(img);
    this.tweens.add({
      targets: img, alpha: 0, scaleX: 1.8, scaleY: 1.8, duration: 250,
      onComplete: () => { img.destroy(); this._removeCell(img); },
    });

    this._addScore(15);
    this._floatingText(img.x, img.y, '+15', '#ff88cc');
    this._checkWaveComplete();
  }

  _hitHealthyCell(img) {
    this.tweens.add({
      targets: img, tint: 0xff0000, duration: 110, yoyo: true, repeat: 2,
      onComplete: () => { if (img.active) img.clearTint(); },
    });
    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xff0000, 0.18);
    this.tweens.add({ targets: flash, alpha: 0, duration: 350, onComplete: () => flash.destroy() });
    this._floatingText(img.x, img.y - 30, 'HEALTHY CELL!', '#ff4444');
    this.cameras.main.shake(120, 0.007);
    this._damageHealth(12);
  }

  // ── Cell escaping & splitting ──────────────────────────────────────────────
  _cellEscaped(img) {
    if (!img.getData('alive')) return;
    img.setData('alive', false);

    const canSplit   = img.getData('canSplit');
    const isMutating = img.getData('mutating');
    const mt = img.getData('mutateTween');
    if (mt) mt.stop();

    // Splitting: enabled by this wave's config
    if (canSplit && !isMutating && this.waveConfig?.splitting) {
      this._floatingText(img.x, img.y - 30, 'SPLITTING!', '#ff8800');
      this._damageHealth(5);
      const childSpeed = img.getData('speed') * 0.65;
      this._spawnCell(img.x - 22, img.y - 10, true, childSpeed, false);
      this._spawnCell(img.x + 22, img.y + 12, true, childSpeed, false);
    } else {
      this._floatingText(img.x, img.y - 30, 'ESCAPED!', '#ffaa00');
      this._damageHealth(8);
    }

    this.tweens.killTweensOf(img);
    this.tweens.add({
      targets: img, alpha: 0, duration: 400,
      onComplete: () => { img.destroy(); this._removeCell(img); },
    });
    this._checkWaveComplete();
  }

  // ── Power-ups ──────────────────────────────────────────────────────────────
  _spawnPowerup() {
    this.powerupSpawned = true;
    const types = ['powerupBurst', 'powerupHealth', 'powerupFreeze'];
    const type  = types[Math.floor(Math.random() * types.length)];
    const margin = 80;
    const x = margin + Math.random() * (W - margin * 2);
    const y = 90  + Math.random() * (H - 180);

    const pu = this.add.image(x, y, type)
      .setInteractive()
      .setAlpha(0)
      .setDepth(5)
      .setData('puType', type)
      .setData('alive',  true);

    this.tweens.add({ targets: pu, alpha: 1, duration: 500 });
    this.tweens.add({ targets: pu, y: y - 14, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: pu, angle: 360, duration: 3800, repeat: -1, ease: 'Linear' });

    pu.on('pointerover',  () => this.crosshair.setTint(0xffee00));
    pu.on('pointerout',   () => this.crosshair.clearTint());
    pu.on('pointerdown',  () => this._collectPowerup(pu));

    // Auto-expire after 7 s
    this.time.delayedCall(7000, () => {
      if (pu.active && pu.getData('alive')) {
        pu.setData('alive', false);
        this.tweens.killTweensOf(pu);
        this.tweens.add({
          targets: pu, alpha: 0, duration: 500,
          onComplete: () => { if (pu.active) pu.destroy(); this.powerupItem = null; },
        });
      }
    });

    this.powerupItem = pu;
  }

  _collectPowerup(pu) {
    if (!pu.getData('alive') || this.gameOver) return;
    pu.setData('alive', false);
    this.crosshair.clearTint();
    this.tweens.killTweensOf(pu);

    this.tweens.add({
      targets: pu, alpha: 0, scaleX: 2.4, scaleY: 2.4, duration: 380,
      onComplete: () => { if (pu.active) pu.destroy(); this.powerupItem = null; },
    });

    const type = pu.getData('puType');
    if (type === 'powerupBurst')  this._applyChemoBurst();
    if (type === 'powerupHealth') this._applyBoneMarrow(pu.x, pu.y);
    if (type === 'powerupFreeze') this._applyFreeze(pu.x, pu.y);
  }

  _applyChemoBurst() {
    const targets = this.cells.filter(c => c.active && c.getData('leukemic') && c.getData('alive'));
    targets.forEach(c => {
      c.setData('alive', false);
      const t  = c.getData('escapeTimer'); if (t)  t.remove();
      const mt = c.getData('mutateTween'); if (mt) mt.stop();
      this.particles.setPosition(c.x, c.y);
      this.particles.explode(10);
      this.tweens.killTweensOf(c);
      this.tweens.add({
        targets: c, alpha: 0, scaleX: 2, scaleY: 2, duration: 300,
        onComplete: () => { c.destroy(); this._removeCell(c); },
      });
      this._addScore(8);
    });

    this._floatingText(W / 2, H / 2 - 50, 'CHEMO BURST!', '#ffcc00');
    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xff8800, 0.28);
    this.tweens.add({ targets: flash, alpha: 0, duration: 700, onComplete: () => flash.destroy() });

    this.time.delayedCall(400, () => this._checkWaveComplete());
  }

  _applyBoneMarrow(px, py) {
    this.health = Math.min(100, this.health + 20);
    this._drawHealthBar();
    this._floatingText(px, py - 20, '+20 HP', '#88ff88');
    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0x00ff66, 0.14);
    this.tweens.add({ targets: flash, alpha: 0, duration: 500, onComplete: () => flash.destroy() });
  }

  _applyFreeze(px, py) {
    this.frozen = true;
    this._floatingText(px, py - 20, 'FROZEN!', '#88eeff');
    this.cells.filter(c => c.active && c.getData('leukemic') && !c.getData('mutating'))
      .forEach(c => c.setTint(0x88ccff));
    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0x0088cc, 0.15);
    this.tweens.add({ targets: flash, alpha: 0, duration: 600, onComplete: () => flash.destroy() });

    if (this.freezeTimer) this.freezeTimer.remove();
    this.freezeTimer = this.time.delayedCall(3000, () => {
      this.frozen = false;
      this.cells.filter(c => c.active && c.getData('leukemic') && !c.getData('mutating'))
        .forEach(c => c.clearTint());
    });
  }

  // ── Score / Health ─────────────────────────────────────────────────────────
  _addScore(n) {
    this.score += n;
    this.scoreTxt.setText('Score: ' + this.score);
  }

  _damageHealth(n) {
    this.health = Math.max(0, this.health - n);
    this._drawHealthBar();
    if (this.health <= 0) this._endGame(false);
  }

  _floatingText(x, y, msg, color) {
    const t = this.add.text(x, y, msg, {
      fontSize: '17px', fontFamily: 'Segoe UI', color,
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({
      targets: t, y: y - 55, alpha: 0, duration: 900,
      onComplete: () => t.destroy(),
    });
  }

  // ── Wave completion ────────────────────────────────────────────────────────
  _removeCell(img) {
    const i = this.cells.indexOf(img);
    if (i !== -1) this.cells.splice(i, 1);
  }

  _checkWaveComplete() {
    if (this.gameOver) return;
    const remaining = this.cells.filter(
      c => c.active && c.getData('leukemic') && c.getData('alive')
    );
    if (remaining.length === 0 && this.waveInProgress) {
      this.waveInProgress = false;
      if (this.wave >= this.totalWaves) {
        this.time.delayedCall(800, () => this._endGame(true));
      } else {
        this._clearHealthyCells(() => {
          const next = this.wave + 1;
          this._showWaveAnnouncement(next, () => this._startNextWave());
        });
      }
    }
  }

  _clearHealthyCells(cb) {
    const healthy = this.cells.filter(c => c.active && !c.getData('leukemic'));
    let done = 0;
    if (healthy.length === 0) { cb(); return; }
    healthy.forEach(c => {
      c.setData('alive', false);
      this.tweens.killTweensOf(c);
      this.tweens.add({
        targets: c, alpha: 0, duration: 500,
        onComplete: () => {
          c.destroy();
          this._removeCell(c);
          if (++done === healthy.length) cb();
        },
      });
    });
  }

  // ── End game ───────────────────────────────────────────────────────────────
  _endGame(won) {
    if (this.gameOver) return;
    this.gameOver = true;
    this.events.off('update', this._updateCells, this);

    this.cells.forEach(c => {
      c.setData('alive', false);
      c.disableInteractive();
      const mt = c.getData('mutateTween');
      if (mt) mt.stop();
    });

    if (this.powerupItem && this.powerupItem.active) {
      this.tweens.killTweensOf(this.powerupItem);
      this.powerupItem.destroy();
      this.powerupItem = null;
    }
    if (this.freezeTimer) this.freezeTimer.remove();

    this.time.delayedCall(500, () => {
      this.scene.start('End', { won, score: this.score });
    });
  }
}
