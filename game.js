new Phaser.Game({
  type:            Phaser.AUTO,
  width:           W,
  height:          H,
  parent:          'game-container',
  backgroundColor: '#08111f',
  scene:           [BootScene, MenuScene, GameScene, EndScene],
});
