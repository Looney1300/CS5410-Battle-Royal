//------------------------------------- -----------------------------
//
// Model for mini map in the large map.
//
//------------------------------------------------------------------

MyGame.components.MiniMap = function() {
  'use strict';
  let that = {},
    width = 140,
    height = 140,
    x = 440,
    y = 10,
    playerX = 450,
    playerY = 50;

    Object.defineProperty(that, 'width', {
      get: () => width
    });
    Object.defineProperty(that, 'height', {
      get: () => height
    });
    Object.defineProperty(that, 'x', {
      get: () => x
    });
    Object.defineProperty(that, 'y', {
      get: () => y
    });

    that.update = function(player, shield) {
      playerX = player.worldCordinates.x;
      playerY = player.worldCordinates.y;
    };


    return that;
};