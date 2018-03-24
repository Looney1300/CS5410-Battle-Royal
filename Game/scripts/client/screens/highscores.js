BattleRoyal.screens['high-scores'] = (function(game) {
	'use strict';
	
	function initialize() {
		console.log('initialized high scores screen');

		
		document.getElementById('id-high-scores-back').addEventListener(
			'click',
			function() { game.showScreen('main-menu'); });
	}
	
	function run() {
		console.log('on the high scores screen');
        //send a request to the server to get the high scores
        //display the high scores on the screen
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(BattleRoyal.game));