MyGame.screens['high-scores'] = (function() {
    'use strict';
  
    function initialize() {
      console.log('high score is inited');
      document.getElementById('id-high-scores-back').addEventListener(
        'click',
        function() {
          MyGame.pregame.showScreen('main-menu');
        }
      );

      MyGame.pregame.requestHighScores();
    }
  
    function run() {
      MyGame.pregame.requestHighScores();
      console.log('high scores is running');

      let highScores = MyGame.pregame.getHighScores();
      var table = document.getElementById('highScoresTable');
      table.innerHTML = "<tr><th>Name:</th><th>Score:</th></tr>";

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
  
  }());