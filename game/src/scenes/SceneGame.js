const KEYS = {
	PLAYER: 'player',
	SOLID: 'box-solid',
	SPRING: 'box-spring',
	SPEEDUP: 'box-speedup',
	STICKY: 'box-sticky'
};

const playerData = {
	jumpPower: -400,
	jumpBoost: 1,
	acc: 1000,
	drag: 800,
	speedBoost: 1,
	MAX_SPEED: 160,
	sticky: false,
	dancing: false,
	skills: [
		'passthrough',
		'climb',
		{
			id: 'speedBlock',
			instruction: 'Speed boost on yellow blocks',
			textTile: 'textPansexual'
		},
		{
			id: 'jumpBlock',
			instruction: 'Jump higher on white blocks',
			textTile: 'textTransgender'
		},
		{
			id: 'jump',
			instruction: 'Press SPACE     to Jump',
			textTile: 'textHuman'
		}
	]
};

export default class SceneGame extends Phaser.Scene {
	constructor() {
		super('scene-game')
	}

	preload() {
		// World
		this.load.image('tiles-platforms', '../assets/tiles-platforms.png');
		this.load.image('tiles-powerups', '../assets/tiles-powerups.png');
		this.load.tilemapTiledJSON('tilemap-world', '../assets/world.json');
		
		// Player
		this.load.spritesheet('spritesheet-playerIdle',
      '../assets/player-idle.png',
      { frameWidth: 64, frameHeight: 64 }
    );
		this.load.spritesheet('spritesheet-playerRun',
      '../assets/player-run.png',
      { frameWidth: 64, frameHeight: 64 }
		);
		this.load.spritesheet('spritesheet-playerClimb',
      '../assets/player-climb.png',
      { frameWidth: 64, frameHeight: 64 }
		);
		this.load.spritesheet('spritesheet-playerDance',
      '../assets/player-dance.png',
      { frameWidth: 64, frameHeight: 64 }
		);
		this.load.spritesheet('spritesheet-playerCollect',
      '../assets/player-collect.png',
      { frameWidth: 64, frameHeight: 64 }
		);
		
		// Orbs
		this.load.spritesheet('spritesheet-orbs',
      '../assets/tiles-orbs.png',
      { frameWidth: 128, frameHeight: 128 }
		);
		
		// SFX
		this.load.audio('audio-background', ['../assets/sfx-background.mp3', '../assets/sfx-background.ogg']);
		this.load.audio('audio-jump', ['../assets/sfx-jump.mp3', '../assets/sfx-jump.ogg']);
		this.load.audio('audio-jumpboost', ['../assets/sfx-jumpboost.mp3', '../assets/sfx-jumpboost.ogg']);
		this.load.audio('audio-jumpspeed', ['../assets/sfx-jumpspeed.mp3', '../assets/sfx-jumpspeed.ogg']);
		this.load.audio('audio-orb', ['../assets/sfx-orb.mp3', '../assets/sfx-orb.ogg']);

		// Particles
		this.load.image('particle1', '../assets/particle01.png');
		this.load.image('particle2', '../assets/particle02.png');
	}

