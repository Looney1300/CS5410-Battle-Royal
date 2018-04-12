// ------------------------------------------------------------------
//
// Rendering function for a Missile object.
//
// ------------------------------------------------------------------
MyGame.renderer.Missile = (function(graphics) {
    'use strict';
    let that = {};

    // ------------------------------------------------------------------
    //
    // Renders a Missile model.
    //
    // ------------------------------------------------------------------
    that.render = function(model, texture) {
        graphics.drawCircle({x: model.position.x, y: model.position.y}, model.radius, '#DAA520');
    };

    return that;

}(MyGame.graphics));
