import SceneGame from './scenes/SceneGame.js';
import SceneTitle from './scenes/SceneTitle.js';

const TILESIZE = 64;

const config = {
  type: Phaser.AUTO,
  width: 12 * TILESIZE,
  height: 9 * TILESIZE,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: [
    SceneTitle,
    SceneGame
  ]
};

const game = new Phaser.Game(config);
