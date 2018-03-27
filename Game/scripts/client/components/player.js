//------------------------------------------------------------------
//
// Model for each player in the game.
//
//------------------------------------------------------------------
BattleRoyal.components.Player = function() {
    'use strict';
    let that = {};
    let position = {
        x: 0,
        y: 0
    };

    let state = '';

    Object.defineProperty(that, 'position', {
        get: () => position
    });

    Object.defineProperty(that, 'state', {
        get: () => state,
        set: value => state = value
    });



    that.update = function(elapsedTime) {
    };

    return that;
};
