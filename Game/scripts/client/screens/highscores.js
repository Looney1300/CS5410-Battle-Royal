BattleRoyal.screens['high-scores'] = (function(game) {
	'use strict';

	function initialize() {
		console.log('initialized high scores screen');

		
		document.getElementById('id-high-scores-back').addEventListener(
			'click',
			function() { game.showScreen('main-menu'); });
    }

    function appendToTable(table,data){
        table.innerHTML += "<tr><td>" + data.name + "</td><td>" + data.score + "</td></tr>";
    }
    
	
	function run() {
        console.log('went to the high scores screen');
        var table = document.getElementById('highScoresTable');
        table.innerHTML = "<tr><th>Name:</th><th>Score:</th></tr>";
        
        //not sure how this loading from a file works, seems like it has to be done by the server based on what I've read online
        //load the high scores from the file
        //high scores will be stored in the form:
        //Name: score:
        //display the high scores on the screen
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(BattleRoyal.game));