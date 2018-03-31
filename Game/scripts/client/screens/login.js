MyGame.screens['login'] = (function() {

	'use strict';

	let socket = MyGame.main.socket;

	function initialize() {
		socket.on(NetworkIds.VALID_USER, data =>{
			MyGame.pregame.showScreen('main-menu');
		});

		socket.on(NetworkIds.INVALID_USER, data =>{
			window.alert("Error Invalid Credentials! Username or password incorrect!");
		});

		socket.on(NetworkIds.INVALID_CREATE_USER, data => {
			window.alert("Error Invalid Credentials! Password must be between 8 and 15 characters. \nUsername must be unique and must contain at least 5 characters.");
		});

		socket.on(NetworkIds.VALID_CREATE_USER, data => {
			MyGame.pregame.showScreen('main-menu');
		})


        document.getElementById('id-create-user').addEventListener(
			'click',
			function() { 
				var name = document.getElementById('newUserName');
				var password = document.getElementById('newUserPassword');
				if (name.value.length >= 5 && password.value.length > 7 && password.value.length < 16){
					console.log("Sending create user request");
					socket.emit(NetworkIds.VALID_CREATE_USER, {
						name: name.value,
						password: password.value
					});
				}
				else{
					window.alert("Error Invalid Credentials! Password must be between 8 and 15 characters. \nUsername must be unique and must contain at least 5 characters.");
				}
				clearFields();
             });

        document.getElementById('id-login-user').addEventListener(
            'click',
            function(){
                var name = document.getElementById('newUserName');
                var password = document.getElementById('newUserPassword');
				socket.emit(NetworkIds.VALID_USER, {
					name: name.value,
					password: password.value
				});
            });
    }

	function clearFields(){
		var name = document.getElementById('newUserName');
		var password = document.getElementById('newUserPassword');
		name.value = '';
		password.value = '';
	}


	function run() {
		console.log('running login screen');
	}

	return {
		initialize : initialize,
		run : run
	};



}());