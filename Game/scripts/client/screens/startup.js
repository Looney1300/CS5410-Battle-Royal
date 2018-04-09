MyGame.screens['startup'] = (function() {
	'use strict';
	
	function initialize() {
		console.log('startup screen initialized');
		
		document.getElementById('id-login').addEventListener(
            'click',
            function(){
                MyGame.pregame.showScreen('login');
            }
        )

        document.getElementById('id-register').addEventListener(
            'click',
            function(){
                MyGame.pregame.showScreen('register-user');
            }
        )

	}
	
	function run() {
		console.log('startup is running');
	}
	
	return {
		initialize : initialize,
		run : run
	};
}());