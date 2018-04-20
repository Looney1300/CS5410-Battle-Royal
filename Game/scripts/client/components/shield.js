MyGame.components.Shield = function(){
    'use strict';
    let that = {};
    let radius = 0;
    let nextRadius = 0;
    let worldCordinates = {x: 0, y: 0};
    let position = {x: 0, y: 0};
    let MINUTES_BETWEEN_SHIELD_MOVES = 2; // This must be the same as at server.
    let waitTime = 1000 * 60 * MINUTES_BETWEEN_SHIELD_MOVES;    
    let timeTilNextShield = 0;
    let nextWorldCordinates = {};

    Object.defineProperty(that, 'position', {
        get: () => position,
        set: (value) => { position = value }
    });

    Object.defineProperty(that, 'worldCordinates', {
        get: () => worldCordinates,
        set: (value) => { worldCordinates = value }
    });

    Object.defineProperty(that, 'nextWorldCordinates', {
        get: () => nextWorldCordinates,
        set: (value) => { nextWorldCordinates = value }
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
        if (timeTilNextShield < waitTime/2){
            //Find how much exactly to subtract from each new shield.
            let differenceInRadii = radius - nextRadius;
            //ShrinkRate is equal to the distance to travel divided by the time to travel
            let shrinkRate = differenceInRadii/(waitTime/2);
    
            let gameStarted = false;
            let diffX = nextWorldCordinates.x - worldCordinates.x;
            let diffY = nextWorldCordinates.y - worldCordinates.y;
            worldCordinates.x += elapsedTime * diffX/(waitTime/2);
            worldCordinates.y += elapsedTime * diffY/(waitTime/2);
            radius -= elapsedTime * shrinkRate;
        }
        // Conversion to screen position.
        position.x = .5 - (viewPort.center.x - worldCordinates.x)/viewPort.width;
        position.y = .5 - (viewPort.center.y - worldCordinates.y)/viewPort.height;
    }

    return that;
};
