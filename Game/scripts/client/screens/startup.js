MyGame.screens['startup'] = (function() {
	'use strict';
	//set the music to loop automatically
	if (typeof MyGame.assets['background'].loop == 'boolean')
	{
		MyGame.assets['background'].loop = true;
	}
	else
	{
		MyGame.assets['background'].addEventListener('ended', function() {
			MyGame.assets['background'].currentTime = 0;
			MyGame.assets['background'].play();
		}, false);
	}

	MyGame.assets['background'].volume = 1.0;
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
		//start the background music
		MyGame.assets['background'].play();
	}
	
	return {
		initialize : initialize,
		run : run
	};
}());