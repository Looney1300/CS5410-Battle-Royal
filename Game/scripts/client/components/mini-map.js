//------------------------------------- -----------------------------
//
// Model for mini map in the large map.
//
//------------------------------------------------------------------

MyGame.components.MiniMap = function() {
  'use strict';
  let worldWidth = 3200;
  let worldHeight = 3200;
  let canvas_mini = document.getElementById('canvas-mini');
  let that = {},
    width = canvas_mini.width,
    height = canvas_mini.height,
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
        width: .025,
        height: .025
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