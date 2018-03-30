//------------------------------------------------------------------
//
// Model for what part of the map the player sees on screen
//
//------------------------------------------------------------------

MyGame.components.ViewPortal = function() {
  'use strict';
  let that = {};
  let width = 600;
  let height = 600;
  let center = {
    x : 300,
    y : 300,
  };
  let image = new Image();

  image.onload = function() {
    ready = true;
  };

  image.src = mapFile.tilesets[1].image;

  that.update = function(graphics, playerWC) { //player world cordinates
    width = graphics.getClientWidth;
    height = graphics.getClientHeight;
    center.x = playerWC.x;
    center.y = playerWC.y;
  };

  return that;

}