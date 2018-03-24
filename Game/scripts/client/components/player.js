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

    Object.defineProperty(that, 'position', {
        get: () => position
    });



    that.update = function(elapsedTime) {
    };

    return that;
};
