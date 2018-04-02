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

  Object.defineProperty(that, 'center', {
    get: () => center
  });

  Object.defineProperty(that, 'width', {
    get: () => width
  });

  Object.defineProperty(that, 'height', {
    get: () => height
  });


  that.update = function(graphics, playerWC) { //player world cordinates
    width = graphics.getClientWidth();
    height = graphics.getClientHeight();
    center.x = playerWC.x;
    center.y = playerWC.y;
  };

  return that;

};