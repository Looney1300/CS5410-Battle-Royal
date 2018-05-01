//------------------------------------- -----------------------------
//
// Model for mini map in the large map.
//
//------------------------------------------------------------------

MyGame.components.MiniMap = function() {
  'use strict';
  let worldWidth = 3200;
  let worldHeight = 3200;
  let that = {},
    center = {
      x: .5,
      y: .5
    },
    player = {
      center: {
        x: .5,
        y: .5
      },
      direction: 0,
      size: {
        width: .05,
        height: .05
      }
    },
    size = {
      width: 1,
      height: 1
    },
    playersAlive = 100,
    timeLeft = 30;

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

    that.convertToMiniMapCords = function(cords){
      let localCords = {x: 0, y: 0};
      localCords.x = (cords.x / worldWidth);
      localCords.y = (cords.y / worldHeight);

      return localCords;
    }

    that.convertRadius = function(radius) {
      return (radius / worldWidth);
    }

    that.update = function(playerSelf, shield) {
      player.center.x = playerSelf.worldCordinates.x;
      player.center.y = playerSelf.worldCordinates.y;
      player.direction = playerSelf.direction;

      player.center = that.convertToMiniMapCords(player.center);
    };


    return that;
};