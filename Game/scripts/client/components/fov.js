//------------------------------------- -----------------------------
//
// Model for the field of view.
//
//------------------------------------------------------------------
MyGame.components.FOV = function(){
  'use strict';
  let that = {};
  let direction = 0;
  let length = 200;
  let width = 0.5;
  let center = {
    x: 0,
    y: 0
  }

  Object.defineProperty(that, 'center', {
    get: () => center
  });

  Object.defineProperty(that, 'direction', {
    get: () => direction
  });

  Object.defineProperty(that, 'width', {
    get: () => width
  });

  Object.defineProperty(that, 'length', {
    get: () => length
  });

  that.update = function(player) {
    center.x = player.position.x;
    center.y = player.position.y;
    direction = player.direction;
  }

  that.widen = function () {
    if (length > 140){
      length -= 10;
      width += .1;
    }
  }

  that.thin = function() {
    if (length < 230){
      length += 10;
      width -= .1;
    }
  }

  return that;
};