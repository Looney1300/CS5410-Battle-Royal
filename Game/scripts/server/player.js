// ------------------------------------------------------------------
//
// Nodejs module that represents the model for a player.
//
// ------------------------------------------------------------------
'use strict';

let random = require ('../utilities/random');

//------------------------------------------------------------------
//
// Public function used to initially create a newly connected player
// at some random location.
//
//------------------------------------------------------------------
function createPlayer(mapLogic) {
    let that = {};
    let map = mapLogic;
    
    let position = {
        x: 0.5,
        y: 0.5
    };

    let worldCordinates = random.getRandomMapCords(map, map.mapHeight, map.mapWidth);

    let size = {
        width: 0.01,
        height: 0.01,
        radius: 0.02
    };
    let direction = random.nextDouble() * 2 * Math.PI;    // Angle in radians
    let rotateRate = Math.PI / 1000;    // radians per millisecond
    let speed = 0.2;                  // unit distance per millisecond
    let reportUpdate = false;    // Indicates if this model was updated during the last update
    let moveRate = 200;

    Object.defineProperty(that, 'direction', {
        get: () => direction
    });

    Object.defineProperty(that, 'position', {
        get: () => position
    });

    Object.defineProperty(that, 'size', {
        get: () => size
    });

    Object.defineProperty(that, 'speed', {
        get: () => speed
    })

    Object.defineProperty(that, 'rotateRate', {
        get: () => rotateRate
    });

    Object.defineProperty(that, 'reportUpdate', {
        get: () => reportUpdate,
        set: value => reportUpdate = value
    });

    Object.defineProperty(that, 'radius', {
        get: () => size.radius
    });

    Object.defineProperty(that, 'worldCordinates', {
        get: () => worldCordinates
    });

    //------------------------------------------------------------------
    //
    // Moves the player forward based on how long it has been since the
    // last move took place.
    //
    //------------------------------------------------------------------
    that.move = function(elapsedTime) {
        reportUpdate = true;
        let vectorX = Math.cos(direction);
        let vectorY = Math.sin(direction);

    };

    that.moveUp = function(elapsedTime) {
        reportUpdate = true;
        let move = speed * elapsedTime;
        if (map.isValid(worldCordinates.y - move, worldCordinates.x)){
            worldCordinates.y -= move;
        }
    };

    that.moveDown = function(elapsedTime) {
        reportUpdate = true;
        let move = speed * elapsedTime;
        if (map.isValid(worldCordinates.y + move, worldCordinates.x)){
            worldCordinates.y += move;
        }
    };

    that.moveLeft = function(elapsedTime) {
        reportUpdate = true;
        let move = speed * elapsedTime;
        if (map.isValid(worldCordinates.y, worldCordinates.x - move)){
            worldCordinates.x -= move;
        }
    };

    that.moveRight = function(elapsedTime) {
        reportUpdate = true;
        let move = speed * elapsedTime;
        if (map.isValid(worldCordinates.y, worldCordinates.x + move)){
            worldCordinates.x += move;
        }
    };

    

    //------------------------------------------------------------------
    //
    // Rotates the player right based on how long it has been since the
    // last rotate took place.
    //
    //------------------------------------------------------------------
    that.rotateRight = function(elapsedTime) {
        reportUpdate = true;
        direction += (rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Rotates the player left based on how long it has been since the
    // last rotate took place.
    //
    //------------------------------------------------------------------
    that.rotateLeft = function(elapsedTime) {
        reportUpdate = true;
        direction -= (rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Function used to update the player during the game loop.
    //
    //------------------------------------------------------------------
    that.update = function(when) {
    };

    return that;
}

module.exports.create = mapLogic => createPlayer(mapLogic);
