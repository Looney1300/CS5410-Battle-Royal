

    let random = require ('../utilities/random');
    
MyGame.components.Shield = function(map, startDiameterAsPercentOfMapWidth, minutesBetweenShieldMoves){
    'use strict';
    let that = {};
    let firstRadius = map.mapWidth * startDiameterAsPercentOfMapWidth/2;
    let currentRadius = map.mapWidth*10;
    let nextRadius = firstRadius;
    let worldCordinates = {x: map.mapWidth/2, y: map.mapWidth/2};
    let position = {x: 0, y: 0};
    let waitTime = 1000 * 60 * minutesBetweenShieldMoves;
    let timeTilNextShield = waitTime;
    let percentLessEachShrink = .14;
    let nextPosition = {};
    let shieldMovesDone = 0;
    let shieldMovesTotal = 4;

    Object.defineProperty(that, 'position', {
        get: () => position
    });

    Object.defineProperty(that, 'worldCordinates', {
        get: () => worldCordinates
    });

    Object.defineProperty(that, 'nextWorldCordinates', {
        get: () => nextPosition
    });

    Object.defineProperty(that, 'radius', {
        get: () => currentRadius
    });

    Object.defineProperty(that, 'collision_radius', {
        get: () => currentRadius
    });

    Object.defineProperty(that, 'timeTilNextShield', {
        get: () => timeTilNextShield
    });

    Object.defineProperty(that, 'nextRadius', {
        get: () => nextRadius
    });

    that.update = function(elapsedTime){
        // position.x +=
    }

    return that;
};
