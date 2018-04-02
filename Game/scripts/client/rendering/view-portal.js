// ------------------------------------------------------------------
//
// Rendering function for what part of the map the player sees
//
// ------------------------------------------------------------------
MyGame.renderer.ViewPortal = (function(graphics) {
  'use strict';
  let that = {};

  that.render = function(viewPortal) {
    graphics.saveContext();
    graphics.drawMapPortion(viewPortal);
    graphics.restoreContext();
  };

  return that;

}(MyGame.graphics));