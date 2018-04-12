// ------------------------------------------------------------------
//
// Rendering function for a mini map object.
//
// ------------------------------------------------------------------
MyGame.renderer.MiniMap = (function(graphics) {
  'use strict';
  let that = {};

  that.render = function(miniMap, texture) {
    graphics.saveContext();
    graphics.drawMiniMap(miniMap, texture);
    graphics.restoreContext();
  };

  return that;

}(MyGame.graphics));