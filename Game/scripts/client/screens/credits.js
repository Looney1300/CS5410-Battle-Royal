BattleRoyal.screens['credits'] = (function(game) {
  'use strict';

  function initialize() {
    console.log('credits running initialize');
  }

  function run() {
    console.log('credits running');
  }

  return {
    initialize : initialize,
    run : run
  };

}(BattleRoyal.game));