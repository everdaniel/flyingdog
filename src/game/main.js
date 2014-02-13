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

if(game.device.cocoonjs) game.start();
else game.start(SceneTitle, window.innerWidth, window.innerHeight);

});