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
      center: {
        x: 450,
        y: 50
      },
      direction: 0,
      size: {
        width: .025,
        height: .025
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
        player.center.x = cords.x,
        player.center.y = cords.y
      }
    });
    Object.defineProperty(that, 'size', {
      get: () => size,
      set: newSize => {
        size.width = newSize.width,
        size.height = newSize.height
      }
    });

    that.convertToMiniMapCords = function(cords, viewPort){
      let localCords = {x: 0, y: 0};
      localCords.x = (cords.x / 3200) * width + (center.x * 600 - (size.width*600/2));
      localCords.y = (cords.y / 3200) * height + (center.y * 600 - (size.height*600/2));

      localCords.x = localCords.x / viewPort.width;
      localCords.y = localCords.y / viewPort.height;

      return localCords;
    }

    that.convertRadius = function(radius) {
      return (radius / 3200) * width;
    }

    that.update = function(playerSelf, shield, viewPort) {
      player.center.x = playerSelf.worldCordinates.x;
      player.center.y = playerSelf.worldCordinates.y;
      player.direction = playerSelf.direction;

      player.center = that.convertToMiniMapCords(player.center, viewPort);
    };


    return that;
};