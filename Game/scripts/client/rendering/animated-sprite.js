// ------------------------------------------------------------------
//
// Rendering function for an AnimatedSprite object.
//
// ------------------------------------------------------------------
MyGame.renderer.AnimatedSprite = (function(graphics) {
    'use strict';
    let that = {};

    that.render = function(sprite) {
        // right now center is the world coords
        graphics.drawImageSpriteSheet(
            sprite.spriteSheet,
            { width: sprite.pixelWidth, height: sprite.pixelHeight },
            sprite.sprite,
            { x: sprite.printCenter.x, y: sprite.printCenter.y },
            { width: sprite.width, height: sprite.height }
        );
    };

    return that;
}(MyGame.graphics));
