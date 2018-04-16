
(function (exports) {
  'use strict';

  exports.create = function() {
    let that = {};
    let mapFile = null;
    let map = [];
    let tileWidth = 0;
    let tileHeight = 0;
    let mapWidth = 0;
    let mapHeight = 0;

    that.setMap = function(file){
      mapFile = file;
      map = [];
      let index = 0;
      for (let i = 0; i < mapFile.height; i++){
          map.push([]);
          for (let j = 0; j < mapFile.width; j++){
              if (mapFile.layers[1].data[index] == 0){
                map[i].push(1);
              }
              else {
                map[i].push(mapFile.layers[1].data[index]);
              }
              index++;
          }
      }
      tileWidth = mapFile.tilewidth;
      tileHeight = mapFile.tileheight;
      mapWidth = mapFile.width * mapFile.tilewidth;
      mapHeight = mapFile.height * mapFile.tileheight;
    }
    // let image = new Image();

    // image.onload = function() {
    //   ready = true;
    // };

    // image.src = mapFile.tilesets[1].image;


    Object.defineProperty(that, 'mapFile', {
      get: () => mapFile
    });

    Object.defineProperty(that, 'map', {
      get: () => map
    });

    Object.defineProperty(that, 'tileWidth', {
      get: () => tileWidth
    });

    Object.defineProperty(that, 'tileHeight', {
      get: () => tileHeight
    });

    Object.defineProperty(that, 'mapWidth', {
      get: () => mapWidth
    });

    Object.defineProperty(that, 'mapHeight', {
      get: () => mapHeight
    });

    Object.defineProperty(that, 'image', {
      get: () => image
    });

    that.isValid = function(row, col){
      if (row < 0 || row > mapHeight){
        return false;
      }
      if (col < 0 || col > mapWidth){
        return false;
      }
      let cellRowIndex = Math.floor(row / tileHeight);
      let cellColIndex = Math.floor(col / tileWidth);
      if (map[cellRowIndex][cellColIndex] != 1){
        return false;
      }
      return true;
    };

    return that;
};

})(typeof exports === 'undefined' ? this['Map'] = {} : exports);