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
    that.render = function(model, sprite) {
        graphics.saveContext();
        graphics.rotateCanvas(model.position, model.direction);
        //this should just change to render the sprite
        graphics.drawImageSpriteSheet( sprite.spriteSheet,
            { width: sprite.pixelWidth, height: sprite.pixelHeight },
            sprite.sprite,
            { x: sprite.center, y: sprite.center },
            { width: sprite.width, height: sprite.height });
        graphics.restoreContext();
    };

    return that;

}(MyGame.graphics));
