MyGame.components.Shield = function(){
    'use strict';
    let that = {};
    let radius = 0;
    let nextRadius = 0;
    let worldCordinates = {x: 0, y: 0};
    let position = {x: 0, y: 0};
    let timeTilNextShield = 0;
    let nextPosition = {};

    Object.defineProperty(that, 'position', {
        get: () => position,
        set: (value) => { position = value }
    });

    Object.defineProperty(that, 'worldCordinates', {
        get: () => worldCordinates,
        set: (value) => { worldCordinates = value }
    });

    Object.defineProperty(that, 'nextWorldCordinates', {
        get: () => nextPosition,
        set: (value) => { nextPosition = value }
    });

    Object.defineProperty(that, 'radius', {
        get: () => radius,
        set: (value) => { radius = value }
    });

    Object.defineProperty(that, 'collision_radius', {
        get: () => radius,
        set: (value) => { radius = value }
    });

    Object.defineProperty(that, 'timeTilNextShield', {
        get: () => timeTilNextShield,
        set: (value) => { timeTilNextShield = value }
    });

    Object.defineProperty(that, 'nextRadius', {
        get: () => nextRadius,
        set: (value) => { nextRadius = value }
    });

    that.update = function(elapsedTime, viewPort){
        position.x = .5 - (viewPort.center.x - worldCordinates.x)/viewPort.width;
        position.y = .5 - (viewPort.center.y - worldCordinates.y)/viewPort.height;
    }

    return that;
};
