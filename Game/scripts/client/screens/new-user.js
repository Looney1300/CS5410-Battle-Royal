MyGame.screens['new-user'] = (function() {

	'use strict';

	let validUsers = null;
	let socket = MyGame.main.socket;

	function initialize() {

		socket.emit(NetworkIds.VALID_USERS,null);
		
		socket.on(NetworkIds.VALID_USERS, data =>{
			console.log("Receiving valid users");
			validUsers = data;
			console.log(validUsers);
		});

        document.getElementById('id-create-user').addEventListener(
			'click',
			function() { 
                //check to see if valid user, not already used before, we can talk about constraints on username and password
				//send a request to the server to create a new user
				var name = document.getElementById('newUserName');
				var password = document.getElementById('newUserPassword');
				if (!userAlreadyTaken(name.value) && name.value.length > 5 && password.value.length > 7 && password.value.length < 16){
					socket.emit(NetworkIds.CREATE_NEW_USER, {
						name: name.value,
						password: password.value
					})
                    validUsers.push({
                        name: name.value,
                        password: password.value
					});
					clearFields();
				}
				else{
					window.alert("Error Invalid Credentials! Password must be between 8 and 15 characters. \nUsername must be unique and must contain at least 5 characters.");
					//alert the user that the username is already taken
				}
             });
		document.getElementById('id-new-user-back').addEventListener(
			'click',
			function() { MyGame.pregame.showScreen('main-menu'); });
	}

	function clearFields(){
		var name = document.getElementById('newUserName');
		var password = document.getElementById('newUserPassword');
		name.value = '';
		password.value = '';
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
		socket.emit(NetworkIds.VALID_USERS,null);
		console.log('running new user screen');
	}

	return {
		initialize : initialize,
		run : run
	};

}());