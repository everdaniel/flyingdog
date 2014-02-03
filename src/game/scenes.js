game.module(
    'game.scenes'
)
.require(
    'engine.scene',
    'engine.particle'
)
.body(function() {

SceneTitle = game.Scene.extend({
    backgroundColor: 0xb2dcef,
    gapTime: 1.5,
    gravity: 2000,
    jumpPower: -750,
    score: 0,
    shakeTime: 4,
    shakeSpeed: 0.01,
    shakeAmount: 8,
    cloudSpeed: 1,

    init: function() {
        this.world = new game.World(0, this.gravity);
        
        this.addParallax(400, 'media/parallax1.png', -50);
        this.addParallax(550, 'media/parallax2.png', -100);
        this.addParallax(650, 'media/parallax3.png', -200);

        this.addCloud(100, 100, 'media/cloud1.png', -50);
        this.addCloud(300, 50, 'media/cloud2.png', -30);

        this.logo = new Logo();

        this.addCloud(650, 100, 'media/cloud3.png', -50);
        this.addCloud(700, 200, 'media/cloud4.png', -40);

        this.addParallax(700, 'media/bushes.png', -250);
        this.gapContainer = new game.Container();
        this.stage.addChild(this.gapContainer);
        this.addParallax(800, 'media/ground.png', -300);

        this.player = new Player();
        
        var groundBody = new game.Body({
            position: {x: game.system.width / 2, y: 850}
        });
        var groundShape = new game.Rectangle(game.system.width, 100);
        groundBody.addShape(groundShape);
        this.world.addBody(groundBody);

        game.sound.musicVolume = 0.2;
        game.sound.playMusic('music');

        this.scoreText = new game.BitmapText(this.score.toString(), {font: 'Pixel'});
        this.scoreText.position.x = 16;
        this.stage.addChild(this.scoreText);

        var text = new game.Sprite(game.system.width / 2, game.system.height - 48, 'media/madewithpanda.png', {
            anchor: {x:0.5, y:0}
        });
        this.stage.addChild(text);
    },

    debug: function() {
        this.player.body.collide = function() {
            if(game.scene.player.collided) throw 'Double collision';
            game.scene.player.collided = true;
            game.scene.gameOver();
            game.scene.player.remove();
        };
        this.player.body.mass = 1;
        this.player.body.velocity.y = -1700;
        Gap.prototype.gapSpeed = -100;
        // this.spawnGap();
        this.addTimer(5.5, function() {
            game.system.setScene(SceneTitle);
        });
        this.gapTime = 0;
        this.startGapTimer();
    },

    startGapTimer: function() {
        this.addTimer(this.gapTime, this.spawnGap.bind(this));
    },

    spawnGap: function() {
        // TODO pooling ???
        var gap = new Gap();
        this.addObject(gap);
        this.startGapTimer();
    },

    addScore: function() {
        this.score++;
        this.scoreText.setText(this.score.toString());
        game.sound.playSound('score');
    },

    addCloud: function(x, y, path, speed) {
        var cloud = new Cloud(x, y, path, {speed: speed});
        this.addObject(cloud);
        this.stage.addChild(cloud);
    },

    addParallax: function(y, path, speed) {
        var parallax = new game.TilingSprite(0, y, path);
        parallax.speed.x = speed;
        this.addObject(parallax);
        this.stage.addChild(parallax);
    },

    mousedown: function() {
        if(this.ended) return;
        if(this.player.body.mass === 0) {
            // start game
            this.player.body.mass = 1;
            this.logo.remove();
            this.startGapTimer();
        }
        if(this.player.body.position.y < 0) return;
        this.player.body.velocity.y = this.jumpPower;
        game.sound.playSound('jump');
    },

    shake: function() {
        if(this.shakeTime === 0) {
            this.stage.position.x = this.stage.position.y = 0;
            return;
        }
        this.stage.position.x = this.shakeTime % 2 === 0 ? this.shakeAmount : -this.shakeAmount;
        this.addTimer(this.shakeSpeed, this.shake.bind(this));
        this.shakeTime--;
    },

    gameOver: function() {
        game.sound.stopMusic();
        this.cloudSpeed = 0.2;
        this.ended = true;
        this.timers.length = 0;
        // this.shake();
        var i;
        for (i = 0; i < this.objects.length; i++) {
            if(this.objects[i].speed) this.objects[i].speed.x = 0;
        }
        for (i = 0; i < this.world.bodies.length; i++) {
            this.world.bodies[i].velocity.set(0,0);
        }
        game.sound.playSound('explosion');

        this.addTimer(2, function() {
            game.system.setScene(SceneTitle);
        });
    }
});

});