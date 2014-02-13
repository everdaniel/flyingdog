game.module(
    'game.scenes'
)
.require(
    'engine.scene'
)
.body(function() {

SceneGame = game.Scene.extend({
    backgroundColor: 0xb2dcef,
    gapTime: 1.5,
    gravity: 2000,
    score: 0,
    cloudSpeedFactor: 1,

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

        this.scoreText = new game.BitmapText(this.score.toString(), {font: 'Pixel'});
        this.scoreText.position.x = game.system.width / 2 - this.scoreText.textWidth / 2;
        this.stage.addChild(this.scoreText);

        var text = new game.Sprite(game.system.width / 2, game.system.height - 48, 'media/madewithpanda.png', {
            anchor: {x:0.5, y:0}
        });
        this.stage.addChild(text);

        game.sound.musicVolume = 0.2;
        game.sound.playMusic('music');
    },

    spawnGap: function() {
        this.addObject(new Gap());
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
            game.analytics.event('play');
            this.player.body.mass = 1;
            this.logo.remove();
            this.addTimer(this.gapTime, this.spawnGap.bind(this), true);
        }
        this.player.jump();
    },

    showScore: function() {
        var box = new game.Sprite(game.system.width / 2, game.system.height / 2, 'media/gameover.png', {anchor: {x:0.5, y:0.5}});

        var highScore = parseInt(game.storage.get('highScore')) || 0;
        if(this.score > highScore) game.storage.set('highScore', this.score);

        var highScoreText = new game.BitmapText(highScore.toString(), {font: 'Pixel'});
        highScoreText.position.x = 27;
        highScoreText.position.y = 43;
        box.addChild(highScoreText);

        var scoreText = new game.BitmapText('0', {font: 'Pixel'});
        scoreText.position.x = highScoreText.position.x;
        scoreText.position.y = -21;
        box.addChild(scoreText);

        game.scene.stage.addChild(box);

        this.restartButton = new game.Sprite(game.system.width / 2, game.system.height / 2 + 250, 'media/restart.png', {
            anchor: {x:0.5, y:0.5},
            scale: {x:0, y:0},
            interactive: true,
            mousedown: function() {
                game.analytics.event('restart');
                game.system.setScene(SceneGame);
            }
        });

        if(this.score > 0) {
            var time = Math.min(0.1, 1 / this.score);
            var scoreCounter = 0;
            this.addTimer(time, function() {
                scoreCounter++;
                scoreText.setText(scoreCounter.toString());
                if(scoreCounter >= game.scene.score) {
                    this.repeat = false;
                    if(game.scene.score > highScore) {
                        game.sound.playSound('highscore');
                        var newBox = new game.Sprite(-208, 59, 'media/new.png');
                        box.addChild(newBox);
                    }
                    game.scene.showRestartButton();
                }
            }, true);
        } else {
            this.showRestartButton();
        }
    },

    showRestartButton: function() {
        this.addTween(this.restartButton.scale, {x:1, y:1}, 0.2, {easing: game.Tween.Easing.Back.Out}).start();
        this.stage.addChild(this.restartButton);
    },

    gameOver: function() {
        var i;
        this.cloudSpeedFactor = 0.2;
        this.ended = true;
        this.timers.length = 0;
        for (i = 0; i < this.objects.length; i++) {
            if(this.objects[i].speed) this.objects[i].speed.x = 0;
        }
        for (i = 0; i < this.world.bodies.length; i++) {
            this.world.bodies[i].velocity.set(0,0);
        }

        this.addTimer(0.5, this.showScore.bind(this));

        game.sound.stopMusic();
        game.sound.playSound('explosion');
    }
});

});