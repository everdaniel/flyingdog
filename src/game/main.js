game.module(
    'game.main'
)
.require(
    'engine.core',
    'engine.particle',
    'game.assets',
    'game.objects',
    'game.scenes'
)
.body(function(){

game.Storage.id = 'net.pandajs.flyingdog';
game.System.idtkScale = 'ScaleAspectFill';
game.Analytics.id = 'UA-42024756-5';

game.start(SceneGame, 768, 1024);

});