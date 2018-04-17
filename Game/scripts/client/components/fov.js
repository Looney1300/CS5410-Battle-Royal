//------------------------------------- -----------------------------
//
// Model for the field of view.
//
//------------------------------------------------------------------
MyGame.components.FOV = function(){
  'use strict';
  let that = {};
  let direction = 0;
  let length = 750;
  let width = 0.6;
  let center = {
    x: 0,
    y: 0
  };
  let firstPoint = {
    x: 0,
    y: 0
  };
  let secondPoint = {
    x: 0,
    y: 0
  };

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

  Object.defineProperty(that, 'firstPoint', {
    get: () => firstPoint
  });

  Object.defineProperty(that, 'secondPoint', {
    get: () => secondPoint
  });

  function area(x1, y1, x2, y2, x3, y3) {
    return Math.abs((x1*(y2-y3) + x2*(y3-y1)+ x3*(y1-y2))/2.0);
  }

  that.update = function(player) {
    center.x = player.position.x;
    center.y = player.position.y;
    direction = player.direction;
    firstPoint.x = center.x + (length * Math.cos(direction - width)/1000);
    firstPoint.y = center.y + (length * Math.sin(direction - width)/1000);
    secondPoint.x = center.x + (length * Math.cos(direction + width)/1000);
    secondPoint.y = center.y + (length * Math.sin(direction + width)/1000);
  }

  that.inFOV = function(player) {
    console.log(player);
    let a = area(center.x, center.y, firstPoint.x, firstPoint.y, secondPoint.x, secondPoint.y);
    let a1 = area(player.model.state.position.x, player.model.state.position.y, firstPoint.x, firstPoint.y, secondPoint.x, secondPoint.y);
    let a2 = area(center.x, center.y, player.model.state.position.x, player.model.state.position.y, secondPoint.x, secondPoint.y);
    let a3 = area(center.x, center.y, firstPoint.x, firstPoint.y, player.model.state.position.x, player.model.state.position.y);

    return (a == a1 + a2 + a3);
  }

  that.widen = function () {
    return;
  }

  that.thin = function() {
    return;
  }

  return that;
};