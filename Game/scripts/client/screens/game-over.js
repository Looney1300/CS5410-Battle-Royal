MyGame.screens['game-over'] = (function() {
    'use strict';
    let socket = MyGame.main.socket;
    var table = document.getElementById('rankTable');
    function initialize() {
      //console.log('game-over is inited');
      document.getElementById('game').style.backgroundImage = 'url(../assets/landingBackground.png)';
      document.getElementById('id-game-over-back').addEventListener(
        'click',
        function() {
          MyGame.pregame.showScreen('main-menu');
        }
      );

    }
  
    function run() {
      socket.emit('score-request','hitme!');
      //this response takes a minute to get out to each client.
      socket.on('score-response',data => {
        console.log(data);
        for (var i = 0; i < data.length; i++){
          table.innerHTML += "<tr><td>" + data[i].name + "</td><td>" + data[i].score  + "</td><td>" + data[i].kills + "</td><td>" + data[i].killer + "</td></tr>";
        }
      });
      MyGame.assets['gameover'].play();
      table.innerHTML = "<tr><th>Name:</th><th>Score:</th><th>Kills:</th><th>Killer:</th></tr>"; //name score kills killer
    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());