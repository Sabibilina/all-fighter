# ALL Fighter – Defeat Leukemia

A browser-based educational game about Acute Lymphocytic Leukemia (ALL), built with vanilla JavaScript and [Phaser 3](https://phaser.io/).

Click jagged purple leukemic cells to destroy them across 5 waves, each introducing a new mechanic. Avoid clicking healthy blue cells. Clear all waves to cure the patient.

## How to run

Requires an internet connection (Phaser loads from CDN).

**macOS / Linux**
```bash
open index.html
```

**Windows**
```bash
start index.html
```

Or just double-click `index.html` in your file explorer.

## Project structure

```
├── index.html          # Entry point
├── constants.js        # Shared constants and utilities
├── game.js             # Phaser game initialisation
├── waves/
│   ├── wave1.js        # Wave 1 – basics
│   ├── wave2.js        # Wave 2 – cell splitting + power-ups
│   ├── wave3.js        # Wave 3 – mutating cells
│   ├── wave4.js        # Wave 4 – cursor avoidance
│   ├── wave5.js        # Wave 5 – final assault
│   └── index.js        # Assembles WAVES array
└── scenes/
    ├── BootScene.js    # Texture generation
    ├── MenuScene.js    # Title screen
    ├── GameScene.js    # Core gameplay
    └── EndScene.js     # Victory / game-over screen
```

---

*Educational game — not medical advice.*
