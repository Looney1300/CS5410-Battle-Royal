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
  let mapWidth = 0;
  let mapHeight = 0;
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

  Object.defineProperty(that, 'mapWidth', {
    set: width => mapWidth = width
  });

  Object.defineProperty(that, 'mapHeight', {
    set: height => mapHeight = height
  });


  that.update = function(graphics, playerWC) { //player world cordinates
    width = graphics.getCanvasWidth();
    height = graphics.getCanvasHeight();
    center.x = playerWC.x;
    center.y = playerWC.y;
    if (center.x < width/2){
      center.x = width/2;
    }
    if (center.y < height/2){
      center.y = height/2;
    }
    if (center.x > mapWidth - width/2){
      center.x = mapWidth - width/2;
    }
    if (center.y > mapHeight - height/2){
      center.y = mapHeight - height/2;
    }
  };

  return that;

};