// ------------------------------------------------------------------
//
// Rendering function for a mini map object.
//
// ------------------------------------------------------------------
MyGame.renderer.MiniMap = (function(graphics) {
  'use strict';
  let that = {};
  let clippings = [{
    x: 128,
    y: 0,
    size: {
      width: 32,
      height: 32
    }
  }, {
    x: 64,
    y: 32,
    size: {
      width: 32,
      height: 32
    }
  }
];
  let timeCoord = { x: 0.15, y: 1.03 };
  let timeIconCoord = { x: 0.0, y: 1.02 };
  let playerCountCoord = { x: 0.75, y: 1.03 };
  let playerIconCoord = { x: 0.6, y: 1.02 };

  let size = {
    width: 0.1,
    height: 0.1
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

  that.render = function(miniMap, mapTexture, playerTexture, mapIconTexture, bleuMapTexture, shield, playerCount) {
    
    graphics.drawImageMini(bleuMapTexture, miniMap.center, miniMap.size);
    //clipping
    graphics.saveContextMini();
    localShield.center = miniMap.convertToMiniMapCords(shield.worldCordinates);
    localShield.radius = miniMap.convertRadius(shield.radius);
    graphics.drawMiniMapCircle(localShield, false);
    graphics.enableMiniMapClipping();
    graphics.drawImageMini(mapTexture, miniMap.center, miniMap.size);
    graphics.disableMiniMapClipping();
    //next shield
    localNextShield.center = miniMap.convertToMiniMapCords(shield.nextWorldCordinates);
    localNextShield.radius = miniMap.convertRadius(shield.nextRadius);
    graphics.saveContextMini();
    graphics.enableMiniMapClipping();
    graphics.drawMiniMapCircle(localNextShield, true);
    graphics.disableMiniMapClipping();
    //icons below map
    graphics.drawCroppedImageMini(mapIconTexture, timeIconCoord, size, clippings[0]);
    graphics.drawMiniMapText(milisecondsToTime(shield.timeTilNextShield), timeCoord);
    graphics.drawCroppedImageMini(mapIconTexture, playerIconCoord, size, clippings[1]);
    graphics.drawMiniMapText(playerCount + 1, playerCountCoord);
    //player arrow on map
    graphics.saveContextMini();
    graphics.rotateCanvasMini(miniMap.player.center, miniMap.player.direction);
    graphics.drawImageMini(playerTexture, miniMap.player.center, miniMap.player.size);
    graphics.restoreContextMini();
  };

  return that;

}(MyGame.graphics));