	create() {
		// Map
		const world = this.make.tilemap({ key: 'tilemap-world' });

		const tilesetPlatforms = world.addTilesetImage('tileset-platforms', 'tiles-platforms');
		const tilesetPowerups = world.addTilesetImage('tileset-powerups', 'tiles-powerups');

		const layerWorld = world.createLayer('layer-world', tilesetPlatforms, 0, 0);
		layerWorld.setCollisionByProperty({ collides: true });
		const layerPassThrough = world.createLayer('layer-passthrough', tilesetPowerups, 0, 0);
		layerPassThrough.setCollisionByProperty({ collides: true });
		const layerJump = world.createLayer('layer-jump', tilesetPowerups, 0, 0);
		layerJump.setCollisionByProperty({ collides: true });
		const layerSpeed = world.createLayer('layer-speed', tilesetPowerups, 0, 0);
		layerSpeed.setCollisionByProperty({ collides: true });

		const spawnPlayer = world.findObject('layer-objects', obj => obj.name === 'Player');
		const spawnOrbJump = world.findObject('layer-objects', obj => obj.name === 'Orb Jump');
		const spawnOrbJumpBlock = world.findObject('layer-objects', obj => obj.name === 'Orb Jump Block');
		const spawnOrbSpeedBlock = world.findObject('layer-objects', obj => obj.name === 'Orb Speed Block');
		const spawnOrbClimb = world.findObject('layer-objects', obj => obj.name === 'Orb Climb');
		const spawnOrbPassThrough = world.findObject('layer-objects', obj => obj.name === 'Orb Pass Through');

		// Player
		this.createPlayer(spawnPlayer.x, spawnPlayer.y);

		// Orbs
		const orbs = this.physics.add.staticGroup({
			allowGravity: false
		});
		orbs.create(spawnOrbJump.x, spawnOrbJump.y, 'spritesheet-orbs', 4).setScale(0.4).refreshBody();
		orbs.create(spawnOrbJumpBlock.x, spawnOrbJumpBlock.y, 'spritesheet-orbs', 0).setScale(0.4).refreshBody();
		orbs.create(spawnOrbSpeedBlock.x, spawnOrbSpeedBlock.y, 'spritesheet-orbs', 1).setScale(0.4).refreshBody();
		orbs.create(spawnOrbClimb.x, spawnOrbClimb.y, 'spritesheet-orbs', 2).setScale(0.4).refreshBody();
		orbs.create(spawnOrbPassThrough.x, spawnOrbPassThrough.y, 'spritesheet-orbs', 3).setScale(0.4).refreshBody();

		// Collision
		this.physics.add.collider(this.player, layerWorld, () => {
			if (this.player.body.onFloor()) {
				playerData.jumpBoost = 1;
				playerData.speedBoost = 1;
				this.player.body.setMaxVelocityX(playerData.MAX_SPEED * playerData.speedBoost);
			}
		});
		this.physics.add.collider(this.player, layerPassThrough);
		this.physics.add.collider(this.player, layerJump, () => {
			if (this.player.body.onFloor() && playerData['skill-jumpBlock']) {
				playerData.jumpBoost = 1.7;
			}
		});
		this.physics.add.collider(this.player, layerSpeed, () => {
			if (this.player.body.onFloor() && playerData['skill-speedBlock']) {
				playerData.speedBoost = 2.5;
				this.player.body.setMaxVelocityX(playerData.MAX_SPEED * playerData.speedBoost);
			}
		});
		this.physics.add.overlap(this.player, orbs, this.collectOrb, null, this);

		// Camera
		this.camera = this.cameras.main;
		this.camera.setBounds(0, 0, world.widthInPixels, world.heightInPixels);
		this.camera.startFollow(this.player, true, 0.05, 0.05);
		this.camera.setBackgroundColor('#823f66');

		// Input
		this.cursors = this.input.keyboard.createCursorKeys();

		// SFX
		const musicBackground = this.sound.add('audio-background', { loop: true });
		musicBackground.play();
		this.soundJump = this.sound.add('audio-jump');
		this.soundJumpBoost = this.sound.add('audio-jumpboost');
		this.soundJumpSpeed = this.sound.add('audio-jumpspeed');
		this.soundOrb = this.sound.add('audio-orb');

		// Timers
		this.timerDance = new Phaser.Time.TimerEvent({
			delay: 5000,
			loop: true,
			callback: () => {
				this.camera.zoomTo(2, 3000);
				playerData.dancing = true;
			}
		});
		this.time.addEvent(this.timerDance);

		// Particles
		this.explosion01 = this.add.particles('particle1')
			.setDepth(-5)
			.createEmitter({
				x: 200,
				y: 100,
				speed: { min: -200, max: 100 },
				angle: { min: 0, max: 360 },
				scale: { start: 0.5, end: 0 },
				blendMode: 'SCREEN',
				//active: false,
				lifespan: 500,
				gravityY: 100
			});
		this.explosion02 = this.add.particles('particle2')
			.setDepth(-5)
			.createEmitter({
				x: 200,
				y: 100,
				speed: { min: -200, max: 100 },
				angle: { min: 0, max: 360 },
				scale: { start: 0.5, end: 0 },
				blendMode: 'SCREEN',
				//active: false,
				lifespan: 500,
				gravityY: 100
			});

		// this.physics.add.overlap(this.player, this.boxesSticky, () => {
		// 	playerData.sticky = true;
		// });

		// Text
		this.textHuman = this.add.text(1856, 2368, 'human', {
			fontFamily: 'font40b',
			fontSize: 40,
			color: 'rgba(255, 255, 255, 0.5)'
		}).setAngle(45).setDepth(-10);
		this.textTransgender = this.add.text(2752, 2112, 'transgender', {
			fontFamily: 'font40b',
			fontSize: 32,
			color: 'rgba(255, 255, 255, 0.5)'
		}).setDepth(-10);
		this.textPansexual = this.add.text(3584, 1472, 'pansexual', {
			fontFamily: 'font40b',
			fontSize: 32,
			color: 'rgba(255, 255, 255, 0.5)'
		}).setAngle(90).setDepth(-10);
	}

	createPlayer(x, y) {
		this.player = this.physics.add.sprite(x, y, 'spritesheet-playerIdle')
			.setSize(40, 44)
			.setOffset(12, 20)
			.setFlipX(true);

		this.player.body.setMaxVelocityX(playerData.MAX_SPEED);
		this.player.body.setDragX(playerData.drag);

		this.anims.create({
			key: 'animation-idle',
			frames: this.anims.generateFrameNames('spritesheet-playerIdle', {
				start: 0,
				end: 14,
			}),
			frameRate: 20,
			repeat: -1
		});

		this.anims.create({
			key: 'animation-run',
			frames: this.anims.generateFrameNames('spritesheet-playerRun', {
				start: 0,
				end: 17,
			}),
			frameRate: 20,
			repeat: -1
		});

		this.anims.create({
			key: 'animation-climb',
			frames: this.anims.generateFrameNames('spritesheet-playerClimb', {
				start: 0,
				end: 13,
			}),
			frameRate: 20,
			repeat: -1
		});

		this.anims.create({
			key: 'animation-dance',
			frames: this.anims.generateFrameNames('spritesheet-playerDance', {
				start: 0,
				end: 336,
			}),
			frameRate: 25,
			repeat: -1
		});

		this.anims.create({
			key: 'animation-collect',
			frames: this.anims.generateFrameNames('spritesheet-playerCollect', {
				start: 0,
				end: 46,
			}),
			frameRate: 20
		});
	}

