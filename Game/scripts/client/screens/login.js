MyGame.screens['login'] = (function() {

	'use strict';

	let socket = MyGame.main.socket;


	function initialize() {

		socket.on(NetworkIds.VALID_USER, data =>{
			MyGame.pregame.showScreen('main-menu');
		});

		socket.on(NetworkIds.INVALID_USER, data =>{
			window.alert("Error Invalid Credentials! Username or password incorrect, or user is already logged in!");
			clearFields();
		});

        document.getElementById('id-login-user').addEventListener(
            'click',
            function(){
                var name = document.getElementById('userName');
                var password = document.getElementById('userPassword');
				socket.emit(NetworkIds.VALID_USER, {
					name: name.value,
					password: password.value
				});
			});
			
		document.getElementById('id-login-user-back').addEventListener(
			'click',
			function(){
				clearFields();
				MyGame.pregame.showScreen('startup');
			}
		)
    }

	function clearFields(){
		var name = document.getElementById('userName');
		var password = document.getElementById('userPassword');
		name.value = '';
		password.value = '';
	}


	function run() {
		console.log('running login screen');
		clearFields();
	}

	return {
		initialize : initialize,
		run : run
	};


}());