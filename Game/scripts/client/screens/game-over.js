MyGame.screens['game-over'] = (function() {
    'use strict';
    let socket = MyGame.main.socket;
    let table = document.getElementById('rankTable');
    function initialize() {
      document.getElementById('id-game-over-back').addEventListener(
        'click',
        function() {
          MyGame.pregame.showScreen('main-menu');
        }
      );
      socket.on('score-response',data => {
        for (var i = 0; i < data.length; i++){
          table.innerHTML += "<tr><td>" + data[i].name + "</td><td>" + data[i].score  + "</td><td>" + data[i].kills + "</td><td>" + data[i].killer + "</td></tr>";
        }
      });
    }
    
    function run() {
      table.innerHTML = "";
      MyGame.assets['gameover'].play();
      table.innerHTML = "<tr><th>Name:</th><th>Score:</th><th>Kills:</th><th>Killer:</th></tr>"; //name score kills killer
    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());