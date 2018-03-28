MyGame.screens['main-menu'] = (function() {
	'use strict';
	
	function initialize() {
		console.log('main menu is inited!');
		
		document.getElementById('id-credits').addEventListener(
			'click',
			function() { 
                //console.log('where am I? here is game: ', game);
                MyGame.pregame.showScreen('credits'); 
            });

		document.getElementById('id-game-play').addEventListener(
			'click',
            function() { MyGame.pregame.showScreen('game-play'); });
            
        document.getElementById('id-join-room').addEventListener(
            'click',
			function() { MyGame.pregame.showScreen('join-room'); });

		document.getElementById('id-about').addEventListener(
			'click',
			function() { MyGame.pregame.showScreen('about'); });
		document.getElementById('id-options').addEventListener(
			'click',
			function() { MyGame.pregame.showScreen('options'); });
		document.getElementById('id-high-scores').addEventListener(
			'click',
			function() { MyGame.pregame.showScreen('high-scores'); });

	}
	
	function run() {
		console.log('main menu is running!');
		//
		// I know this is empty, there isn't anything to do.
	}
	
	return {
		initialize : initialize,
		run : run
	};
}());
