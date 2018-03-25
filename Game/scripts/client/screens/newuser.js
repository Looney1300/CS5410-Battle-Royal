BattleRoyal.screens['new-user'] = (function(game) {
	'use strict';
	
	function initialize() {

        document.getElementById('id-create-user').addEventListener(
			'click',
			function() { 
                //check to see if valid user, not already used before, we can talk about constrains on username and password
                //send a request to the server to create a new user
             });

		document.getElementById('id-new-user-back').addEventListener(
			'click',
			function() { game.showScreen('main-menu'); });
	}
	
	function run() {
		console.log('running new user screen');
		//get the list of already existing users from the server
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(BattleRoyal.game));
