// ------------------------------------------------------------------
//
// Rendering function for a mini map object.
//
// ------------------------------------------------------------------
MyGame.renderer.MiniMap = (function(graphics) {
  'use strict';
  let that = {};
  let clipping = {
    x: 128,
    y: 0,
    size: {
      width: 32,
      height: 32
    }
  };
  let cord = {
    x: 0.05,
    y: 0.05
  };
  let size = {
    width: 0.03,
    height: 0.03
  };

  let localShield = {
    center: {
      x: 0,
      y: 0
    },
    radius: 0
  }
  let localNextShield = {
    center: {
      x: 0,
      y: 0
    },
    radius: 0
  }

  function format(time) {
    if (time < 10) {
      time = "0" + time;
    }
    return time;
  }

  function milisecondsToTime(mili) {
    let ms = mili % 1000;
    mili = (mili - ms) / 1000;
    let seconds = mili % 60;
    mili = (mili - seconds) / 60;
    let minutes = mili % 60;

    return format(minutes) + ":" + format(seconds);
  }

  that.render = function(miniMap, mapTexture, playerTexture, mapIconTexture, bleuMapTexture, shield, viewPort, playerCount) {
    
    // if (shield.radius <= 1600){
      
      graphics.drawImage(bleuMapTexture, miniMap.center, miniMap.size);
      //clipping
      graphics.saveContext();
      localShield.center = miniMap.convertToMiniMapCords(shield.worldCordinates, viewPort);
      localShield.radius = miniMap.convertRadius(shield.radius);
      graphics.drawMiniMapCircle(localShield, false);
      graphics.enableMiniMapClipping();
      graphics.drawImage(mapTexture, miniMap.center, miniMap.size);
      graphics.disableMiniMapClipping();
      // graphics.restoreContext();
      // }
      // else {
        // graphics.drawImage(mapTexture, miniMap.center, miniMap.size);
        // }
    //next shield
    localNextShield.center = miniMap.convertToMiniMapCords(shield.nextWorldCordinates, viewPort);
    localNextShield.radius = miniMap.convertRadius(shield.nextRadius);
    graphics.saveContext();
    graphics.drawRectangle(miniMap.center, miniMap.size);
    graphics.enableMiniMapClipping();
    graphics.drawMiniMapCircle(localNextShield, true);
    graphics.disableMiniMapClipping();
    //icons below map
    cord.x = miniMap.center.x - (miniMap.size.width / 2);
    cord.y = miniMap.center.y + (miniMap.size.height / 2) + 0.01;
    clipping.x = 128;
    clipping.y = 0;
    graphics.drawCroppedImage(mapIconTexture, cord, size, clipping);
    cord.x += 0.04;
    cord.y += 0.02;
    graphics.drawTime(milisecondsToTime(shield.timeTilNextShield), cord);
    cord.x += 0.08;
    cord.y -= 0.02;
    clipping.x = 64;
    clipping.y = 32;
    graphics.drawCroppedImage(mapIconTexture, cord, size, clipping);
    cord.x += 0.04;
    cord.y += 0.02;
    graphics.drawTime(playerCount + 1, cord);
    graphics.saveContext();
    graphics.rotateCanvas(miniMap.player.center, miniMap.player.direction);
    graphics.drawImage(playerTexture, miniMap.player.center, miniMap.player.size);
    graphics.restoreContext();
  };

  return that;

}(MyGame.graphics));