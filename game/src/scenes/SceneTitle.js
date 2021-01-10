export default class SceneTitle extends Phaser.Scene {
	constructor() {
		super('scene-title')
	}

	preload() {
    this.load.image('image-title', '../assets/title.jpg');
    this.load.image('button-start', '../assets/button-start.png');
    
    this.load.audio('audio-background', ['../assets/sfx-background.mp3', '../assets/sfx-background.ogg']);
	}

	create() {
    const musicBackground = this.sound.add('audio-background', { loop: true });
    musicBackground.play();
    
    const splash = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'image-title');
    const scaleX = this.cameras.main.width / splash.width;
    const scaleY = this.cameras.main.height / splash.height;
    const scale = Math.max(scaleX, scaleY)
    splash.setScale(scale).setScrollFactor(0);

    const buttonStart = this.add.image(640, 448, 'button-start');
    buttonStart.setInteractive();

    this.add.text(this.cameras.main.width / 2 + 8, this.cameras.main.height / 2 + 32, 'Our\n Terms', {
			fontFamily: 'font40b',
			fontSize: 40,
			color: 'rgba(255, 255, 255, 0.7)'
		}).setOrigin(0.5, 0.5);

    this.input.on('gameobjectdown', () => {
      this.scene.start('scene-game');
    });
	}
}
