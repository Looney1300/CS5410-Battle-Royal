// ------------------------------------------------------------------
//
// Rendering function for what part of the map the player sees
//
// ------------------------------------------------------------------
MyGame.renderer.ViewPortal = (function(graphics) {
  'use strict';
  let that = {};

  that.render = function() {
    graphics.saveContext();
    graphics.drawMapPortion();
    graphics.restoreContext();
  };

  return that;

}(MyGame.graphics));