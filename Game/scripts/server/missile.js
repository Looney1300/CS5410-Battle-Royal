// ------------------------------------------------------------------
//
// Nodejs module that represents the model for a missile.
//
// ------------------------------------------------------------------
'use strict';

//------------------------------------------------------------------
//
// Public function used to initially create a newly fired missile.
//
//------------------------------------------------------------------
function createMissile(spec) {
    let that = {};

    let radius = 0.0015;
    let collision_radius = 5;
    let speed = spec.speed;    // unit distance per millisecond
    let timeRemaining = spec.timeRemaining;   // milliseconds

    Object.defineProperty(that, 'clientId', {
        get: () => spec.clientId
    });

    Object.defineProperty(that, 'id', {
        get: () => spec.id
    });

    Object.defineProperty(that, 'direction', {
        get: () => spec.direction
    });

    Object.defineProperty(that, 'worldCordinates', {
        get: () => spec.worldCordinates
    });

    Object.defineProperty(that, 'radius', {
        get: () => radius
    });

    Object.defineProperty(that, 'collision_radius', {
        get: () => collision_radius
    });

    Object.defineProperty(that, 'speed', {
        get: () => speed
    });

    Object.defineProperty(that, 'timeRemaining', {
        get: () => timeRemaining,
        set: value => timeRemaining = value
    });

    //------------------------------------------------------------------
    //
    // Function used to update the missile during the game loop.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime) {
        let vectorX = Math.cos(spec.direction);
        let vectorY = Math.sin(spec.direction);

        spec.worldCordinates.x += (vectorX * elapsedTime * speed);
        spec.worldCordinates.y += (vectorY * elapsedTime * speed);

        timeRemaining -= elapsedTime;

        if (timeRemaining <= 0) {
            return false;
        } else {
            return true;
        }
    };

    return that;
}

module.exports.create = (spec) => createMissile(spec);
