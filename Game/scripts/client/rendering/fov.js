// ------------------------------------------------------------------
//
// Rendering function for a field of view object.
//
// ------------------------------------------------------------------
MyGame.renderer.FOV = (function(graphics) {
  'use strict';
  let that = {};

  that.render = function(fov) {
    graphics.saveContext();
    graphics.drawFOV(fov);
    graphics.restoreContext();
  }

  return that;
}(MyGame.graphics));