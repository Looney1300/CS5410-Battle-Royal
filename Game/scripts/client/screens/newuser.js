BattleRoyal.screens['new-user'] = (function(game) {
	'use strict';
	let validUsers = null;
	function initialize() {
		game.requestValidUsers();
        document.getElementById('id-create-user').addEventListener(
			'click',
			function() { 
                //check to see if valid user, not already used before, we can talk about constrains on username and password
				//send a request to the server to create a new user
				var name = document.getElementById('newUserName');
				var password = document.getElementById('newUserPassword');
				if (!userAlreadyTaken(name.value)){

					game.requestCreateUser({
						name: name.value,
						password: password.value
					});
				}
				else{
					window.alert("Username " + name.value + " is already taken!");
					//alert the user that the username is already taken
				}
             });

		document.getElementById('id-new-user-back').addEventListener(
			'click',
			function() { game.showScreen('main-menu'); });
	}

	function userAlreadyTaken(name){
		//check to see if the username is already taken
		if (validUsers != null){
			for (var i = 0; i < validUsers.length; ++i){
				if (validUsers[i].name === name){
					return true;
				}
			}
		}
		return false;
	}
	
	function run() {
		game.requestValidUsers();
		console.log('running new user screen');
		//get the list of already existing users from the server
		validUsers = game.getValidUsers();
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(BattleRoyal.game));
