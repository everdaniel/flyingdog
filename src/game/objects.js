game.module(
    'game.objects'
)
.require(
    'engine.sprite'
)
.body(function() {

Gap = game.Sprite.extend({
    groundTop: 800,
    gapWidth: 132,
    gapMinY: 150,
    gapMaxY: 550,
    gapSize: 152 + 4 * 20,
    gapSpeed: -300,

    init: function() {
        var y = Math.round(game.Math.random(this.gapMinY, this.gapMaxY));

        var topHeight = y - this.gapSize / 2;
        this.topBody = new game.Body({
            position: {x: game.system.width + this.gapWidth / 2, y: topHeight / 2},
            velocity: {x: this.gapSpeed}
        });
        var topShape = new game.Rectangle(this.gapWidth, topHeight);
        this.topBody.addShape(topShape);
        game.scene.world.addBody(this.topBody);

        var bottomHeight = this.groundTop - topHeight - this.gapSize;
        this.bottomBody = new game.Body({
            position: {x: game.system.width + this.gapWidth / 2, y: topHeight + this.gapSize + bottomHeight / 2},
            velocity: {x: this.gapSpeed}
        });
        var bottomShape = new game.Rectangle(this.gapWidth, bottomHeight);
        this.bottomBody.addShape(bottomShape);
        game.scene.world.addBody(this.bottomBody);

        this.goalBody = new game.Body({
            position: {x: game.system.width + this.gapWidth / 2 + this.gapWidth + game.scene.player.body.shape.width, y: topHeight + this.gapSize / 2},
            velocity: {x: this.gapSpeed},
            collisionGroup: 1,
            collideAgainst: 1
        });
        this.goalBody.collide = function() {
            game.scene.world.removeBody(this);
            game.scene.addScore();
            return false;
        }
        var goalShape = new game.Rectangle(this.gapWidth, this.gapSize + game.scene.player.body.shape.height);
        this.goalBody.addShape(goalShape);
        game.scene.world.addBody(this.goalBody);

        this.topSprite = new game.Sprite(game.system.width + this.gapWidth / 2, topHeight, 'media/bar.png', {
            anchor: {x: 0.5, y: 0.0},
            scale: {y: -1}
        });
        game.scene.gapContainer.addChild(this.topSprite);

        this.bottomSprite = new game.Sprite(game.system.width + this.gapWidth / 2, topHeight + this.gapSize, 'media/bar.png', {
            anchor: {x: 0.5, y: 0.0},
        });
        game.scene.gapContainer.addChild(this.bottomSprite);
    },

    update: function() {
        this.topSprite.position.x = this.bottomSprite.position.x = this.topBody.position.x;
        if(this.topSprite.position.x + this.gapWidth / 2 < 0) {
            game.scene.world.removeBody(this.topBody);
            game.scene.world.removeBody(this.bottomBody);
            game.scene.world.removeBody(this.goalBody);
            game.scene.gapContainer.removeChild(this.topSprite);
            game.scene.gapContainer.removeChild(this.bottomSprite);
            game.scene.removeObject(this);
        }
    }
});

Cloud = game.Sprite.extend({
    update: function() {
        this.position.x += this.speed * game.scene.cloudSpeed * game.system.delta;
        if(this.position.x + this.width < 0) this.position.x = game.system.width;
    }
});

Player = game.Class.extend({
    init: function() {
        var x = game.system.width / 2;
        var y = 500;
        this.sprite = new game.Sprite(x, y, 'media/player.png', {anchor: {x:0.5, y:0.5}});
        game.scene.stage.addChild(this.sprite);
        game.scene.addObject(this);

        this.body = new game.Body({
            position: {x: x, y: y},
            velocityLimit: {x: 100, y: 1000},
            collideAgainst: 0,
            collisionGroup: 1,
        });
        this.body.collide = this.collide.bind(this);
        var shape = new game.Rectangle(128+4, 48-4-8);
        this.body.addShape(shape);
        game.scene.world.addBody(this.body);

        this.smokeEmitter = new game.Emitter({
            angle: Math.PI,
            angleVar: 0.1,
            endAlpha: 1,
            life: 0.4,
            lifeVar: 0.2,
            count: 2,
            speed: 400,
        });
        this.smokeEmitter.container = game.scene.stage;
        this.smokeEmitter.textures.push('media/particle.png');
        game.scene.emitters.push(this.smokeEmitter);

        this.flyEmitter = new game.Emitter({
            life: 0,
            rate: 0,
            positionVar: {x: 50, y: 50},
            targetForce: 200,
            speed: 100,
            velocityLimit: {x: 100, y: 100},
            endAlpha: 1
        });
        this.flyEmitter.container = game.scene.stage;
        this.flyEmitter.textures.push('media/particle2.png');
        this.flyEmitter.position.x = this.sprite.position.x + 30;
        this.flyEmitter.position.y = this.sprite.position.y - 30;
        this.flyEmitter.emit(5);
        game.scene.emitters.push(this.flyEmitter);
    },

    collide: function() {
        if(!game.scene.ended) {
            game.scene.gameOver();
            this.body.velocity.y = -200;
            this.remove();
        }
        this.body.velocity.x = 0;;
        return true;
    },

    update: function() {
        this.sprite.position.x = this.body.position.x;
        this.sprite.position.y = this.body.position.y;

        this.smokeEmitter.position.x = this.sprite.position.x - 60;
        this.smokeEmitter.position.y = this.sprite.position.y;

        this.flyEmitter.target.x = this.sprite.position.x + 30;
        this.flyEmitter.target.y = this.sprite.position.y - 30;
    },

    remove: function() {
        // game.scene.world.removeBody(this.body);
        // this.sprite.remove();
        this.smokeEmitter.rate = 0;
    }
});

Logo = game.Class.extend({
    init: function() {
        this.container = new game.Container();
        this.container.position.y = -150;
        game.scene.addTween(this.container.position, {y: 200}, 1.5, {delay: 0.1, easing: game.Tween.Easing.Back.Out}).start();

        var sprite;
        sprite = new game.Sprite(game.system.width / 2, 0, 'media/logo1.png', {anchor: {x:0.5, y:0.5}});
        this.container.addChild(sprite);
        game.scene.addTween(sprite.position, {y: -20}, 1, {easing: game.Tween.Easing.Quadratic.InOut, loop: game.Tween.Loop.Reverse}).start();

        sprite = new game.Sprite(game.system.width / 2, 80, 'media/logo2.png', {anchor: {x:0.5, y:0.5}});
        this.container.addChild(sprite);
        game.scene.addTween(sprite.position, {y: 100}, 1, {easing: game.Tween.Easing.Quadratic.InOut, loop: game.Tween.Loop.Reverse}).start();

        game.scene.stage.addChild(this.container);
    },

    remove: function() {
        game.scene.addTween(this.container, {alpha: 0}, 1, {onComplete: this.container.remove.bind(this)}).start();
    }
});

});