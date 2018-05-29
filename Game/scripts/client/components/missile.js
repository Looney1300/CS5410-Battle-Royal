//------------------------------------------------------------------
//
// Model for each missile in the game.
//
//------------------------------------------------------------------
MyGame.components.Missile = function(spec) {
    'use strict';
    let that = {};

    let worldCordinates = {
        x: spec.worldCordinates.x,
        y: spec.worldCordinates.y
    };

    let position = {
        x: 0,
        y: 0
    };

    Object.defineProperty(that, 'worldCordinates', {
        get: () => worldCordinates
    });

    Object.defineProperty(that, 'position', {
        get: () => position
    });

    Object.defineProperty(that, 'radius', {
        get: () => spec.radius
    });

    Object.defineProperty(that, 'id', {
        get: () => spec.id
    });

    //------------------------------------------------------------------
    //
    // Update the position of the missle.  We don't receive updates from
    // the server, because the missile moves in a straight line until it
    // explodes.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime, viewPort) {
        let vectorX = Math.cos(spec.direction);
        let vectorY = Math.sin(spec.direction);

        this.worldCordinates.x += (vectorX * elapsedTime * spec.speed);
        this.worldCordinates.y += (vectorY * elapsedTime * spec.speed);

        spec.timeRemaining -= elapsedTime;

        let diffX = (Math.abs(viewPort.center.x - this.worldCordinates.x))/viewPort.width;
        let diffY = (Math.abs(viewPort.center.y - this.worldCordinates.y))/viewPort.height;
        if (this.worldCordinates.x < viewPort.center.x){
            this.position.x = 0.5 - diffX;
        }
        else {
            this.position.x = 0.5 + diffX;
        }
        if (this.worldCordinates.y < viewPort.center.y) {
            this.position.y = 0.5 - diffY;
        }
        else {
            this.position.y = 0.5 + diffY;
        }

        if (spec.timeRemaining <= 0) {
            return false;
        } else {
            return true;
        }
    };

    return that;
};
