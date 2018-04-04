MyGame.screens['register-user'] = (function() {

	'use strict';

	let socket = MyGame.main.socket;

	function initialize() {

		socket.on(NetworkIds.INVALID_CREATE_USER, data => {
			window.alert("Error Invalid Credentials! Password must be between 8 and 15 characters. \nUsername must be unique and must contain at least 5 characters.");
		});

		socket.on(NetworkIds.VALID_CREATE_USER, data => {
			MyGame.pregame.showScreen('main-menu');
		})


        document.getElementById('id-register-user').addEventListener(
			'click',
			function() { 
				var name = document.getElementById('newUserName');
                var password = document.getElementById('newUserPassword');
                var passwordConfirm = document.getElementById('passwordConfirm');
                if (passwordConfirm.value !== password.value){
                    window.alert("Error Invalid Credentials! Password and confirmation do not match!");
                }
				else if (name.value.length >= 5 && password.value.length > 7 && password.value.length < 16){
					console.log("Sending create user request");
					socket.emit(NetworkIds.VALID_CREATE_USER, {
						name: name.value,
						password: password.value
					});
				}
				else{
					window.alert("Error Invalid Credentials! Password must be between 8 and 15 characters. \nUsername must be unique and must contain at least 5 characters.");
				}
             });

        document.getElementById('id-register-user-back').addEventListener(
            'click',
            function(){
                MyGame.pregame.showScreen('startup');
            }
        )

    }

	function clearFields(){
		var name = document.getElementById('newUserName');
        var password = document.getElementById('newUserPassword');
        var passwordConfirm = document.getElementById('passwordConfirm');
        
		name.value = '';
        password.value = '';
        passwordConfirm.value = '';
	}


	function run() {
		console.log('running register user screen');
	}

	return {
		initialize : initialize,
		run : run
	};



}());