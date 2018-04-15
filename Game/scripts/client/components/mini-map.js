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
    center = {
      x: .87,
      y: .13
    },
    player = {
      x: 450,
      y: 50,
      direction: 0,
      size: {
        width: .04,
        height: .04
      }
    },
    size = {
      width: .23,
      height: .23
    },
    playersAlive = 100,
    timeLeft = 30;

    Object.defineProperty(that, 'width', {
      get: () => width
    });
    Object.defineProperty(that, 'height', {
      get: () => height
    });
    Object.defineProperty(that, 'center', {
      get: () => center
    });
    Object.defineProperty(that, 'player', {
      get: () => player,
      set: cords => {
        player.x = cords.x,
        player.y = cords.y
      }
    });
    Object.defineProperty(that, 'size', {
      get: () => size,
      set: newSize => {
        size.width = newSize.width,
        size.height = newSize.height
      }
    });

    that.update = function(playerSelf, shield, viewPort) {
      player.x = playerSelf.worldCordinates.x;
      player.y = playerSelf.worldCordinates.y;
      player.direction = playerSelf.direction;

      player.x = (player.x / 3200) * width + (center.x * 600 - (size.width*600/2));
      player.y = (player.y / 3200) * height + (center.y * 600 - (size.height*600/2));

      player.x = player.x / viewPort.width;
      player.y = player.y / viewPort.height;
    };


    return that;
};