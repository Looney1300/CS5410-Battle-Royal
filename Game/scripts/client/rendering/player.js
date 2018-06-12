// ------------------------------------------------------------------
//
// Rendering function for a Player object.
//
// ------------------------------------------------------------------
MyGame.renderer.Player = (function(graphics) {
    'use strict';
    let that = {};

    // ------------------------------------------------------------------
    //
    // Renders a Player model.
    //
    // ------------------------------------------------------------------
    that.render = function(model, texture, killStat, time) {
        graphics.saveContext();
        graphics.rotateCanvas(model.position, model.direction);
        graphics.drawImageSpriteSheet( texture.spriteSheet,
            { width: texture.pixelWidth, height: texture.pixelHeight },
            texture.sprite,
            {x: texture.printCenter.x - (texture.width/2), y: texture.printCenter.y -(texture.height/2)},
            { width: texture.width, height: texture.height });
        graphics.restoreContext();
        graphics.drawHealth(model.position,  model.size , model.life_remaining);
        if(time > 0){
            graphics.drawGameStatus(killStat);
        }
        
    };

        

    return that;

}(MyGame.graphics));
