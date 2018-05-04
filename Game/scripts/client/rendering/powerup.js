MyGame.renderer.PowerUp = (function(graphics) {
    'use strict';
    let that = {};

    that.render = function(model, texture) {
        graphics.drawImage(texture, model.position, model.size);
    };

    return that;

}(MyGame.graphics));