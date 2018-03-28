BattleRoyal.screens['game-play'] = (function(game) {
    'use strict';
  
    function initialize() {
      console.log('game-play running initialize');

    }
  
    function run() {
      console.log('game-play running');
    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }(BattleRoyal.game));