	collectOrb(player, orb) {
		this.soundOrb.play();

		orb.destroy(orb.x, orb.y);
		player.play('animation-collect', true);
		
		// Obtain next skill
		const skillItem = playerData.skills.pop();
		const nextSkill = `skill-${skillItem.id}`;
		playerData[nextSkill] = true;
		this[skillItem.textTile].setText(skillItem.instruction);

		if (nextSkill === 'skill-jump') {
			this.explosion01.startFollow(player);
		}
		else if (nextSkill === 'skill-jumpBlock') {
			this.explosion02.startFollow(player);
		}
	}

	update(time, delta) {
		// if (!playerData.sticky) {
		// 	this.player.body.setAllowGravity(true);
		// }

		// if (playerData.sticky) {
		// 	this.player.body.setAllowGravity(false);

		// 	if (this.cursors.up.isDown) {
		// 		this.player.setVelocityY(-playerData.MAX_SPEED);
		// 		this.player.play('climb', true);
		// 	}
		// 	else if (this.cursors.down.isDown) {
		// 		this.player.setVelocityY(playerData.MAX_SPEED);
		// 		this.player.play('climb', true);
		// 	}
		// 	else {
		// 		this.player.setVelocityY(0);
		// 		this.player.play('climb-idle', true);
		// 	}
		// }

		// if (this.cursors.left.isDown) {
		// 	if (playerData.sticky) {
		// 		this.player.setVelocityX(-playerData.MAX_SPEED);
		// 	}
		// 	else {
		// 		this.player.setAccelerationX(-playerData.acc * playerData.speedBoost);
		// 		if (this.player.body.onFloor()) {
		// 			this.player.play('animation-run', true);
		// 		}
		// 	}
		// }
		// else if (this.cursors.right.isDown) {
		// 	if (playerData.sticky) {
		// 		this.player.setVelocityX(playerData.MAX_SPEED);
		// 	}
		// 	else {
		// 		this.player.setAccelerationX(playerData.acc * playerData.speedBoost);
		// 		if (this.player.body.onFloor()) {
		// 			this.player.play('animation-run', true);
		// 		}
		// 	}
		// }
		// else {
		// 	this.player.setAccelerationX(0);
		// 	if (this.player.body.onFloor()) {
		// 		this.player.play('animation-idle', true);
		// 	}
		// }

		if (this.cursors.left.isDown) {
			if (playerData.dancing) {
				playerData.dancing = false;
			}
			if (this.camera.zoom !== 1) {
				this.camera.zoomTo(1, 1500);
			}

			this.player.setAccelerationX(-playerData.acc * playerData.speedBoost);
			this.player.play('animation-run', true);
			this.time.addEvent(this.timerDance);
		}
		else if (this.cursors.right.isDown) {
			if (playerData.dancing) {
				playerData.dancing = false;
			}
			if (this.camera.zoom !== 1) {
				this.camera.zoomTo(1, 1500);
			}

			this.player.setAccelerationX(playerData.acc * playerData.speedBoost);
			this.player.play('animation-run', true);
			this.time.addEvent(this.timerDance);

		}
		else {
			this.player.setAccelerationX(0);
			if (this.player.body.onFloor()) {
				if (playerData.dancing) {
					this.player.play('animation-dance', true);
				}
				else {
					if (this.player.anims.getName() !== 'animation-collect') {
						this.player.play('animation-idle', true);
					}
				}
			}
		}

		if (this.cursors.space.isDown && playerData['skill-jump']) {
			if (this.camera.zoom !== 1) {
				this.camera.zoomTo(1, 1500);
			}
			if (this.player.body.onFloor() || (playerData.sticky && (this.cursors.right.isDown || this.cursors.left.isDown))) {
				if (playerData.jumpBoost === 1) {
					if (playerData.speedBoost > 1) {
						this.soundJumpSpeed.play();
					}
					else {
						this.soundJump.play();
					}
				}
				else {
					this.soundJumpBoost.play();
				}
				this.player.setVelocityY(playerData.jumpPower * playerData.jumpBoost);
			}
		}

		// Do not test against 0 since the acceleration can take the velocity below/above 0
		if (this.player.body.velocity.x > 10) {
			this.player.setFlipX(true);
		} else if (this.player.body.velocity.x < -10) {
			this.player.setFlipX(false);
		}

		// Reset
		// playerData.jumpBoost = 1;
		// playerData.sticky = false;
	}
}
