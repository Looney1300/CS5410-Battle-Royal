//------------------------------------------------------------------
//
// Model for each remote player in the game.
//
//------------------------------------------------------------------
MyGame.components.PlayerRemote = function() {
    'use strict';
    let that = {};
    let size = {
        width: 0.05,
        height: 0.05
    };
    let state = {
        direction: 0,
        worldCordinates: {
            x: 0,
            y: 0
        },
        position: {
            x: 0,
            y: 0
        }
    };
    let goal = {
        direction: 0,
        worldCordinates: {
            x: 0,
            y: 0
        },
        updateWindow: 0      // Server reported time elapsed since last update
    };

    let is_alive = true;


    let killer = '';

    let wasNewlyKilled = true;

    let userName = '';

    Object.defineProperty(that, 'userName', {
        get: () => userName,
        set: value => userName = value
    })

    Object.defineProperty(that, 'wasNewlyKilled', {
        get: () => wasNewlyKilled,
        set: value => wasNewlyKilled = value
    })

    Object.defineProperty(that, 'killer', {
        get: () => killer,
        set: value => killer = value
    })

    Object.defineProperty(that, 'is_alive', {
        get: () => is_alive,
        set: value => is_alive = value
    });

    Object.defineProperty(that, 'state', {
        get: () => state,
        set: value => state = value
    });

    Object.defineProperty(that, 'goal', {
        get: () => goal,
        set: value => goal = value
    });

    Object.defineProperty(that, 'size', {
        get: () => size
    });


    //------------------------------------------------------------------
    //
    // Update of the remote player is a simple linear progression/interpolation
    // from the previous state to the goal (new) state.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime, viewPort) {
        // Protect agains divide by 0 before the first update from the server has been given
        if (goal.updateWindow === 0) {
            return;
        }

        let updateFraction = elapsedTime / goal.updateWindow;

        if (updateFraction > 0) {
            //
            // // update world cordinates.
            state.direction -= (state.direction - goal.direction) * updateFraction;

            state.worldCordinates.x -= (state.worldCordinates.x - goal.worldCordinates.x) * updateFraction;
            state.worldCordinates.y -= (state.worldCordinates.y - goal.worldCordinates.y) * updateFraction;

            // figure out where to put them on screen in relation to viewport
            let diffX = (Math.abs(viewPort.center.x - state.worldCordinates.x))/viewPort.width;
            let diffY = (Math.abs(viewPort.center.y - state.worldCordinates.y))/viewPort.height;
            if (state.worldCordinates.x < viewPort.center.x){
                state.position.x = 0.5 - diffX;
            }
            else {
                state.position.x = 0.5 + diffX;
            }
            if (state.worldCordinates.y < viewPort.center.y) {
                state.position.y = 0.5 - diffY;
            }
            else {
                state.position.y = 0.5 + diffY;
            }

        }
    };

    return that;
};
