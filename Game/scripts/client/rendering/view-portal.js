// ------------------------------------------------------------------
//
// Rendering function for what part of the map the player sees
//
// ------------------------------------------------------------------
MyGame.render.ViewPortal = (function(graphics) {
  'use strict';
  let that = {};

  that.render = function(viewPortal) {
    graphics.saveContext();
    graphics.drawMapPortion(viewPortal.center);
    graphics.restoreContext();
  };

  return that;
}(MyGame.graphics));