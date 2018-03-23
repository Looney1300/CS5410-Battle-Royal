BattleRoyal.screens['credits'] = (function(game) {
  'use strict';

  function initialize() {
    document.getElementById('id-about-back').addEventListener(
			'click',
			function() { game.showScreen('main-menu'); });
  }

  function run() {
    console.log('credits running');
  }

  return {
    initialize : initialize,
    run : run
  };

}(BattleRoyal.game));