MyGame.renderer.PowerUp = (function(graphics) {
    'use strict';
    let that = {};

    // ------------------------------------------------------------------
    //
    // Renders a Player model.
    //
    // ------------------------------------------------------------------
    that.render = function(model, texture) {
        //console.log(model);
        //graphics.saveContext();
        //graphics.rotateCanvas(model.position, model.direction);
        graphics.drawCircle(model.position, model.radius, '#FFFFFF');
        //graphics.drawImage(texture, model.position, model.size);
        //graphics.restoreContext();
        //graphics.drawHealth(texture, model.position, model.size, model.life_remaining);
    };

    return that;

}(MyGame.graphics));