BattleRoyal.screens['high-scores'] = (function(game) {
	'use strict';

	function initialize() {
		console.log('initialized high scores screen');
        game.sendHighScoresRequest();
		
		document.getElementById('id-high-scores-back').addEventListener(
			'click',
			function() { game.showScreen('main-menu'); });
    }

    function appendToTable(table,data){
        table.innerHTML += "<tr><td>" + data.name + "</td><td>" + data.score + "</td></tr>";
    }
    
	
	function run() {
        //wanted to do a game send high scores request here, but it's too slow, need to send it to each client after the server gets the updated scores at the end of each game
        game.sendHighScoresRequest();
        console.log('went to the high scores screen');
        var table = document.getElementById('highScoresTable');
        table.innerHTML = "<tr><th>Name:</th><th>Score:</th></tr>";

        let highScores = game.getHighScores();
        if (highScores != null){
            for (var i = 0; i < highScores.length; ++i){
                table.innerHTML += "<tr><td>" + highScores[i].name + "</td><td>" + highScores[i].score  + "</td></tr>";
            }
        }
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(BattleRoyal.game));