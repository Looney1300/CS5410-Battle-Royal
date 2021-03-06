// ------------------------------------------------------------------
//
// Nodejs module that represents the model for a player.
//
// ------------------------------------------------------------------
'use strict';

let randomFile = require ('../utilities/random');

//------------------------------------------------------------------
//
// Public function used to initially create a newly connected player
// at some random location.
//
//------------------------------------------------------------------
function createPowerUp(mapLogic, PowerUptype) {
    let that = {};
    let map = mapLogic;
    let random = randomFile.create();

    let worldCordinates = random.getRandomMapCords(map, map.mapHeight, map.mapWidth);

    let size = {
        width: 0.01,
        height: 0.01,
        radius: 0.02
    };

    let indexId = -1;

    let type = PowerUptype;

    let collision_radius = 15;

    Object.defineProperty(that, 'indexId', {
        get: () => indexId,
        set: value => indexId = value
    });

    Object.defineProperty(that, 'type', {
        get: () => type
    });

    Object.defineProperty(that, 'size', {
        get: () => size
    });

    Object.defineProperty(that, 'radius', {
        get: () => size.radius
    });

    Object.defineProperty(that, 'collision_radius', {
        get: () => collision_radius
    });

    Object.defineProperty(that, 'worldCordinates', {
        get: () => worldCordinates,
        set: value => worldCordinates = value
    });
    

    that.movePowerUp = function(){
        this.worldCordinates = random.getRandomMapCords(map, map.mapHeight, map.mapWidth);
    };

 

    that.update = function(when) {
    };

    return that;
}

module.exports.create = (mapLogic, PowerUptype) => createPowerUp(mapLogic, PowerUptype);
