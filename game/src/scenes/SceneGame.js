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
	sticky: false
};

export default class SceneGame extends Phaser.Scene {
	constructor() {
		super('scene-game')
	}

	preload() {
		this.load.image(KEYS.SOLID, '../assets/box-solid.png');
		this.load.image(KEYS.SPRING, '../assets/box-spring.png');
		this.load.image(KEYS.SPEEDUP, '../assets/box-speedup.png');
		this.load.image(KEYS.STICKY, '../assets/box-sticky.png');
		
		this.load.atlas(KEYS.PLAYER, '../assets/player.png', '../assets/player_atlas.json');
	}

	create() {
		// @TODO: Do not hardcode 768 and 576.
		this.cameras.main.setBounds(0, 0, 768, 576);

		this.createBoxes();
		this.createPlayer();

		this.physics.add.collider(this.player, this.boxesSolid, () => {
			if (this.player.body.touching.down) {
				playerData.jumpBoost = 1;
				playerData.speedBoost = 1;
				this.player.body.setMaxVelocityX(playerData.MAX_SPEED * playerData.speedBoost);
			}
		});

		this.physics.add.collider(this.player, this.boxesSpring, () => {
			if (this.player.body.touching.down) {
				playerData.jumpBoost = 1.5;
			}
		});

		this.physics.add.collider(this.player, this.boxesSpeedup, () => {
			if (this.player.body.touching.down) {
				playerData.speedBoost = 2;
				this.player.body.setMaxVelocityX(playerData.MAX_SPEED * playerData.speedBoost);
			}
		});

		this.physics.add.overlap(this.player, this.boxesSticky, () => {
			playerData.sticky = true;
		});

		this.cursors = this.input.keyboard.createCursorKeys();
		this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
	}

	createBoxes() {
		this.boxesSolid = this.physics.add.staticGroup();
		this.boxesSolid.create(35, 565, KEYS.SOLID);
		this.boxesSolid.create(105, 565, KEYS.SOLID);
		this.boxesSolid.create(175, 565, KEYS.SOLID);
		this.boxesSolid.create(525, 565, KEYS.SOLID);
		this.boxesSolid.create(595, 565, KEYS.SOLID);
		this.boxesSolid.create(665, 565, KEYS.SOLID);
		this.boxesSolid.create(735, 565, KEYS.SOLID);
		this.boxesSolid.create(805, 565, KEYS.SOLID);

		this.boxesSpring = this.physics.add.staticGroup();
		this.boxesSpring.create(735, 495, KEYS.SPRING);

		this.boxesSpeedup = this.physics.add.staticGroup();
		this.boxesSpeedup.create(245, 565, KEYS.SPEEDUP);
		this.boxesSpeedup.create(315, 565, KEYS.SPEEDUP);
		this.boxesSpeedup.create(385, 565, KEYS.SPEEDUP);
		this.boxesSpeedup.create(455, 565, KEYS.SPEEDUP);

		this.boxesSticky = this.physics.add.group({
			allowGravity: false
		});
		this.boxesSticky.create(35, 495, KEYS.STICKY);
		this.boxesSticky.create(35, 425, KEYS.STICKY);
		this.boxesSticky.create(35, 355, KEYS.STICKY);
		this.boxesSticky.create(35, 285, KEYS.STICKY);
		this.boxesSticky.create(35, 215, KEYS.STICKY);
		this.boxesSticky.create(315, 285, KEYS.STICKY);
		this.boxesSticky.create(315, 215, KEYS.STICKY);
		this.boxesSticky.create(315, 145, KEYS.STICKY);
		this.boxesSticky.create(315, 75, KEYS.STICKY);
		this.boxesSticky.create(315, 5, KEYS.STICKY);
	}

	createPlayer() {
		this.player = this.physics.add.sprite(140, 450, KEYS.PLAYER);
		this.player.setCollideWorldBounds(true);

		this.player.body.setMaxVelocityX(playerData.MAX_SPEED);
		this.player.body.setDragX(playerData.drag);

		this.anims.create({
			key: 'walk',
			frames: this.anims.generateFrameNames(KEYS.PLAYER, {
				prefix: 'robo_player_',
				start: 2,
				end: 3,
			}),
			frameRate: 10,
			repeat: -1
		});

		this.anims.create({
			key: 'idle',
			frames: [{ key: KEYS.PLAYER, frame: 'robo_player_0' }],
			frameRate: 10
		});

		this.anims.create({
			key: 'jump',
			frames: [{ key: KEYS.PLAYER, frame: 'robo_player_1' }],
			frameRate: 10
		});

		this.anims.create({
			key: 'climb-idle',
			frames: [{ key: KEYS.PLAYER, frame: 'robo_player_4' }]
		});

		this.anims.create({
			key: 'climb',
			frames: this.anims.generateFrameNames(KEYS.PLAYER, {
				prefix: 'robo_player_',
				start: 4,
				end: 5,
			}),
			frameRate: 8,
			repeat: -1
		});
	}

	update() {
		if (!playerData.sticky) {
			this.player.body.setAllowGravity(true);
		}

		if (playerData.sticky) {
			this.player.body.setAllowGravity(false);

			if (this.cursors.up.isDown) {
				this.player.setVelocityY(-playerData.MAX_SPEED);
				this.player.play('climb', true);
			}
			else if (this.cursors.down.isDown) {
				this.player.setVelocityY(playerData.MAX_SPEED);
				this.player.play('climb', true);
			}
			else {
				this.player.setVelocityY(0);
				this.player.play('climb-idle', true);
			}
		}

		if (this.cursors.left.isDown) {
			if (playerData.sticky) {
				this.player.setVelocityX(-playerData.MAX_SPEED);
			}
			else {
				this.player.setAccelerationX(-playerData.acc * playerData.speedBoost);
				if (this.player.body.onFloor()) {
					this.player.play('walk', true);
				}
			}
		}
		else if (this.cursors.right.isDown) {
			if (playerData.sticky) {
				this.player.setVelocityX(playerData.MAX_SPEED);
			}
			else {
				this.player.setAccelerationX(playerData.acc * playerData.speedBoost);
				if (this.player.body.onFloor()) {
					this.player.play('walk', true);
				}
			}
		}
		else {
			this.player.setAccelerationX(0);
			if (this.player.body.onFloor()) {
				this.player.play('idle', true);
			}
		}

		if (this.cursors.space.isDown) {
			if (this.player.body.touching.down || (playerData.sticky && (this.cursors.right.isDown || this.cursors.left.isDown))) {
				this.player.setVelocityY(playerData.jumpPower * playerData.jumpBoost);
				this.player.play('jump', true);
			}
		}

		if (this.player.body.velocity.x > 0) {
			this.player.setFlipX(false);
		} else if (this.player.body.velocity.x < 0) {
			this.player.setFlipX(true);
		}

		// Reset
		playerData.sticky = false;
	}
}
