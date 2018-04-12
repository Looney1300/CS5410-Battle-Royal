//------------------------------------------------------------------
//
// Model for each remote player in the game.
//
//------------------------------------------------------------------
MyGame.components.PowerUp = function(spec) {
    'use strict';
    let that = {};
    let size = {
        width: 0.05,
        height: 0.05
    };

    let worldCordinates = spec.worldCordinates;

    let position = {
        x: 0,
        y: 0
    };

    let type = spec.type;

    let radius = spec.radius;


    Object.defineProperty(that, 'radius', {
        get: () => radius
    });

    Object.defineProperty(that, 'size', {
        get: () => size
    });

    Object.defineProperty(that, 'type', {
        get: () => type
    });

    Object.defineProperty(that, 'worldCordinates', {
        get: () => worldCordinates
    });

    Object.defineProperty(that, 'position', {
        get: () => position
    });

    //------------------------------------------------------------------
    //
    // Update of the remote player is a simple linear progression/interpolation
    // from the previous state to the goal (new) state.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime, viewPort) {


        // figure out where to put them on screen in relation to viewport
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

    };

    return that;
};
