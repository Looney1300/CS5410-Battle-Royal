MyGame.screens['high-scores'] = (function() {
    'use strict';
  
    let socket = MyGame.main.socket;
    let highScores = null;

    function initialize() {
      console.log('high score is inited');

      socket.on(NetworkIds.HIGH_SCORES,data =>{
        highScores = data;
      });

      socket.emit(NetworkIds.HIGH_SCORES,null);
      
      document.getElementById('id-high-scores-back').addEventListener(
        'click',
        function() {
          MyGame.pregame.showScreen('main-menu');
        }
      );
    }
  
    function run() {
      socket.emit(NetworkIds.HIGH_SCORES,null);
      console.log('high scores is running');
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