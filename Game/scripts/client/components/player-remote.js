//------------------------------------------------------------------
//
// Model for each remote player in the game.
//
//------------------------------------------------------------------
BattleRoyal.components.PlayerRemote = function() {
    'use strict';
    let that = {};

    let state = {
        position: {
            x: 0,
            y: 0
        }
    };


    Object.defineProperty(that, 'state', {
        get: () => state
    });


    //------------------------------------------------------------------
    //
    // Update of the remote player is a simple linear progression/interpolation
    // from the previous state to the goal (new) state.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime) {

    };

    return that;
};
